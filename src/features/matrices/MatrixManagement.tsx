import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';
import MatrixDialog from './MatrixDialog';
import { type MatrixFormValues } from './MatrixDialog';
import MatrixDetailView from './MatrixDetailView';
import { db } from '@/lib/firebase';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy
} from 'firebase/firestore';

// Matrix Type
interface ResponsibilityMatrix {
  id: string;
  name: string;
  type: 'RACI' | 'RAPID' | 'Custom'; 
  linkedProject?: string;
  lastUpdated: string; // Keep required for display
  includedResponsibilityIds?: string[]; // Array of StandardResponsibility IDs
  includedRoleIds?: string[]; // Add includedRoleIds
  // assignments field will be handled in MatrixDetailView
}

const MatrixManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [matrices, setMatrices] = useState<ResponsibilityMatrix[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatrix, setEditingMatrix] = useState<ResponsibilityMatrix | null>(null);
  const [selectedMatrixId, setSelectedMatrixId] = useState<string | null>(null);

  const matricesCollectionRef = collection(db, "matrices");

  // --- Fetch Matrices --- 
  const fetchMatrices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const q = query(matricesCollectionRef, orderBy("name"));
        const data = await getDocs(q);
        const fetchedMatrices = data.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as Omit<ResponsibilityMatrix, 'id'>)
        })) as ResponsibilityMatrix[];
        // Ensure included arrays exist
        fetchedMatrices.forEach(matrix => {
            matrix.includedResponsibilityIds = matrix.includedResponsibilityIds || [];
            matrix.includedRoleIds = matrix.includedRoleIds || []; // Ensure role IDs array exists
        });
        setMatrices(fetchedMatrices);
    } catch (err) {
        console.error("Error fetching matrices:", err);
        setError("Failed to fetch matrices. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedMatrixId) fetchMatrices();
  }, [fetchMatrices, selectedMatrixId]);

  // --- Dialog Actions ---
  const openAddDialog = () => {
    setEditingMatrix(null);
    setIsDialogOpen(true);
  };
  const openEditDialog = (matrix: ResponsibilityMatrix) => {
    setEditingMatrix(matrix);
    setIsDialogOpen(true);
  };
  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingMatrix(null);
  };

  // --- View/Edit Handler --- 
  const handleViewOrEdit = (id: string) => {
    console.log('View/Edit matrix clicked:', id);
    setSelectedMatrixId(id);
  };
  
  const handleBackToList = () => {
      setSelectedMatrixId(null);
  };

  // --- CRUD Handlers ---
  const handleFormSubmit = async (data: MatrixFormValues) => {
    if (!currentUser) return;
    setError(null);

    // Extract IDs from the objects received from the dialog
    const responsibilityIdsToSave = (data.responsibilities || []).map(r => r.id);
    const roleIdsToSave = (data.roles || []).map(r => r.id); // Extract Role IDs

    const matrixDataToSave = {
        name: data.name,
        type: data.type,
        linkedProject: data.linkedProject || null,
        lastUpdated: new Date().toISOString().split('T')[0],
        includedResponsibilityIds: responsibilityIdsToSave,
        includedRoleIds: roleIdsToSave, // Save the array of Role IDs
    };

    let operationSuccessful = false;
    try {
      if (editingMatrix) {
        // Edit existing matrix
        const matrixDocRef = doc(db, "matrices", editingMatrix.id);
        await updateDoc(matrixDocRef, matrixDataToSave);
        console.log('Updated matrix:', editingMatrix.id);
      } else {
        // Add new matrix
        await addDoc(matricesCollectionRef, matrixDataToSave);
        console.log('Added new matrix:');
      }
      operationSuccessful = true;
      fetchMatrices(); // Refetch the list to show changes
    } catch (err) {
       console.error(`Error ${editingMatrix ? 'updating' : 'adding'} matrix:`, err);
       setError(`Failed to ${editingMatrix ? 'update' : 'add'} matrix.`);
       // Re-throw error so dialog knows submission failed if needed
       throw err;
    } finally {
       if (operationSuccessful) {
           closeDialog(); // Close dialog only if successful
       }
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    const matrixDocRef = doc(db, "matrices", id);
    try {
        await deleteDoc(matrixDocRef);
        console.log('Deleted matrix:', id);
        fetchMatrices();
    } catch (err) {
        console.error("Error deleting matrix:", err);
        setError("Failed to delete matrix.");
    }
  };

  // --- Render Logic --- 
  if (selectedMatrixId) {
      return (
          <MatrixDetailView 
              matrixId={selectedMatrixId} 
              onBack={handleBackToList} 
          />
      );
  }

  // Render Table View (default)
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
             <CardTitle>Responsibility Matrices</CardTitle>
             <CardDescription>Define and manage responsibility matrices (e.g., RACI).</CardDescription>
          </div>
           {/* Open Add dialog */}
          <Button onClick={openAddDialog} disabled={!currentUser}> 
            <PlusCircle className="mr-2 h-4 w-4" /> Create Matrix
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrix Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Linked Project</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">Loading matrices...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center text-destructive">{error}</TableCell></TableRow>
            ) : matrices.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="h-24 text-center">No matrices found.</TableCell></TableRow>
            ) : (
              matrices.map((matrix) => (
                <TableRow key={matrix.id}>
                  <TableCell className="font-medium">{matrix.name}</TableCell>
                  <TableCell>{matrix.type}</TableCell>
                  <TableCell>{matrix.linkedProject || 'N/A'}</TableCell>
                  <TableCell>{matrix.lastUpdated}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrEdit(matrix.id)}>
                          View/Edit Matrix
                        </DropdownMenuItem>
                         {/* Open Edit dialog */}
                        <DropdownMenuItem onClick={() => openEditDialog(matrix)} disabled={!currentUser}>
                          Edit Settings
                        </DropdownMenuItem>
                         {/* Delete with Confirmation */}
                         <AlertDialog>
                           <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                 onSelect={(e) => e.preventDefault()} 
                                 disabled={!currentUser} 
                                 className="text-red-600">
                                Delete
                              </DropdownMenuItem>
                           </AlertDialogTrigger>
                           <AlertDialogContent>
                             <AlertDialogHeader>
                               <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                               <AlertDialogDescription>
                                 This action cannot be undone. This will permanently delete the 
                                 <strong>{matrix.name}</strong> matrix.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDelete(matrix.id)} className="bg-red-600 hover:bg-red-700">
                                 Delete
                               </AlertDialogAction>
                             </AlertDialogFooter>
                           </AlertDialogContent>
                         </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>))
            )}
          </TableBody>
        </Table>
      </CardContent>

       {/* Render the Dialog */}
       <MatrixDialog 
         isOpen={isDialogOpen} 
         onClose={closeDialog} 
         onSubmit={handleFormSubmit} 
         initialData={editingMatrix}
       />
    </Card>
  );
};

export default MatrixManagement; 