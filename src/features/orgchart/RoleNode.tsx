import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@reactflow/core';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Define the data structure expected by this node
// Ensure this matches the structure you pass when creating nodes
export interface RoleNodeData {
  title: string;
  department?: string;
  // Add other relevant fields if needed, e.g., level
}

// Using memo for performance optimization, as nodes might re-render often
const RoleNode: React.FC<NodeProps<RoleNodeData>> = memo(({ data }) => {
  return (
    <>
      {/* Target Handle (Top): Allows connections *to* this node */}
      <Handle 
        type="target" 
        position={Position.Top} 
        id="t" // Unique ID for the handle within the node
        style={{ background: '#555' }} // Basic styling
        isConnectable={true} // Ensure connections can be made
      />

      {/* Node Content */}
      <Card 
        className="w-48 border-2 border-stone-400 shadow-md bg-white hover:shadow-lg transition-shadow duration-150"
      >
        <CardHeader className="p-2 text-center bg-stone-100 rounded-t-md">
          <CardTitle className="text-sm font-semibold">{data.title}</CardTitle>
        </CardHeader>
        <CardContent className="p-2 text-center">
          {data.department && (
            <CardDescription className="text-xs text-gray-600">
              {data.department}
            </CardDescription>
          )}
          {/* Add other details here if needed */}
        </CardContent>
      </Card>

      {/* Source Handle (Bottom): Allows connections *from* this node */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        id="s" // Unique ID for the handle within the node
        style={{ background: '#555' }}
        isConnectable={true}
      />
    </>
  );
});

RoleNode.displayName = 'RoleNode'; // Add display name for debugging

export default RoleNode; 