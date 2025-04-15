import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MoreHorizontal, PlusCircle, Loader2, FileWarning } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAuth } from '@/context/AuthContext';
import ProcessDialog from './ProcessDialog';
import { type Process, type ProcessFormValues } from './ProcessDialog';
import { db } from '@/lib/firebase';
import { 
    collection, getDocs, addDoc, updateDoc, deleteDoc, doc, 
    query, orderBy
} from 'firebase/firestore';

const ProcessManagement: React.FC = () => {
  const { currentUser } = useAuth();
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProcess, setEditingProcess] = useState<Process | null>(null); 

  const processesCollectionRef = collection(db, "processes");

  const fetchProcesses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
        const q = query(processesCollectionRef, orderBy("name"));
        const data = await getDocs(q);
        const fetchedProcesses = data.docs.map((doc) => ({ 
            id: doc.id, 
            ...(doc.data() as Omit<Process, 'id'>) 
        })) as Process[];
         // Ensure responsibilityIds array exists
         fetchedProcesses.forEach(proc => {
            proc.responsibilityIds = proc.responsibilityIds || [];
         });
        setProcesses(fetchedProcesses);
    } catch (err) {
        console.error("Error fetching processes:", err);
        setError("Failed to fetch processes. Please try again.");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const openAddDialog = () => {
    setEditingProcess(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (process: Process) => {
    setEditingProcess(process);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setEditingProcess(null);
  };

  const handleFormSubmit = async (data: ProcessFormValues) => {
    if (!currentUser) return;
    setError(null);

    const responsibilityIdsToSave = (data.responsibilities || []).map(r => r.id);

    const processDataToSave = {
        name: data.name,
        description: data.description || null,
        responsibilityIds: responsibilityIdsToSave,
    };

    let operationSuccessful = false;
    try {
      if (editingProcess) {
        const processDocRef = doc(db, "processes", editingProcess.id);
        await updateDoc(processDocRef, processDataToSave);
        console.log('Updated process:', editingProcess.id);
      } else {
        const docRef = await addDoc(processesCollectionRef, processDataToSave);
        console.log('Added new process:', docRef.id);
      }
      operationSuccessful = true;
      fetchProcesses();
    } catch (err) {
       console.error(`Error ${editingProcess ? 'updating' : 'adding'} process:`, err);
       setError(`Failed to ${editingProcess ? 'update' : 'add'} process.`);
       throw err;
    } finally {
        if (operationSuccessful) {
           closeDialog();
        }
    }
  };

  const handleDelete = async (id: string) => {
    if (!currentUser) return; 
    const processDocRef = doc(db, "processes", id);
    try {
        await deleteDoc(processDocRef);
        console.log('Deleted process:', id);
        fetchProcesses();
    } catch (err) {
        console.error("Error deleting process:", err);
        setError("Failed to delete process.");
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row justify-between items-center">
        <div>
          <CardTitle>Process Management</CardTitle>
          <CardDescription>Define and manage business processes and their associated responsibilities.</CardDescription>
        </div>
        <Button onClick={openAddDialog} disabled={!currentUser}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Process
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-10 border border-dashed border-destructive rounded-md">
            <FileWarning className="w-12 h-12 text-destructive mb-4" />
            <p className="text-destructive font-semibold mb-2">Error Loading Processes</p>
            <p className="text-destructive text-center mb-4">{error}</p>
            <Button onClick={fetchProcesses} variant="destructive">Retry</Button>
          </div>
        ) : processes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-md">
            <FileWarning className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-semibold mb-2">No Processes Found</p>
            <p className="text-muted-foreground text-center mb-4">Get started by defining your first business process.</p>
            <Button onClick={openAddDialog} disabled={!currentUser}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Process
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Responsibilities</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium">{process.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground truncate max-w-xs">{process.description || '-'}</TableCell>
                  <TableCell className="text-center">{process.responsibilityIds?.length || 0}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button aria-haspopup="true" size="icon" variant="ghost">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Toggle menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openEditDialog(process)} disabled={!currentUser}>
                          Edit
                        </DropdownMenuItem>
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} disabled={!currentUser}> 
                                Delete
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the process 
                                  <strong>{process.name}</strong>.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(process.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <ProcessDialog 
        isOpen={isDialogOpen} 
        onClose={closeDialog} 
        onSubmit={handleFormSubmit} 
        initialData={editingProcess}
      />
    </Card>
  );
};

export default ProcessManagement; 