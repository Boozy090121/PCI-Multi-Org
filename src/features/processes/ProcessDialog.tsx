import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, addDoc } from 'firebase/firestore';
import { type StandardResponsibility } from '../standard-items/StandardResponsibilityManagement'; // Use the correct type
import { useAuth } from '@/context/AuthContext';

// --- Zod Schema and Types ---
const standardResponsibilitySchemaForForm = z.object({ 
    id: z.string(), 
    name: z.string(), 
    description: z.string().nullable().optional(),
});

const processSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Process name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional(),
  responsibilities: z.array(standardResponsibilitySchemaForForm).min(1, { message: "Please select at least one responsibility." }), // Require at least one responsibility
});

export type ProcessFormValues = z.infer<typeof processSchema>;

// Process type matching Firestore structure (used for initialData)
export interface Process {
  id: string;
  name: string;
  description?: string;
  responsibilityIds?: string[]; 
}

// --- Component Props ---
interface ProcessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProcessFormValues) => Promise<void> | void;
  initialData?: Process | null; 
}

// --- Component Implementation ---
const ProcessDialog: React.FC<ProcessDialogProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
  const { currentUser } = useAuth(); // Get user for disabling actions potentially

  // State for fetched responsibilities and UI
  const [standardResponsibilities, setStandardResponsibilities] = useState<StandardResponsibility[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [respPopoverOpen, setRespPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState(""); // State for search term
  const [isCreatingResp, setIsCreatingResp] = useState(false); // State for creation loading

  const form = useForm<ProcessFormValues>({
    resolver: zodResolver(processSchema),
    defaultValues: { 
        name: "", 
        description: "", 
        responsibilities: [] 
    }, 
  });

  // --- Fetch Standard Responsibilities --- 
  const fetchData = useCallback(async () => {
    if (!isOpen) return; // Don't fetch if dialog isn't open
    setIsLoadingData(true);
    setErrorData(null);
    try {
        const responsibilitiesPromise = getDocs(query(collection(db, "standardResponsibilities"), orderBy("name")));
        const [responsibilitiesSnap] = await Promise.all([responsibilitiesPromise]);
        const fetchedResponsibilities = responsibilitiesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardResponsibility[];
        setStandardResponsibilities(fetchedResponsibilities);
    } catch (err) {
        console.error("Error fetching standard responsibilities for process dialog:", err);
        setErrorData("Failed to load standard responsibilities list.");
    } finally {
        setIsLoadingData(false);
    }
  }, [isOpen]); // Dependency: only refetch if isOpen changes (or on mount if always open)

  // Fetch data when dialog opens
  useEffect(() => {
      fetchData();
  }, [fetchData]); // fetchData includes isOpen dependency

  // --- Form Reset Logic ---
  useEffect(() => {
    if (isOpen) {
       let initialResponsibilitiesForForm: StandardResponsibility[] = [];
       
       // If editing and we have initial data and responsibilities list is loaded
       if (initialData && standardResponsibilities.length > 0 && initialData.responsibilityIds) {
            initialResponsibilitiesForForm = standardResponsibilities.filter(sr => 
                 initialData.responsibilityIds?.includes(sr.id)
            );
       }

       form.reset({
            id: initialData?.id,
            name: initialData?.name || "",
            description: initialData?.description || "",
            responsibilities: initialResponsibilitiesForForm,
       });
    } 
  }, [initialData, isOpen, form, standardResponsibilities]); // Re-run if lists/data change

  // --- Form Submission Handler ---
  const handleFormSubmit = async (data: ProcessFormValues) => {
    try {
        await onSubmit(data); // Pass data up to parent
        // No need to call onClose here, parent should handle it on successful submit
    } catch (error) {
        console.error("Error submitting process form from dialog:", error);
        // Optionally display an error message within the dialog
    }
  };

  // --- Multi-select Handlers for Responsibilities ---
  const handleToggleResponsibility = (resp: StandardResponsibility) => {
    const current = form.getValues('responsibilities') || [];
    const isSelected = current.some(r => r.id === resp.id);
    if (isSelected) {
        form.setValue('responsibilities', current.filter((r) => r.id !== resp.id), { shouldValidate: true });
    } else {
        form.setValue('responsibilities', [...current, resp], { shouldValidate: true });
    }
  };
  const handleRemoveResponsibility = (id: string) => {
      const current = form.getValues('responsibilities') || [];
      form.setValue('responsibilities', current.filter((r) => r.id !== id), { shouldValidate: true });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose(); // Ensure parent's close handler is called
    }
  };

  const selectedResponsibilities = form.watch('responsibilities') || [];

  // --- Handler to Create New Responsibility --- 
  const handleCreateResponsibility = async (name: string) => {
    if (!name || isCreatingResp) return;
    setIsCreatingResp(true);
    setErrorData(null); // Clear previous errors
    try {
      const newRespData = { name: name.trim(), description: null }; // Basic data
      const docRef = await addDoc(collection(db, "standardResponsibilities"), newRespData);
      console.log("Created new responsibility:", docRef.id);

      const newResponsibility: StandardResponsibility = {
        id: docRef.id,
        ...newRespData
      };

      // Add to local state
      setStandardResponsibilities(prev => [...prev, newResponsibility].sort((a, b) => a.name.localeCompare(b.name))); 
      
      // Add to form selection
      handleToggleResponsibility(newResponsibility);

      // Clear search term
      setSearchTerm(""); 
      // Maybe close popover? setRespPopoverOpen(false); // Optional

    } catch (err) {
        console.error("Error creating standard responsibility:", err);
        setErrorData("Failed to create new responsibility."); // Show error specific to creation
    } finally {
        setIsCreatingResp(false);
    }
  };

  // Filtered responsibilities based on search term
  const filteredResponsibilities = standardResponsibilities.filter(resp => 
    resp.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if the exact search term exists
  const exactMatchExists = standardResponsibilities.some(resp => 
    resp.name.toLowerCase() === searchTerm.toLowerCase().trim()
  );

  // --- Render Dialog ---
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Process' : 'Create New Process'}</DialogTitle>
          <DialogDescription>
            Define the process name, description, and select its associated responsibilities.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData && !initialData ? ( 
             <div className="flex items-center justify-center p-10"> <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading selection options... </div>
         ) : errorData ? (
             <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md"> {errorData} </div>
         ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                 {/* Name Field */}
                 <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Process Name *</FormLabel> <FormControl><Input placeholder="e.g., User Onboarding" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Description Field */}
                 <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="Describe the purpose and steps of this process..." {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                 
                 {/* Target Responsibilities Multi-Select Field */}
                  <FormField
                     control={form.control}
                     name="responsibilities"
                     render={({ field }) => (
                         <FormItem className="flex flex-col">
                             <FormLabel>Associated Responsibilities *</FormLabel>
                             <Popover open={respPopoverOpen} onOpenChange={setRespPopoverOpen}>
                                 <PopoverTrigger asChild>
                                      <Button
                                         variant="outline"
                                         role="combobox"
                                         aria-expanded={respPopoverOpen}
                                         className={cn("w-full justify-between", !selectedResponsibilities.length && "text-muted-foreground")}
                                         disabled={isLoadingData || standardResponsibilities.length === 0} // Disable if no responsibilities loaded
                                     >
                                         <span className="truncate"> 
                                             {selectedResponsibilities.length > 0 
                                                 ? `${selectedResponsibilities.length} selected` 
                                                 : (standardResponsibilities.length === 0 ? "No responsibilities available" : "Select responsibilities...")}
                                         </span>
                                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                     </Button>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                     <Command filter={(value, search) => {
                                         // Custom filter function might not be strictly needed if we filter manually
                                         // but can be useful. Return 1 for match, 0 for no match.
                                         if (value.toLowerCase().includes(search.toLowerCase())) return 1;
                                         return 0;
                                      }}>
                                         <CommandInput 
                                            placeholder="Search or Create responsibility..." 
                                            value={searchTerm}
                                            onValueChange={setSearchTerm} // Update search term state
                                         />
                                         <CommandList>
                                             {isLoadingData && <CommandEmpty>Loading...</CommandEmpty>}
                                             {errorData && <CommandEmpty className="text-destructive">{errorData}</CommandEmpty>}
                                             {!isLoadingData && !errorData && standardResponsibilities.length === 0 && !searchTerm && <CommandEmpty>No standard responsibilities found.</CommandEmpty>}
                                             
                                             {/* Create New Option */}
                                             {!isLoadingData && searchTerm && !exactMatchExists && (
                                                <CommandItem 
                                                    onSelect={() => handleCreateResponsibility(searchTerm)}
                                                    disabled={isCreatingResp}
                                                    className="text-blue-600 hover:text-blue-700 cursor-pointer"
                                                >
                                                   {isCreatingResp ? (
                                                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                                                   ) : (
                                                      <>Create "{searchTerm}"</>
                                                   )}
                                                </CommandItem>
                                             )}

                                             {/* Existing Items */}
                                             {!isLoadingData && !errorData && (
                                                 <CommandGroup>
                                                     {filteredResponsibilities.map((resp) => (
                                                         <CommandItem
                                                             key={resp.id}
                                                             value={resp.name} // Value for search
                                                             onSelect={() => handleToggleResponsibility(resp)}
                                                         >
                                                             <Check
                                                                 className={cn("mr-2 h-4 w-4", selectedResponsibilities.some(r => r.id === resp.id) ? "opacity-100" : "opacity-0")}
                                                             />
                                                             {resp.name}
                                                         </CommandItem>
                                                     ))}
                                                 </CommandGroup>
                                             )}
                                         </CommandList>
                                     </Command>
                                 </PopoverContent>
                             </Popover>
                             <div className="space-x-1 space-y-1 pt-1 min-h-[24px]">
                                {selectedResponsibilities.map((resp) => (
                                    <Badge variant="secondary" key={resp.id}>
                                       {resp.name}
                                       <button 
                                           type="button"
                                           className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                           onClick={() => handleRemoveResponsibility(resp.id)}
                                        >
                                            <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                       </button>
                                    </Badge>
                                ))}
                             </div>
                             <FormMessage /> { /* Show validation error for min(1) */}
                         </FormItem>
                     )}
                  />

                <DialogFooter className="pt-4">
                   <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button> 
                      {/* Removed onClick={onClose} because DialogClose handles it */}
                   </DialogClose>
                   <Button type="submit" disabled={!currentUser || form.formState.isSubmitting || isLoadingData}>
                      <>
                        {form.formState.isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {initialData ? 'Save Changes' : 'Create Process'}
                      </>
                   </Button>
                </DialogFooter>
              </form>
            </Form>
         )}
      </DialogContent>
    </Dialog>
  );
};

export default ProcessDialog; 