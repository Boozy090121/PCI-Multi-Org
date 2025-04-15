import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, FileWarning } from 'lucide-react'; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext'; 
import StandardResponsibilityDialog from './StandardResponsibilityDialog'; 
import { type StandardResponsibilityFormValues } from './StandardResponsibilityDialog';
import { db } from '@/lib/firebase';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy 
} from 'firebase/firestore';

// Type for Standard Responsibility data fetched from Firestore
export interface StandardResponsibility {
  id: string; // Firestore document ID
  name: string;
  description?: string;
}

const StandardResponsibilityManagement: React.FC = () => {
  const { currentUser } = useAuth(); // Use auth context if needed for permissions (e.g., admin role)
  const [responsibilities, setResponsibilities] = useState<StandardResponsibility[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResponsibility, setEditingResponsibility] = useState<StandardResponsibility | null>(null);
  // State specifically for the AlertDialog confirmation, separate from editing dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingResponsibilityId, setDeletingResponsibilityId] = useState<string | null>(null);

  const responsibilitiesCollectionRef = collection(db, "standardResponsibilities");

  // --- Fetch Responsibilities --- 
  const fetchResponsibilities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const q = query(responsibilitiesCollectionRef, orderBy("name")); // Order alphabetically by name
        const data = await getDocs(q);
        const fetchedItems = data.docs.map((doc) => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<StandardResponsibility, 'id'>)
        })) as StandardResponsibility[];
        setResponsibilities(fetchedItems);
    } catch (err) {
        console.error("Error fetching standard responsibilities:", err);
        setError("Failed to fetch standard responsibilities. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResponsibilities();
  }, [fetchResponsibilities]);

   // --- Dialog Actions --- 
  const openAddDialog = () => {
    setEditingResponsibility(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: StandardResponsibility) => {
    setEditingResponsibility(item);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingResponsibility(null);
  };

  // --- Delete Confirmation Dialog Actions --- 
  const openDeleteConfirmDialog = (id: string) => {
    setDeletingResponsibilityId(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteConfirmDialog = () => {
    setDeletingResponsibilityId(null);
    setIsDeleteDialogOpen(false);
  };

  // --- CRUD Handlers --- 
  const handleFormSubmit = async (data: StandardResponsibilityFormValues) => {
    // Add permission check if needed: if (!currentUser || !isAdmin) return;
    setIsLoading(true); // Indicate activity during save
    setError(null);

    const dataToSave = {
        name: data.name,
        description: data.description || null, // Store null if empty
    };

    try {
        if (editingResponsibility) {
            // Update existing responsibility
            const itemDocRef = doc(db, "standardResponsibilities", editingResponsibility.id);
            await updateDoc(itemDocRef, dataToSave);
            console.log('Updated standard responsibility:', editingResponsibility.id);
        } else {
            // Add new responsibility
            await addDoc(responsibilitiesCollectionRef, dataToSave);
            console.log('Added new standard responsibility:');
        }
        fetchResponsibilities(); // Refetch the list to show changes
        // Close handled by dialog itself upon successful submit
    } catch (err) {
        console.error("Error saving standard responsibility:", err);
        setError("Failed to save responsibility. Please try again.");
        setIsLoading(false); // Ensure loading state is reset on error
        throw err; // Re-throw error so dialog knows submission failed
    }
    // Don't reset loading state here; let the dialog handle it
  };

  const handleDeleteConfirm = async () => {
    if (!deletingResponsibilityId) return;
    // Add permission check if needed: if (!currentUser || !isAdmin) return;

    const itemDocRef = doc(db, "standardResponsibilities", deletingResponsibilityId);
    try {
        await deleteDoc(itemDocRef);
        console.log('Deleted standard responsibility:', deletingResponsibilityId);
        fetchResponsibilities(); // Refetch the list
        closeDeleteConfirmDialog(); // Close confirmation dialog
    } catch (err) {
        console.error("Error deleting standard responsibility:", err);
        setError("Failed to delete responsibility.");
        // Optionally keep the delete dialog open on error, or add specific error handling
        closeDeleteConfirmDialog(); 
    }
  };

  const responsibilityToDelete = responsibilities.find(r => r.id === deletingResponsibilityId);

  return (
    <> 
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Standard Responsibilities</CardTitle>
              <CardDescription>Manage the reusable list of standard responsibilities.</CardDescription>
            </div>
            <Button onClick={openAddDialog} disabled={!currentUser}> {/* Simple auth check */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add Responsibility
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center">
                 <FileWarning className="w-5 h-5 mr-3" />
                <span>{error} <Button variant="link" className="p-0 h-auto text-destructive underline" onClick={fetchResponsibilities}>Retry?</Button></span>
              </div>
            )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%]">Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell></TableRow>
              ) : responsibilities.length === 0 && !error ? (
                <TableRow><TableCell colSpan={3} className="h-24 text-center">No standard responsibilities found.</TableCell></TableRow>
              ) : (
                responsibilities.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{item.description || '-'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild disabled={!currentUser}>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEditDialog(item)} disabled={!currentUser}>
                            Edit
                          </DropdownMenuItem>
                           <DropdownMenuItem 
                              onClick={() => openDeleteConfirmDialog(item.id)}
                              className="text-red-600"
                              disabled={!currentUser} >
                             Delete
                           </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */} 
      <StandardResponsibilityDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        onSubmit={handleFormSubmit} 
        initialData={editingResponsibility}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the 
               standard responsibility: <strong>{responsibilityToDelete?.name ?? 'this item'}</strong>.
             </AlertDialogDescription>
           </AlertDialogHeader>
           <AlertDialogFooter>
             <AlertDialogCancel onClick={closeDeleteConfirmDialog}>Cancel</AlertDialogCancel>
             <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
               Delete
             </AlertDialogAction>
           </AlertDialogFooter>
         </AlertDialogContent>
       </AlertDialog>
    </>
  );
};

export default StandardResponsibilityManagement; 