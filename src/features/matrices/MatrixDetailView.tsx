import React, { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Loader2, AlertTriangle } from 'lucide-react';
import { Badge, type BadgeProps } from '@/components/ui/badge'; // For displaying assignments
import { 
    type StandardResponsibility 
} from '../standard-items/StandardResponsibilityManagement'; // Use existing type

// Re-define Role type here or import if available globally
interface Role {
  id: string; // Firestore document ID
  title: string;
  // Add other relevant fields if needed, e.g., department
}

// Define the structure of the Matrix document in Firestore
interface MatrixDocument {
    id: string;
    name: string;
    type: 'RACI' | 'RAPID' | 'Custom';
    // Assignments: Map<RoleID, Map<ResponsibilityID, AssignmentValue>>
    assignments?: { [roleId: string]: { [responsibilityId: string]: string } }; 
    includedResponsibilityIds?: string[];
    includedRoleIds?: string[];
}

type AssignmentsMap = MatrixDocument['assignments'];

interface MatrixDetailViewProps {
  matrixId: string;
  onBack: () => void;
}

// Simple assignment cycle example (R -> A -> C -> I -> '')
const raciCycle: { [key: string]: string } = { 
    '': 'R', 
    'R': 'A', 
    'A': 'C', 
    'C': 'I', 
    'I': '' 
};
const getNextAssignment = (current: string | undefined): string => {
    return raciCycle[current || ''] ?? ''; // Default to empty if unknown
};

// Function to map assignment value to Badge variant
const getAssignmentVariant = (assignment: string | undefined): BadgeProps['variant'] => {
    switch ((assignment || '').toUpperCase()) {
        case 'R': return 'destructive';
        case 'A': return 'default'; // Default usually maps to primary color
        case 'C': return 'secondary';
        case 'I': return 'outline';
        default: return null; // Return null for empty to not render a badge
    }
};

