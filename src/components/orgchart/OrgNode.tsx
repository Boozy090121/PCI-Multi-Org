import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { PlusCircle, MinusCircle, Users, Layers } from 'lucide-react'; // Use icons for button and add Users icon
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"; // Import shadcn/ui Tooltip
import { cn } from "@/lib/utils"; // Assuming you have shadcn's utility function

// Assuming OrgNodeData interface is defined similarly in OrgChart.tsx
// or ideally, defined in a shared types file
interface OrgNodeData {
  id: string;
  label: string; // Role Title
  name?: string; // Employee Name
  department?: string;
  avatar?: string;
  hasChildren?: boolean;
  isExpanded?: boolean;
  handleNodeToggle?: (id: string) => void;
  directReportsCount?: number;
  layerDepth?: number;
  isBeyondThreshold?: boolean;
  isSearchResult?: boolean; // Add flag
  // Add other relevant fields
}

const OrgNode: React.FC<NodeProps<OrgNodeData>> = ({ id, data, sourcePosition = Position.Bottom, targetPosition = Position.Top }) => {

  const onToggleClick = (event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent node drag/selection
    if (data.handleNodeToggle) {
      data.handleNodeToggle(id);
    }
  };

  // Prevent tooltip from showing when expand/collapse is hovered
  const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <TooltipProvider delayDuration={200}> {/* Add provider */} 
      <Tooltip>
        <TooltipTrigger asChild>
          {/* Use cn to conditionally apply border color AND background */}
          <div className={cn(
              "border-2 rounded-md shadow-md px-4 py-2 pr-8 w-[172px] relative group cursor-default",
              // Background: Highlight search result, default white
              data.isSearchResult ? "bg-yellow-100" : "bg-white", 
              // Border: Prioritize threshold warning, default stone
              data.isBeyondThreshold ? "border-red-500" : "border-stone-400"
           )}>
            {/* Input handle (use conditional style based on threshold) */}
            <Handle 
              type="target" 
              position={targetPosition} 
              className={cn(
                "w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-150", 
                data.isBeyondThreshold ? "!bg-red-500" : "!bg-teal-500"
              )} 
            />

            {/* Node Content */}
            <div className="flex items-center space-x-2">
              {data.avatar && (
                  <img src={data.avatar} alt={data.name || data.label} className="w-8 h-8 rounded-full object-cover" />
              )}
              <div className="flex-grow overflow-hidden">
                  <div className="text-xs font-bold text-gray-700 truncate">{data.label}</div>
                  {data.name && <div className="text-xs text-gray-500 truncate">{data.name}</div>}
                  {/* Display Layer Depth */} 
                  {data.layerDepth !== undefined && (
                      <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                         <Layers className="w-2.5 h-2.5" /> 
                         Layer {data.layerDepth}
                      </div>
                  )}
              </div>
            </div>

            {/* Output handle (use conditional style based on threshold) */}
            <Handle 
              type="source" 
              position={sourcePosition} 
              className={cn(
                "w-2 !h-2 !border-none opacity-0 group-hover:opacity-100 transition-opacity duration-150", 
                data.isBeyondThreshold ? "!bg-red-500" : "!bg-teal-500"
              )} 
            />

            {/* Expand/Collapse Button - needs stopPropagation for Tooltip */}
            {data.hasChildren && data.handleNodeToggle && (
              <button
                onClick={onToggleClick}
                onMouseEnter={stopPropagation} // Prevent tooltip flashing when hovering button
                onMouseLeave={stopPropagation}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 p-0.5 bg-white border border-stone-400 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                aria-label={data.isExpanded ? 'Collapse' : 'Expand'}
                title={data.isExpanded ? 'Collapse' : 'Expand'}
              >
                {data.isExpanded ? (
                  <MinusCircle className="w-3 h-3 text-gray-600" />
                ) : (
                  <PlusCircle className="w-3 h-3 text-gray-600" />
                )}
              </button>
            )}

            {/* Span of Control Badge */}
            {(data.directReportsCount !== undefined && data.directReportsCount > 0) && (
                <div 
                    className="absolute top-1 right-1 flex items-center justify-center bg-blue-100 text-blue-700 text-[10px] rounded-full w-5 h-5 border border-blue-300"
                    title={`Direct Reports: ${data.directReportsCount}`}
                >
                    {/* Optional: Icon instead of number? <Users className="w-2.5 h-2.5" /> */}
                     {data.directReportsCount}
                </div>
            )}

          </div>
        </TooltipTrigger>
        <TooltipContent side="top" align="center"> {/* Position the tooltip */} 
          <div className="text-sm p-1">
            <p className="font-semibold">{data.label}{data.name ? ` - ${data.name}` : ''}</p>
            {data.department && <p className="text-xs text-muted-foreground">Dept: {data.department}</p>}
            {/* Add more details here from data if available */}
            {/* e.g., <p className="text-xs">Email: {data.email}</p> */}
          </div>
          {data.isBeyondThreshold && <p className="text-xs text-red-600 font-semibold mt-1">Depth Threshold Exceeded!</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default memo(OrgNode); 