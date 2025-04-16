import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
  useReactFlow,
  Position,
  NodeProps,
  NodeChange,
  EdgeChange,
  applyNodeChanges,
  applyEdgeChanges,
  OnSelectionChangeParams,
} from '@xyflow/react';
import * as htmlToImage from 'html-to-image'; // Import html-to-image
import { getLayoutedElements } from './layoutUtils';
import OrgNode from './OrgNode';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    ContextMenu,
    ContextMenuContent,
    ContextMenuItem,
} from "@/components/ui/context-menu";

import '@xyflow/react/dist/style.css';

// --- Data Structure & Placeholder Data ---
// Ideally, this comes from API/state management
interface OrgNodeData {
  id: string; // Ensure data includes the node ID
  label: string; // Role Title
  name?: string; // Employee Name
  department?: string;
  avatar?: string;
  // For expand/collapse:
  hasChildren?: boolean; // Indicate if node can be expanded
  isExpanded?: boolean; // Current state (driven by component state, not stored here directly)
  handleNodeToggle?: (id: string) => void; // Callback function
  directReportsCount?: number; // Add field for span of control
  layerDepth?: number; // Add field for layer depth
  isBeyondThreshold?: boolean; // Add flag for highlighting deep nodes
  isSearchResult?: boolean; // Add flag for search highlight
}

// Add relationshipType to Edge data
interface OrgEdgeData {
    relationshipType?: 'primary' | 'secondary'; 
}

// Add 'id' and 'hasChildren' to placeholder data
const initialNodesData: Node<OrgNodeData>[] = [
    { id: '1', data: { id: '1', label: 'CEO', name: 'Jane Doe', hasChildren: true }, position: { x: 0, y: 0 }, type: 'orgNode' },
    { id: '2', data: { id: '2', label: 'VP Engineering', name: 'John Smith', hasChildren: true }, position: { x: 0, y: 0 }, type: 'orgNode' },
    { id: '3', data: { id: '3', label: 'VP Marketing', name: 'Alice Green', hasChildren: true }, position: { x: 0, y: 0 }, type: 'orgNode' },
    { id: '4', data: { id: '4', label: 'Lead Engineer', name: 'Bob White', hasChildren: false }, position: { x: 0, y: 0 }, type: 'orgNode' },
    { id: '5', data: { id: '5', label: 'Marketing Manager', name: 'Charlie Brown', hasChildren: false }, position: { x: 0, y: 0 }, type: 'orgNode' },
];

