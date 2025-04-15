import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, FileWarning } from 'lucide-react'; 
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext'; 
import StandardSkillDialog from './StandardSkillDialog'; // Import the skill dialog
import { type StandardSkillFormValues } from './StandardSkillDialog'; // Import the skill form values type
import { db } from '@/lib/firebase';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy 
} from 'firebase/firestore';

// Type for Standard Skill data fetched from Firestore
export interface StandardSkill {
  id: string; // Firestore document ID
  name: string;
  description?: string;
}

const StandardSkillManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [skills, setSkills] = useState<StandardSkill[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<StandardSkill | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingSkillId, setDeletingSkillId] = useState<string | null>(null);

  const skillsCollectionRef = collection(db, "standardSkills"); // Reference the correct collection

  // --- Fetch Skills --- 
  const fetchSkills = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const q = query(skillsCollectionRef, orderBy("name")); // Order alphabetically by name
        const data = await getDocs(q);
        const fetchedItems = data.docs.map((doc) => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<StandardSkill, 'id'>)
        })) as StandardSkill[];
        setSkills(fetchedItems);
    } catch (err) {
        console.error("Error fetching standard skills:", err);
        setError("Failed to fetch standard skills. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

   // --- Dialog Actions --- 
  const openAddDialog = () => {
    setEditingSkill(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item: StandardSkill) => {
    setEditingSkill(item);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingSkill(null);
  };

  // --- Delete Confirmation Dialog Actions --- 
  const openDeleteConfirmDialog = (id: string) => {
    setDeletingSkillId(id);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteConfirmDialog = () => {
    setDeletingSkillId(null);
    setIsDeleteDialogOpen(false);
  };

  // --- CRUD Handlers --- 
  const handleFormSubmit = async (data: StandardSkillFormValues) => {
    // Add permission check if needed
    setIsLoading(true); 
    setError(null);

    const dataToSave = {
        name: data.name,
        description: data.description || null,
    };

    try {
        if (editingSkill) {
            // Update existing skill
            const itemDocRef = doc(db, "standardSkills", editingSkill.id);
            await updateDoc(itemDocRef, dataToSave);
            console.log('Updated standard skill:', editingSkill.id);
        } else {
            // Add new skill
            await addDoc(skillsCollectionRef, dataToSave);
            console.log('Added new standard skill:');
        }
        fetchSkills(); // Refetch the list
        // Close is handled by dialog itself
    } catch (err) {
        console.error("Error saving standard skill:", err);
        setError("Failed to save skill. Please try again.");
        setIsLoading(false); 
        throw err; // Re-throw so dialog knows submission failed
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSkillId) return;
    // Add permission check if needed

    const itemDocRef = doc(db, "standardSkills", deletingSkillId);
    try {
        await deleteDoc(itemDocRef);
        console.log('Deleted standard skill:', deletingSkillId);
        fetchSkills(); // Refetch the list
        closeDeleteConfirmDialog(); // Close confirmation dialog
    } catch (err) {
        console.error("Error deleting standard skill:", err);
        setError("Failed to delete skill.");
        closeDeleteConfirmDialog(); 
    }
  };

  const skillToDelete = skills.find(s => s.id === deletingSkillId);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Standard Skills</CardTitle>
              <CardDescription>Manage the reusable list of standard skills.</CardDescription>
            </div>
            <Button onClick={openAddDialog} disabled={!currentUser}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           {error && (
              <div className="mb-4 p-4 bg-destructive/10 border border-destructive text-destructive rounded-md flex items-center">
                 <FileWarning className="w-5 h-5 mr-3" />
                 <span>{error} <Button variant="link" className="p-0 h-auto text-destructive underline" onClick={fetchSkills}>Retry?</Button></span>
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
              ) : skills.length === 0 && !error ? (
                <TableRow><TableCell colSpan={3} className="h-24 text-center">No standard skills found.</TableCell></TableRow>
              ) : (
                skills.map((item) => (
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
      <StandardSkillDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        onSubmit={handleFormSubmit} 
        initialData={editingSkill}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
         <AlertDialogContent>
           <AlertDialogHeader>
             <AlertDialogTitle>Are you sure?</AlertDialogTitle>
             <AlertDialogDescription>
               This action cannot be undone. This will permanently delete the 
               standard skill: <strong>{skillToDelete?.name ?? 'this item'}</strong>.
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

export default StandardSkillManagement; 