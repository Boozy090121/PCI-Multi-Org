import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';
import DepartmentDialog from './DepartmentDialog'; // Import the dialog component
import { type DepartmentFormValues } from './DepartmentDialog'; // Import the form values type
import { db } from '@/lib/firebase'; // Import Firestore db instance
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy // Added query, orderBy for potential sorting
} from 'firebase/firestore';

// Department Type (matching Firestore structure)
interface Department {
  id: string; // Firestore document ID
  name: string;
  color: string;
  roleCount: number; 
  // Add order field if we implement reordering later
  // order?: number;
}

const DepartmentManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]); // Initialize as empty
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const departmentsCollectionRef = collection(db, "departments");

  // --- Fetch Departments --- 
  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Optional: Order by name
        const q = query(departmentsCollectionRef, orderBy("name"));
        const data = await getDocs(q); 
        const fetchedDepartments = data.docs.map((doc) => ({ 
            ...doc.data(), 
            id: doc.id 
        })) as Department[];
        setDepartments(fetchedDepartments);
    } catch (err) {
        console.error("Error fetching departments:", err);
        setError("Failed to fetch departments. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []); // useCallback to stabilize the function reference

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  // --- Dialog Actions ---
  const openAddDialog = () => {
    setEditingDepartment(null); // Ensure we are in 'add' mode
    setIsDialogOpen(true);
  };

  const openEditDialog = (dept: Department) => {
    setEditingDepartment(dept);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingDepartment(null); // Clear editing state on close
  };

  // --- CRUD Handlers ---
  const handleFormSubmit = async (data: DepartmentFormValues) => {
    if (!currentUser) return; // Ensure user is logged in
    setIsLoading(true); // Indicate loading during Firestore operation
    setError(null);

    if (editingDepartment) {
      // Edit existing department
      const deptDocRef = doc(db, "departments", editingDepartment.id);
      try {
        await updateDoc(deptDocRef, { 
            name: data.name, 
            color: data.color 
            // Note: Not updating roleCount here 
        });
        console.log('Updated department:', editingDepartment.id);
        fetchDepartments(); // Refetch data after update
      } catch (err) {
         console.error("Error updating department:", err);
         setError("Failed to update department.");
         setIsLoading(false); // Stop loading indicator on error
      }
    } else {
      // Add new department
      try {
         await addDoc(departmentsCollectionRef, { 
            name: data.name, 
            color: data.color, 
            roleCount: 0 // Initialize roleCount
            // Add order field later if needed
         });
         console.log('Added new department:');
         fetchDepartments(); // Refetch data after add
      } catch (err) {
          console.error("Error adding department:", err);
          setError("Failed to add department.");
          setIsLoading(false); // Stop loading indicator on error
      }
    }
    // No need to explicitly close dialog here, it's handled in DepartmentDialog onSubmit
    // Keep loading true until fetchDepartments finishes in the background
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return; 
    // Note: Consider adding setIsLoading/setError around delete too
    const confirmation = window.confirm("Are you sure you want to delete this department?"); // Simple confirm for now - AlertDialog handles UI
    if (!confirmation) return;

    const deptDocRef = doc(db, "departments", id);
    try {
        await deleteDoc(deptDocRef);
        console.log('Deleted department:', id);
        fetchDepartments(); // Refetch
    } catch (err) {
        console.error("Error deleting department:", err);
        setError("Failed to delete department.");
        // Optionally show error to user e.g., via toast
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
             <CardTitle>Department Management</CardTitle>
             <CardDescription>View, add, edit, and delete departments.</CardDescription>
          </div>
          {/* Use the function to open the Add dialog */}
          <Button onClick={openAddDialog} disabled={!currentUser}>
            Add Department
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Role Count</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Loading departments...
                </TableCell>
              </TableRow>
            ) : error ? (
               <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-destructive">
                  {error}
                </TableCell>
              </TableRow>
            ) : departments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No departments found. Add one to get started.
                </TableCell>
              </TableRow>
            ) : (
              departments.map((dept) => (
                <TableRow key={dept.id}>
                  <TableCell className="font-medium">{dept.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                       <span 
                          className="inline-block w-4 h-4 rounded-full mr-2 border border-gray-300"
                          style={{ backgroundColor: dept.color }}
                       ></span>
                       {dept.color}
                    </div>
                  </TableCell>
                  <TableCell>{dept.roleCount}</TableCell>
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
                        {/* Use function to open Edit dialog */}
                        <DropdownMenuItem onClick={() => openEditDialog(dept)} disabled={!currentUser}>
                          Edit
                        </DropdownMenuItem>
                        {/* Wrap Delete in AlertDialog */}
                        <AlertDialog>
                           <AlertDialogTrigger asChild>
                              <DropdownMenuItem 
                                 onSelect={(e) => e.preventDefault()} // Prevent closing dropdown
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
                                 <strong>{dept.name}</strong> department.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               {/* AlertDialogAction now calls the async handleDelete */}
                               <AlertDialogAction onClick={() => handleDelete(dept.id)} className="bg-red-600 hover:bg-red-700">
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
      <DepartmentDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        onSubmit={handleFormSubmit} 
        initialData={editingDepartment}
      />
    </Card>
  );
};

export default DepartmentManagement; 