// Add relationshipType to initial edges (default to primary)
const initialEdgesData: Edge<OrgEdgeData>[] = [
    { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', data: { relationshipType: 'primary' } },
    { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', data: { relationshipType: 'primary' } },
    { id: 'e2-4', source: '2', target: '4', type: 'smoothstep', data: { relationshipType: 'primary' } },
    { id: 'e3-5', source: '3', target: '5', type: 'smoothstep', data: { relationshipType: 'primary' } },
    // Example of a secondary relationship (if needed later):
    // { id: 'e4-5', source: '4', target: '5', type: 'smoothstep', data: { relationshipType: 'secondary' } },
];

// Helper to get all child node IDs recursively (used for filtering)
const getChildNodeIds = (nodeId: string, edges: Edge<OrgEdgeData>[], nodes: Node<OrgNodeData>[]): string[] => {
    const directChildren = edges.filter(edge => edge.source === nodeId).map(edge => edge.target);
    let allChildren = [...directChildren];
    directChildren.forEach(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (childNode?.data.hasChildren) {
            allChildren = [...allChildren, ...getChildNodeIds(childId, edges, nodes)];
        }
    });
    return allChildren;
};

// Type for layout direction
type LayoutDirection = 'TB' | 'LR';

// --- Constants ---
const MAX_RECOMMENDED_DEPTH = 5; // Example threshold

// --- Utils ---
// Validation Helper: Check for cycles
const isValidConnection = (
    connection: Connection,
    nodes: Node<OrgNodeData>[],
    edges: Edge<OrgEdgeData>[]
): boolean => {
    const target = connection.target;
    const source = connection.source;

    if (!target || !source || target === source) {
        return false; // Cannot connect to self
    }

    // Traverse upwards from source to see if we reach target
    let currentNodeId: string | null = source;
    const visited = new Set<string>(); // Prevent infinite loops in case of existing cycles

    while (currentNodeId && !visited.has(currentNodeId)) {
        visited.add(currentNodeId);
        const parentEdge = edges.find(edge => edge.target === currentNodeId && edge.data?.relationshipType !== 'secondary'); // Follow primary links upwards
        if (!parentEdge) {
            currentNodeId = null; // Reached root or detached node
        } else {
            currentNodeId = parentEdge.source;
            if (currentNodeId === target) {
                console.warn("Connection creates a cycle!");
                return false; // Found target by traversing up from source - cycle!
            }
        }
    }

    return true; // No cycle detected
};

// --- Layouted Org Chart Component ---
const LayoutedOrgChart: React.FC = () => {
  const { fitView, getNodes, getEdges } = useReactFlow();

  // State for the *raw* data (source of truth)
  const [nodesRaw, setNodesRaw] = useState<Node<OrgNodeData>[]>(initialNodesData);
  const [edgesRaw, setEdgesRaw] = useState<Edge<OrgEdgeData>[]>(initialEdgesData);

  // State for the derived/layouted elements shown by ReactFlow
  const [layoutedNodes, setLayoutedNodes, applyLayoutedNodeChanges] = useNodesState<OrgNodeData>([]);
  const [layoutedEdges, setLayoutedEdges, applyLayoutedEdgeChanges] = useEdgesState<OrgEdgeData>([]);

  // Other state
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [layoutDirection, setLayoutDirection] = useState<LayoutDirection>('TB');
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [stats, setStats] = useState<{ maxDepth: number | null, averageDepth: number | null }>({ maxDepth: null, averageDepth: null });

  // State for context menu - store ID and position
  const [contextMenu, setContextMenu] = useState<{ id: string; top: number; left: number } | null>(null);

  const nodeTypes = useMemo(() => ({ orgNode: OrgNode }), []);

  const handleNodeToggle = useCallback((nodeId: string) => {
    setExpandedNodes(prevExpanded => {
      const newExpanded = new Set(prevExpanded);
      if (newExpanded.has(nodeId)) {
        newExpanded.delete(nodeId);
      } else {
        newExpanded.add(nodeId);
      }
      return newExpanded;
    });
  }, []);

  // Calculate visible nodes/edges and raw stats
  const { visibleNodes, visibleEdges, calculatedStats } = useMemo(() => {
    const potentiallyVisibleNodeIds = new Set<string>();
    const edgesForExpansionCheck = new Set<string>();

    const findVisibleChildren = (nodeId: string) => {
        potentiallyVisibleNodeIds.add(nodeId);
        if (!expandedNodes.has(nodeId)) {
            return;
        }
        // Use edgesRaw
        const childrenEdges = edgesRaw.filter(edge => edge.source === nodeId);
        childrenEdges.forEach(edge => {
            edgesForExpansionCheck.add(edge.id);
            findVisibleChildren(edge.target);
        });
    };

    // Use nodesRaw
    if (nodesRaw.some(n => n.id === '1')) {
         findVisibleChildren('1');
    }

    let finalVisibleNodeIds: Set<string>;
    if (searchTerm) {
      finalVisibleNodeIds = new Set(
        [...potentiallyVisibleNodeIds].filter(nodeId => {
          // Use nodesRaw
          const node = nodesRaw.find(n => n.id === nodeId);
          return node && (
            node.data.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            node.data.name?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        })
      );
    } else {
      finalVisibleNodeIds = potentiallyVisibleNodeIds;
    }

    // Calculate direct reports map (FILTERING FOR PRIMARY)
    const directReportsMap = new Map<string, number>();
    edgesRaw.forEach(edge => {
        // Only count edge if it's primary (or relationshipType is undefined - treat as primary)
        if (edge.data?.relationshipType !== 'secondary') { 
            directReportsMap.set(edge.source, (directReportsMap.get(edge.source) || 0) + 1);
        }
    });

    // Calculate layer depth
    const layerDepthMap = new Map<string, number>();
    const queue: { nodeId: string; depth: number }[] = [];
    const rootNode = nodesRaw.find(n => !edgesRaw.some(e => e.target === n.id)); // Simple root find
    
    if (rootNode) {
      queue.push({ nodeId: rootNode.id, depth: 0 });
      layerDepthMap.set(rootNode.id, 0);
    }

    let head = 0;
    while (head < queue.length) {
      const { nodeId, depth } = queue[head++];
      const childrenEdges = edgesRaw.filter(edge => edge.source === nodeId);
      childrenEdges.forEach(edge => {
        if (!layerDepthMap.has(edge.target)) { // Avoid cycles / redundant processing
          layerDepthMap.set(edge.target, depth + 1);
          queue.push({ nodeId: edge.target, depth: depth + 1 });
        }
      });
    }

    // --- Calculate Stats from Layer Depth Map ---
    let currentMaxDepth = 0;
    let totalDepth = 0;
    let nodeCountWithDepth = 0;
    if (layerDepthMap.size > 0) {
        layerDepthMap.forEach((depth, nodeId) => {
            // Only consider nodes that might be visible (in finalVisibleNodeIds)
            // Or should we calculate based on *all* nodes in the raw data?
            // Let's calculate based on all nodes for overall structure stats.
             currentMaxDepth = Math.max(currentMaxDepth, depth);
             totalDepth += depth;
        });
        nodeCountWithDepth = layerDepthMap.size;
    }
    const currentAverageDepth = nodeCountWithDepth > 0 ? totalDepth / nodeCountWithDepth : 0;
    const currentCalculatedStats = {
        maxDepth: nodeCountWithDepth > 0 ? currentMaxDepth : null,
        averageDepth: nodeCountWithDepth > 0 ? parseFloat(currentAverageDepth.toFixed(1)) : null
    };
    // --- End Stat Calculation ---

    // Map final visible nodes, adding count, depth, and highlight flag
    const vNodes = nodesRaw
        .filter(node => finalVisibleNodeIds.has(node.id))
        .map(node => {
            const depth = layerDepthMap.get(node.id);
            return {
                ...node,
                data: {
                    ...node.data,
                    isExpanded: expandedNodes.has(node.id),
                    handleNodeToggle: handleNodeToggle,
                    directReportsCount: directReportsMap.get(node.id) || 0,
                    layerDepth: depth,
                    isBeyondThreshold: depth !== undefined && depth > MAX_RECOMMENDED_DEPTH,
                    isSearchResult: !!searchTerm && finalVisibleNodeIds.has(node.id), // Set search result flag
                }
            }
        });

    // Filter and style edges based on final visibility set and relationshipType
    const vEdges = edgesRaw
        .filter(edge =>
            finalVisibleNodeIds.has(edge.source) && finalVisibleNodeIds.has(edge.target)
        )
        .map(edge => ({
            ...edge,
            // Add style for dotted lines
            style: edge.data?.relationshipType === 'secondary' 
                ? { strokeDasharray: '5,5', stroke: '#888' } 
                : { stroke: '#555' }, // Default style for primary
            // Optional: Make secondary lines less prominent
            // animated: edge.data?.relationshipType === 'secondary' ? false : true,
        }));

    return { visibleNodes: vNodes, visibleEdges: vEdges, calculatedStats: currentCalculatedStats };
    // Dependencies use raw state
  }, [expandedNodes, handleNodeToggle, searchTerm, nodesRaw, edgesRaw]);

  // Update stats state when calculatedStats change
  useEffect(() => {
      setStats(calculatedStats);
  }, [calculatedStats]);

  // Apply layout (depends on visibleNodes/Edges which depend on Raw state - CORRECTED)
  useEffect(() => {
    if (visibleNodes.length === 0 && searchTerm) {
        // Update layouted state
        setLayoutedNodes([]);
        setLayoutedEdges([]);
        return;
    }
    // Use nodesRaw for check
    if (visibleNodes.length === 0 && !searchTerm && nodesRaw.length > 0) {
        setLayoutedNodes([]);
        setLayoutedEdges([]);
        return;
    }
    // Use nodesRaw for check
    if (nodesRaw.length === 0) {
        setLayoutedNodes([]);
        setLayoutedEdges([]);
        return;
    }

    const layouted = getLayoutedElements(
      [
        ...visibleNodes,
        ...visibleEdges,
      ],
      layoutDirection
    );

    // Update the *layouted* state for ReactFlow
    setLayoutedNodes(layouted.filter((el): el is Node<OrgNodeData> => 'position' in el));
    setLayoutedEdges(layouted.filter((el): el is Edge<OrgEdgeData> => !('position' in el)));

    window.requestAnimationFrame(() => {
        fitView({ padding: 0.2, duration: 300 });
    });
    // Dependencies use raw state + derived visible state + setters
  }, [visibleNodes, visibleEdges, setLayoutedNodes, setLayoutedEdges, fitView, layoutDirection, searchTerm, nodesRaw, edgesRaw]);

  // --- Connection/Update Handlers (Workaround) ---

  // Called when dragging a handle to a *valid* target handle
  const onConnect = useCallback(
    (connection: Connection) => {
      // Validate connection first
      if (!isValidConnection(connection, nodesRaw, edgesRaw)) {
        // TODO: Show user feedback about invalid connection
        return; 
      }

      // WORKAROUND: Check if source already has an edge and remove it before adding new one
      setEdgesRaw((prevEdges) => {
        // 1. Filter out any existing edge originating from the same source handle
        const edgesWithoutOld = prevEdges.filter(
          (edge) => !(edge.source === connection.source && edge.sourceHandle === connection.sourceHandle)
        );
        // 2. Create the new edge
        const newEdge: Edge<OrgEdgeData> = {
            id: `e${connection.source}-${connection.target}`,
            source: connection.source!,
            target: connection.target!,
            sourceHandle: connection.sourceHandle,
            targetHandle: connection.targetHandle,
            type: 'smoothstep',
            data: { relationshipType: 'primary' }, // Default new connections to primary
        };
        // 3. Add the new edge
        return addEdge(newEdge, edgesWithoutOld);
      });
    },
    [nodesRaw, edgesRaw, setEdgesRaw]
  );

  // --- Edge Click Handler (Remove stopPropagation) ---
  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge<OrgEdgeData>) => {
    setEdgesRaw((currentEdges) =>
      currentEdges.map((e) => {
        if (e.id === edge.id) {
          const newType = e.data?.relationshipType === 'secondary' ? 'primary' : 'secondary';
          return { 
              ...e, 
              data: { ...e.data, relationshipType: newType }
          };
        }
        return e;
      })
    );
    console.log(`Toggled relationship type for edge ${edge.id}`);
  }, [setEdgesRaw]);

  // --- Deletion Handler ---
  const onEdgesDelete = useCallback(
    (edgesToDelete: Edge[]) => {
      if (!edgesToDelete || edgesToDelete.length === 0) return;
      const edgeIdsToDelete = new Set(edgesToDelete.map((e) => e.id));
      setEdgesRaw((currentEdges) =>
        currentEdges.filter((edge) => !edgeIdsToDelete.has(edge.id))
      );
      console.log('Manually deleted edges:', edgesToDelete);
      // Deselect nodes/edges after delete
      setLayoutedNodes((nds) => nds.map(n => ({ ...n, selected: false })));
      setLayoutedEdges((eds) => eds.map(e => ({ ...e, selected: false })));
    },
    [setEdgesRaw, setLayoutedNodes, setLayoutedEdges]
  );

  // --- Context Menu Handlers ---
  const onEdgeContextMenu = useCallback(
    (event: React.MouseEvent, edge: Edge<OrgEdgeData>) => {
      event.preventDefault();
      setContextMenu({
        id: edge.id,
        top: event.clientY,
        left: event.clientX,
      });
    },
    []
  );

  const handleContextMenuDelete = useCallback(() => {
      if (contextMenu) {
          const edgeToDelete = edgesRaw.find(e => e.id === contextMenu.id);
          if (edgeToDelete) {
              onEdgesDelete([edgeToDelete]);
          }
          setContextMenu(null);
      }
  }, [contextMenu, edgesRaw, onEdgesDelete]);

  // --- Export Function (using html-to-image) ---
  const handleExportPng = useCallback(() => {
    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;

    if (!viewport) {
      console.error("React Flow viewport not found for export.");
      // TODO: Show user error
      return;
    }

    // Options for html-to-image (can adjust quality, pixel ratio, etc.)
    const options = {
        quality: 0.95,
        // Use viewport dimensions or calculate based on content?
        // Using viewport dimensions might crop if zoomed out too far.
        // Let's stick with viewport dimensions for now.
        // width: viewport.offsetWidth,
        // height: viewport.offsetHeight,
        style: { background: 'white' } // Ensure background is white
    };

    htmlToImage.toPng(viewport, options)
      .then((dataUrl) => {
        const a = document.createElement('a');
        a.setAttribute('download', 'org-chart.png');
        a.setAttribute('href', dataUrl);
        a.click();
      })
      .catch((err) => {
        console.error("Failed to export PNG using html-to-image:", err);
        // TODO: Show user-facing error message
      });
  }, []); // Removed react-flow getters from deps as we query DOM directly

  // --- TODOs ---
  // TODO: Refine PNG export (sizing, quality)
  // TODO: Implement PDF Export
  // TODO: Hierarchy Management Details -> Next!
  // TODO: Add validation to onConnect (e.g., prevent cycles)
  // TODO: Persist changes
  // TODO: Implement drag *node* onto *node*
  // TODO: Export & Share -> Next!
  // TODO: Enhance Search: Show ancestors of matched nodes even if collapsed.
  // TODO: Highlight search results.
  // TODO: Implement drag-and-drop restructuring -> Next!
  // TODO: Implement span of control analysis
  // TODO: Implement management layers optimization
  // TODO: Implement dotted-line relationships
  // TODO: Implement export functionality (PNG/PDF)
  // TODO: Refine PNG export dimensions/scaling
  // TODO: Implement PDF Export (requires additional library like jspdf + html2canvas/svg2pdf)
  // TODO: Hierarchy Management Details -> Next!
  // TODO: Management Layers Visualization -> Next
  // TODO: Dotted Line Relationships -> After Layers
  // TODO: Add UI to create/edit secondary relationships
  // TODO: Management layers optimization (analysis part)
  // TODO: Consider context menu for more edge options?
  // TODO: Refine Layer Optimization display/thresholds
  // TODO: Add more validation rules (e.g., max direct reports?)
  // TODO: User feedback for invalid connections
  // TODO: PDF Export -> Next!
  // TODO: Add API call for edge deletion persistence

  console.log('Rendering LayoutedOrgChart, contextMenu state:', contextMenu); // Keep this log

  return (
    <ContextMenu
      open={!!contextMenu}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          setContextMenu(null);
        }
      }}
    >
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Controls Container */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 4, display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Layout Buttons */}
          <div>
              <button onClick={() => setLayoutDirection('TB')} style={{ marginRight: 5, padding: '2px 5px', background: layoutDirection === 'TB' ? '#eee' : 'white', border: '1px solid #ccc' }}>Vertical</button>
              <button onClick={() => setLayoutDirection('LR')} style={{ padding: '2px 5px', background: layoutDirection === 'LR' ? '#eee' : 'white', border: '1px solid #ccc' }}>Horizontal</button>
          </div>
          {/* Search Input */}
          <Input
              type="search"
              placeholder="Search roles/names..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 h-8"
              style={{ padding: '2px 8px' }}
          />
          {/* Export Button */}
          <Button variant="outline" size="sm" onClick={handleExportPng} style={{ height: '32px' }}> {/* Match Input height */} 
              Export PNG
          </Button>
        </div>
        
        {/* Stats Display */}
         <div style={{
              position: 'absolute', 
              bottom: 10, 
              left: 10, 
              zIndex: 4, 
              background: 'rgba(255, 255, 255, 0.8)', 
              padding: '5px 10px', 
              borderRadius: '4px', 
              fontSize: '11px',
              border: '1px solid #eee'
          }}>
              {stats.maxDepth !== null && <div>Max Depth: {stats.maxDepth} {stats.maxDepth > MAX_RECOMMENDED_DEPTH ? '(Threshold Exceeded)' : ''}</div>}
              {stats.averageDepth !== null && <div>Avg Depth: {stats.averageDepth}</div>}
          </div>

        <ReactFlow
          nodes={layoutedNodes}
          edges={layoutedEdges}
          onNodesChange={applyLayoutedNodeChanges}
          onEdgesChange={applyLayoutedEdgeChanges}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          onEdgeContextMenu={onEdgeContextMenu}
          nodeTypes={nodeTypes}
          fitView
          proOptions={{ hideAttribution: true }}
          edgesFocusable={true}
          nodesFocusable={true}
        >
           <Controls />
           <MiniMap />
           <Background variant="dots" gap={12} size={1} />
        </ReactFlow>

        {/* Conditionally render Content directly inside main div, NO Portal */}
        {contextMenu && (
          <ContextMenuContent
            style={{
              position: 'fixed',
              top: `${contextMenu.top}px`,
              left: `${contextMenu.left}px`,
              zIndex: 9999,
              backgroundColor: 'lime',
              border: '2px solid red',
              padding: '10px'
            }}
            className="w-48 shadow-md"
            onContextMenu={(e) => e.preventDefault()}
          >
            <div style={{ color: 'black' }}>HELLO - Menu Content</div>
          </ContextMenuContent>
        )}
      </div>
    </ContextMenu>
  );
};

// --- Main OrgChart Wrapper ---
const OrgChart: React.FC = () => {
    return (
        <div style={{ width: '100%', height: 'calc(100vh - 200px)' }}> {/* Use parent height */}
            <ReactFlowProvider>
                <LayoutedOrgChart />
            </ReactFlowProvider>
        </div>
    );
}

export default OrgChart; 