const MatrixDetailView: React.FC<MatrixDetailViewProps> = ({ matrixId, onBack }) => {
  const [matrix, setMatrix] = useState<MatrixDocument | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [responsibilities, setResponsibilities] = useState<StandardResponsibility[]>([]);
  const [assignments, setAssignments] = useState<AssignmentsMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const matrixDocRef = doc(db, "matrices", matrixId);

  // Fetch all necessary data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const matrixPromise = getDoc(matrixDocRef);
        const rolesPromise = getDocs(collection(db, "roles"));
        const respPromise = getDocs(collection(db, "standardResponsibilities"));

        const [matrixSnap, rolesSnap, respSnap] = await Promise.all([
          matrixPromise,
          rolesPromise,
          respPromise,
        ]);

        // Process Matrix
        if (!matrixSnap.exists()) {
          throw new Error("Matrix not found.");
        }
        const matrixData = { id: matrixSnap.id, ...matrixSnap.data() } as MatrixDocument;
        setMatrix(matrixData);
        setAssignments(matrixData.assignments || {});
        const relevantResponsibilityIds = matrixData.includedResponsibilityIds || []; 
        const relevantRoleIds = matrixData.includedRoleIds || [];

        // Process Roles - Fetch all, then filter
        const allRolesData = rolesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Role[];
        // Filter roles based on the IDs included in the matrix document
        const filteredRolesData = allRolesData.filter(role => 
            relevantRoleIds.includes(role.id)
        );
        // Sort the filtered roles alphabetically
        filteredRolesData.sort((a, b) => a.title.localeCompare(b.title));
        setRoles(filteredRolesData);

        // Process Responsibilities - Fetch all, then filter
        const allRespData = respSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardResponsibility[];
        // Filter responsibilities based on the IDs included in the matrix document
        const filteredRespData = allRespData.filter(resp => 
            relevantResponsibilityIds.includes(resp.id)
        );
        // Sort the filtered responsibilities alphabetically
        filteredRespData.sort((a, b) => 
            (a.name ?? '').localeCompare(b.name ?? '')
         );
        setResponsibilities(filteredRespData); // Set state with the filtered list

      } catch (err: any) {
        console.error("Error fetching matrix details:", err);
        setError(err.message || "Failed to load matrix details.");
        setMatrix(null); // Clear data on error
        setRoles([]);
        setResponsibilities([]);
        setAssignments({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [matrixId]); // Refetch if matrixId changes

  // --- Handle Cell Click / Update --- 
  const handleAssignmentChange = async (roleId: string, respId: string) => {
      const currentAssignment = assignments?.[roleId]?.[respId];
      const nextAssignment = getNextAssignment(currentAssignment);
      
      // Optimistic UI Update
      setAssignments(prev => ({
          ...prev,
          [roleId]: {
              ...(prev?.[roleId] || {}),
              [respId]: nextAssignment
          }
      }));

      // Update Firestore using dot notation for nested map field
      const fieldPath = `assignments.${roleId}.${respId}`;
      try {
           await updateDoc(matrixDocRef, { 
                [fieldPath]: nextAssignment || null // Store null if empty string to potentially clean up map
           });
           console.log(`Updated assignment for Role ${roleId}, Resp ${respId} to ${nextAssignment}`);
           // Optional: Add a small success indicator
      } catch (err) {
           console.error("Failed to update assignment in Firestore:", err);
           setError(`Failed to save change for ${roles.find(r=>r.id===roleId)?.title} / ${responsibilities.find(r=>r.id===respId)?.name}. Reverting.`);
            // Revert optimistic update on error
           setAssignments(prev => ({
               ...prev,
               [roleId]: {
                   ...(prev?.[roleId] || {}),
                   [respId]: currentAssignment || '' // Revert to original value
               }
           }));
            // Optional: Show error toast
      }
  };

  // --- Render --- 
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading Matrix Details...</p>
      </div>
    );
  }

  if (error && !matrix) { // Show fatal error if matrix couldn't load
    return (
      <Card className="mt-4 border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center text-destructive">
            <AlertTriangle className="mr-2" /> Error Loading Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-destructive mb-4">{error}</p>
          <Button variant="outline" onClick={onBack}> 
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!matrix) {
      // Should ideally be covered by error state, but added as fallback
      return <p>Matrix data could not be loaded.</p>; 
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
           <div>
              <Button variant="outline" size="sm" onClick={onBack} className="mb-2">
                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
              </Button>
              <CardTitle>{matrix.name}</CardTitle>
              <CardDescription>Type: {matrix.type} (Click cells to assign responsibility)</CardDescription>
            </div>
             {/* Add maybe export button or other actions here */} 
         </div>
         {/* Show non-fatal error here (e.g., save failure) */}
         {error && (
            <div className="mt-2 p-2 bg-destructive/10 border border-destructive text-destructive rounded-md text-sm">
                {error}
            </div>
         )}
      </CardHeader>
      <CardContent className="overflow-x-auto"> {/* Allow horizontal scroll for many roles */}
        <Table className="min-w-full border">
          <TableHeader>
            <TableRow>
              <TableHead className="sticky left-0 bg-card border-r w-[200px]">Responsibility</TableHead>
              {roles.map(role => (
                <TableHead key={role.id} className="min-w-[100px] text-center">{role.title}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {responsibilities.map(resp => (
              <TableRow key={resp.id}>
                <TableCell className="sticky left-0 bg-card border-r font-medium w-[200px]">{resp.name}</TableCell>
                {roles.map(role => {
                  const assignment = assignments?.[role.id]?.[resp.id] || '';
                  const variant = getAssignmentVariant(assignment);
                  
                  // Render Badge if variant exists, otherwise a placeholder/button
                  return (
                    <TableCell key={`${role.id}-${resp.id}`} className="text-center border-l h-14"> {/* Ensure consistent cell height */}
                        <div 
                            className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-muted/50 rounded-sm" 
                            onClick={() => handleAssignmentChange(role.id, resp.id)}
                        >
                            {variant ? (
                                <Badge 
                                    variant={variant} 
                                    className="px-2.5 py-0.5 text-xs font-bold cursor-pointer"
                                >
                                    {assignment.toUpperCase()}
                                </Badge>
                            ) : (
                                <span className="text-muted-foreground text-xs">-</span> // Placeholder for empty
                            )}
                        </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default MatrixDetailView; 