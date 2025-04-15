import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle } from 'lucide-react'; // Added PlusCircle for Add button
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge'; // For displaying skills or level
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext'; // Use correct path
import RoleDialog from './RoleDialog'; // Import the dialog component
import { type RoleFormValues, type StandardResponsibility, type StandardSkill } from './RoleDialog'; // Import types from RoleDialog
import { db } from '@/lib/firebase'; // Import db
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy, where, increment, writeBatch
} from 'firebase/firestore';

// Updated Role Type to store IDs from Firestore
interface Role {
  id: string; // Firestore document ID
  title: string;
  level: string;
  department: string; 
  // Store arrays of IDs fetched from Firestore
  responsibilityIds: string[]; 
  skillIds: string[];
  // We might need to store the fetched full objects transiently for the dialog later
  handlesComplaints?: boolean;
  complaintsPerFTE?: number | null;
  hoursPerWorkOrder?: number | null;
}

const RoleManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [roles, setRoles] = useState<Role[]>([]); // Initialize empty
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null); 
  // We'll need a way to pass the full responsibility/skill objects to the dialog when editing
  // For now, the dialog fetches its own standard lists

  const rolesCollectionRef = collection(db, "roles");
  const departmentsCollectionRef = collection(db, "departments"); // Add ref for departments

  // --- Helper to update department role count ---
  const updateDepartmentRoleCount = async (departmentName: string, change: number) => {
    if (!departmentName) return; // Don't proceed if department name is empty

    console.log(`Attempting to update role count for department "${departmentName}" by ${change}`);
    const q = query(departmentsCollectionRef, where("name", "==", departmentName));
    
    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            console.warn(`Department named "${departmentName}" not found. Cannot update role count.`);
            return;
        }
        
        // Assuming department names are unique, update the first match
        const departmentDocRef = doc(db, "departments", querySnapshot.docs[0].id);
        await updateDoc(departmentDocRef, {
            roleCount: increment(change)
        });
        console.log(`Successfully updated role count for department "${departmentName}"`);
    } catch (error) {
        console.error(`Error updating role count for department "${departmentName}":`, error);
        // Optionally set an error state or notify the user
    }
  };

  // --- Fetch Roles --- 
  const fetchRoles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        // Optional: Order by title
        const q = query(rolesCollectionRef, orderBy("title"));
        const data = await getDocs(q);
        const fetchedRoles = data.docs.map((doc) => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<Role, 'id'>) // Cast data, ensuring required fields exist
        })) as Role[];
         // Ensure arrays exist even if missing in Firestore
         fetchedRoles.forEach(role => {
            role.responsibilityIds = role.responsibilityIds || [];
            role.skillIds = role.skillIds || [];
            role.handlesComplaints = role.handlesComplaints ?? false; // Default to false
            role.complaintsPerFTE = role.complaintsPerFTE ?? null; // Default to null
            role.hoursPerWorkOrder = role.hoursPerWorkOrder ?? null; // Default to null
         });
        setRoles(fetchedRoles);
    } catch (err) {
        console.error("Error fetching roles:", err);
        setError("Failed to fetch roles. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

   // --- Dialog Actions --- 
  const openAddDialog = () => {
    setEditingRole(null);
    // Dialog needs to fetch standard lists itself
    setIsDialogOpen(true);
  };

  const openEditDialog = (role: Role) => {
    // Pass the full role object, including new fields, to the dialog
    setEditingRole(role); 
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingRole(null);
  };


  // --- CRUD Handlers --- 
  const handleFormSubmit = async (data: RoleFormValues) => {
    if (!currentUser) return;
    console.log('RoleManagement received data:', data); // Log received data
    // Don't set isLoading here, let the operations manage it to avoid flickering
    // setIsLoading(true); 
    setError(null);

    // Extract only IDs for saving
    const responsibilityIdsToSave = (data.responsibilities || []).map(r => r.id);
    const skillIdsToSave = (data.skills || []).map(s => s.id);

    // Data to save to Firestore
    const roleDataToSave = {
        title: data.title,
        level: data.level,
        department: data.department, // Department Name
        responsibilityIds: responsibilityIdsToSave,
        skillIds: skillIdsToSave,
        handlesComplaints: data.handlesComplaints ?? false,
        complaintsPerFTE: data.complaintsPerFTE === null || data.complaintsPerFTE === undefined ? null : Number(data.complaintsPerFTE),
        hoursPerWorkOrder: data.hoursPerWorkOrder === null || data.hoursPerWorkOrder === undefined ? null : Number(data.hoursPerWorkOrder),
    };

    // Ensure dependent fields are nulled out based on handlesComplaints
    if (roleDataToSave.handlesComplaints) {
        roleDataToSave.hoursPerWorkOrder = null;
    } else {
        roleDataToSave.complaintsPerFTE = null;
    }

    if (editingRole) {
      // Edit existing role
      const roleDocRef = doc(db, "roles", editingRole.id);
      const oldDepartmentName = editingRole.department;
      const newDepartmentName = roleDataToSave.department;

      try {
        setIsLoading(true); // Start loading before async ops
        // Use a batch write for atomicity if department changes
        if (oldDepartmentName !== newDepartmentName) {
            const batch = writeBatch(db);
            
            // 1. Update Role
            batch.update(roleDocRef, roleDataToSave);

            // 2. Decrement old department count
            const oldDeptQuery = query(departmentsCollectionRef, where("name", "==", oldDepartmentName));
            const oldDeptSnapshot = await getDocs(oldDeptQuery);
            if (!oldDeptSnapshot.empty) {
                const oldDeptDocRef = doc(db, "departments", oldDeptSnapshot.docs[0].id);
                batch.update(oldDeptDocRef, { roleCount: increment(-1) });
            } else {
                 console.warn(`Old department "${oldDepartmentName}" not found during edit.`);
            }

            // 3. Increment new department count
            const newDeptQuery = query(departmentsCollectionRef, where("name", "==", newDepartmentName));
            const newDeptSnapshot = await getDocs(newDeptQuery);
            if (!newDeptSnapshot.empty) {
                const newDeptDocRef = doc(db, "departments", newDeptSnapshot.docs[0].id);
                batch.update(newDeptDocRef, { roleCount: increment(1) });
            } else {
                 console.warn(`New department "${newDepartmentName}" not found during edit.`);
            }
            
            await batch.commit();
            console.log('Updated role and department counts via batch:', editingRole.id);

        } else {
            // Department didn't change, just update the role
            await updateDoc(roleDocRef, roleDataToSave);
            console.log('Updated role (department unchanged):', editingRole.id);
        }
        
        fetchRoles(); // Refetch
        closeDialog(); // Close dialog on success
      } catch (err) {
         console.error("Error updating role:", err);
         setError("Failed to update role.");
      } finally {
          setIsLoading(false); // Stop loading regardless of success/failure
      }
    } else {
      // Add new role
      try {
        setIsLoading(true); // Start loading
        const docRef = await addDoc(rolesCollectionRef, roleDataToSave);
        console.log('Added new role:', docRef.id);
        
        // Increment count for the new department
        await updateDepartmentRoleCount(roleDataToSave.department, 1);
        
        fetchRoles(); // Refetch
        closeDialog(); // Close dialog on success
      } catch (err) {
          console.error("Error adding role:", err);
          setError("Failed to add role.");
      } finally {
          setIsLoading(false); // Stop loading
      }
    }
    // Close is now handled inside try/catch blocks on success
    // closeDialog(); 
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return; 
    
    const roleToDelete = roles.find(r => r.id === id);
    if (!roleToDelete) {
        console.error("Role to delete not found in local state:", id);
        setError("Could not find the role to delete.");
        return;
    }

    const departmentNameToDecrement = roleToDelete.department;
    const roleDocRef = doc(db, "roles", id);

    try {
        setIsLoading(true); // Optional: indicate loading during delete
        // Decrement department count first
        await updateDepartmentRoleCount(departmentNameToDecrement, -1);

        // Then delete the role
        await deleteDoc(roleDocRef);
        console.log('Deleted role:', id);
        
        fetchRoles(); // Refetch
    } catch (err) {
        console.error("Error deleting role:", err);
        setError("Failed to delete role.");
        // Consider rolling back decrement if needed, though unlikely necessary here
    } finally {
        setIsLoading(false); // Stop loading
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
             <CardTitle>Role Management</CardTitle>
             <CardDescription>View, add, edit, and delete roles across departments.</CardDescription>
          </div>
          <Button onClick={openAddDialog} disabled={!currentUser}> {/* Disable if not logged in */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add Role
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Responsibilities</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">Loading roles...</TableCell></TableRow>
            ) : error ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center text-destructive">{error}</TableCell></TableRow>
            ) : roles.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="h-24 text-center">No roles found.</TableCell></TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.title}</TableCell>
                  <TableCell>{role.department}</TableCell>
                  <TableCell>
                     <Badge variant="secondary">{role.level}</Badge>
                  </TableCell>
                  <TableCell>{role.responsibilityIds?.length || 0}</TableCell>
                  <TableCell>{role.skillIds?.length || 0}</TableCell>
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
                        <DropdownMenuItem onClick={() => openEditDialog(role)} disabled={!currentUser}>
                          Edit
                        </DropdownMenuItem>
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
                                 <strong>{role.title}</strong> role.
                               </AlertDialogDescription>
                             </AlertDialogHeader>
                             <AlertDialogFooter>
                               <AlertDialogCancel>Cancel</AlertDialogCancel>
                               <AlertDialogAction onClick={() => handleDelete(role.id)} className="bg-red-600 hover:bg-red-700">
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
      <RoleDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        onSubmit={handleFormSubmit} 
        initialData={editingRole}
      />
    </Card>
  );
};

export default RoleManagement; 