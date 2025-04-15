import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuth } from '@/context/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, X as XIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { type StandardResponsibility } from '../standard-items/StandardResponsibilityManagement';

// Define Matrix Type options
const matrixTypes = ['RACI', 'RAPID', 'Custom'] as const;

// Define Role type locally or import
interface Role {
    id: string;
    title: string;
}

// Standard Responsibility schema object for use in the main schema
const standardResponsibilitySchemaForForm = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(), // Allow description to be null or undefined
});

// Role schema object for use in the main schema
const roleSchemaForForm = z.object({
    id: z.string(),
    title: z.string(),
});

// Main form schema
const matrixSchema = z.object({
  id: z.string().optional(), // Keep ID optional for adds
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  type: z.enum(['RACI', 'RAPID', 'Custom'], { required_error: "Matrix type is required." }),
  linkedProject: z.string().optional(),
  // Add field for selected responsibilities (array of objects for form state)
  responsibilities: z.array(standardResponsibilitySchemaForForm).optional().default([]),
  roles: z.array(roleSchemaForForm).optional().default([]), // Add roles field
});

// Type for form values inferred from schema
export type MatrixFormValues = z.infer<typeof matrixSchema>;

// Interface for full matrix data potentially passed as initialData
// This now includes the responsibilities array (or their IDs initially)
interface InitialMatrixData extends Omit<MatrixFormValues, 'responsibilities' | 'roles'> {
    // When editing, the parent component might pass IDs which need mapping
    responsibilityIds?: string[]; 
    // Or ideally, pass the full objects if already fetched by parent
    responsibilities?: StandardResponsibility[]; 
    roleIds?: string[]; // Add roleIds
    roles?: Role[]; // Add roles
}

interface MatrixDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MatrixFormValues) => Promise<void> | void; 
  initialData?: InitialMatrixData | null; 
}

const MatrixDialog: React.FC<MatrixDialogProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
  const { currentUser } = useAuth();

  // State for fetched responsibilities
  const [standardResponsibilities, setStandardResponsibilities] = useState<StandardResponsibility[]>([]);
  const [roles, setRoles] = useState<Role[]>([]); // Add roles state
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [respPopoverOpen, setRespPopoverOpen] = useState(false);
  const [rolePopoverOpen, setRolePopoverOpen] = useState(false); // Add popover state for roles

  const form = useForm<MatrixFormValues>({
    resolver: zodResolver(matrixSchema),
    defaultValues: { 
        name: "", 
        type: undefined, // Ensure type is initially undefined for placeholder
        linkedProject: "", 
        responsibilities: [],
        roles: [] // Add default roles
    }, 
  });

  // --- Fetch Standard Responsibilities --- 
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setErrorData(null);
    try {
        const respPromise = getDocs(query(collection(db, "standardResponsibilities"), orderBy("name")));
        const rolesPromise = getDocs(query(collection(db, "roles"), orderBy("title"))); // Fetch roles ordered by title
        
        const [respSnap, rolesSnap] = await Promise.all([respPromise, rolesPromise]); // Fetch both
        
        const fetchedResponsibilities = respSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardResponsibility[];
        const fetchedRoles = rolesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Role[]; // Process roles

        setStandardResponsibilities(fetchedResponsibilities);
        setRoles(fetchedRoles); // Set roles state

    } catch (err) {
        console.error("Error fetching data for matrix dialog:", err);
        setErrorData("Failed to load responsibilities or roles list.");
    } finally {
        setIsLoadingData(false);
    }
  }, []);

  // Fetch data when dialog opens
  useEffect(() => {
      if (isOpen) {
          fetchData();
      }
  }, [isOpen, fetchData]);

  // Reset form when initialData changes or dialog opens
  useEffect(() => {
    if (isOpen) {
       let initialResponsibilitiesForForm: StandardResponsibility[] = [];
       let initialRolesForForm: Role[] = []; // Variable for initial roles

       if (initialData && standardResponsibilities.length > 0 && roles.length > 0) {
            // Handle Responsibilities (as before)
           if (initialData.responsibilityIds) {
                initialResponsibilitiesForForm = standardResponsibilities.filter(sr => 
                   initialData.responsibilityIds?.includes(sr.id)
                );
           } else if (initialData.responsibilities) {
              initialResponsibilitiesForForm = initialData.responsibilities;
           }
           
            // Handle Roles (similar logic)
           if (initialData.roleIds) {
               initialRolesForForm = roles.filter(r => 
                   initialData.roleIds?.includes(r.id)
               );
           } else if (initialData.roles) {
              initialRolesForForm = initialData.roles;
           }
       }

       form.reset({
            name: initialData?.name || "",
            type: initialData?.type || undefined,
            linkedProject: initialData?.linkedProject || "",
            responsibilities: initialResponsibilitiesForForm,
            roles: initialRolesForForm, // Reset roles field
       });
    } else {
        // Optional: Reset form on close if needed, though reset on open is usually sufficient
        // form.reset({ name: "", type: undefined, linkedProject: "", responsibilities: [] });
    }
  }, [initialData, isOpen, form, standardResponsibilities, roles]); // Add roles dependency

  const handleFormSubmit = async (data: MatrixFormValues) => {
    try {
        // onSubmit prop expects the form values including the array of responsibility objects
        // The parent component (MatrixManagement) will handle extracting IDs if needed
        await onSubmit(data);
        onClose(); // Close dialog on successful submit
    } catch (error) {
        console.error("Error submitting matrix form:", error);
        // Error handled by parent or shown here
    }
  };

  // --- Multi-select Handlers --- 
  const handleToggleResponsibility = (item: StandardResponsibility) => {
    const current = form.getValues('responsibilities') || [];
    const isSelected = current.some(r => r.id === item.id);
    if (isSelected) {
        form.setValue('responsibilities', current.filter((r) => r.id !== item.id), { shouldValidate: true });
    } else {
        form.setValue('responsibilities', [...current, item], { shouldValidate: true });
    }
  };
  const handleRemoveResponsibility = (id: string) => {
      const current = form.getValues('responsibilities') || [];
      form.setValue('responsibilities', current.filter((r) => r.id !== id), { shouldValidate: true });
  };

  const handleToggleRole = (role: Role) => {
    const current = form.getValues('roles') || [];
    const isSelected = current.some(r => r.id === role.id);
    if (isSelected) {
        form.setValue('roles', current.filter((r) => r.id !== role.id), { shouldValidate: true });
    } else {
        form.setValue('roles', [...current, role], { shouldValidate: true });
    }
  };
  const handleRemoveRole = (id: string) => {
      const current = form.getValues('roles') || [];
      form.setValue('roles', current.filter((r) => r.id !== id), { shouldValidate: true });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const selectedResponsibilities = form.watch('responsibilities') || [];
  const selectedRoles = form.watch('roles') || []; // Watch selected roles

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Matrix Settings' : 'Create New Matrix'}</DialogTitle>
          <DialogDescription>
            Configure the matrix details and select the responsibilities to include.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData && !initialData ? ( // Show loading only on initial load for Add
             <div className="flex items-center justify-center p-10">
                 <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading selection options...
             </div>
         ) : errorData ? (
             <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md">
                 {errorData}
             </div>
         ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 {/* Name Field */}
                 <FormField
                   control={form.control}
                   name="name"
                   render={({ field }) => (
                     <FormItem> <FormLabel>Matrix Name *</FormLabel> <FormControl><Input placeholder="e.g., Project Alpha RACI" {...field} /></FormControl> <FormMessage /> </FormItem>
                   )}
                 />
                 
                 <div className="grid grid-cols-2 gap-4">
                    {/* Type Field */}
                     <FormField
                       control={form.control}
                       name="type"
                       render={({ field }) => (
                         <FormItem>
                           <FormLabel>Type *</FormLabel>
                           <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}> 
                             <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                             <SelectContent>
                               <SelectItem value="RACI">RACI</SelectItem>
                               <SelectItem value="RAPID">RAPID</SelectItem>
                               <SelectItem value="Custom">Custom</SelectItem>
                             </SelectContent>
                           </Select>
                           <FormMessage />
                         </FormItem>
                       )}
                     />
                     {/* Linked Project Field */}
                     <FormField
                       control={form.control}
                       name="linkedProject"
                       render={({ field }) => (
                         <FormItem> <FormLabel>Linked Project (Optional)</FormLabel> <FormControl><Input placeholder="e.g., Project Alpha" {...field} value={field.value ?? ''}/></FormControl> <FormMessage /> </FormItem>
                       )}
                     />
                 </div>

                 {/* Responsibilities Multi-Select Field */}
                  <FormField
                     control={form.control}
                     name="responsibilities"
                     render={({ field }) => (
                         <FormItem className="flex flex-col">
                             <FormLabel>Included Responsibilities</FormLabel>
                             <Popover open={respPopoverOpen} onOpenChange={setRespPopoverOpen}>
                                 <PopoverTrigger asChild>
                                     <FormControl>
                                         <Button
                                             variant="outline"
                                             role="combobox"
                                             aria-expanded={respPopoverOpen}
                                             className={cn("w-full justify-between", !selectedResponsibilities.length && "text-muted-foreground")}
                                             disabled={isLoadingData} // Disable while loading
                                         >
                                             <span className="truncate"> 
                                                 {selectedResponsibilities.length > 0 
                                                     ? `${selectedResponsibilities.length} selected` 
                                                     : "Select responsibilities..."}
                                             </span>
                                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                         </Button>
                                     </FormControl>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                     <Command>
                                         <CommandInput placeholder="Search responsibilities..." />
                                         <CommandList>
                                             {isLoadingData && <CommandEmpty>Loading...</CommandEmpty>}
                                             {errorData && <CommandEmpty className="text-destructive">{errorData}</CommandEmpty>}
                                             {!isLoadingData && !errorData && standardResponsibilities.length === 0 && <CommandEmpty>No standard responsibilities found.</CommandEmpty>}
                                             {!isLoadingData && !errorData && standardResponsibilities.length > 0 && (
                                                 <CommandGroup>
                                                     {standardResponsibilities.map((resp) => (
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
                              {/* Display Selected as Badges */}
                             <div className="space-x-1 space-y-1 pt-1 min-h-[24px]"> {/* Min height for consistent spacing */}
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
                         </FormItem>
                     )}
                  />

                 {/* Roles Multi-Select Field - ADDED */}
                  <FormField
                     control={form.control}
                     name="roles"
                     render={({ field }) => (
                         <FormItem className="flex flex-col">
                             <FormLabel>Included Roles</FormLabel>
                             <Popover open={rolePopoverOpen} onOpenChange={setRolePopoverOpen}>
                                 <PopoverTrigger asChild>
                                     <FormControl>
                                         <Button
                                             variant="outline"
                                             role="combobox"
                                             aria-expanded={rolePopoverOpen}
                                             className={cn("w-full justify-between", !selectedRoles.length && "text-muted-foreground")}
                                             disabled={isLoadingData}
                                         >
                                             <span className="truncate"> 
                                                 {selectedRoles.length > 0 
                                                     ? `${selectedRoles.length} selected` 
                                                     : "Select roles..."}
                                             </span>
                                             <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                         </Button>
                                     </FormControl>
                                 </PopoverTrigger>
                                 <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                                     <Command>
                                         <CommandInput placeholder="Search roles..." />
                                         <CommandList>
                                             {isLoadingData && <CommandEmpty>Loading...</CommandEmpty>}
                                             {errorData && <CommandEmpty className="text-destructive">{errorData}</CommandEmpty>}
                                             {!isLoadingData && !errorData && roles.length === 0 && <CommandEmpty>No roles found.</CommandEmpty>}
                                             {!isLoadingData && !errorData && roles.length > 0 && (
                                                 <CommandGroup>
                                                     {roles.map((role) => (
                                                         <CommandItem
                                                             key={role.id}
                                                             value={role.title} // Value for search
                                                             onSelect={() => handleToggleRole(role)}
                                                         >
                                                             <Check
                                                                 className={cn("mr-2 h-4 w-4", selectedRoles.some(r => r.id === role.id) ? "opacity-100" : "opacity-0")}
                                                             />
                                                             {role.title}
                                                         </CommandItem>
                                                     ))}
                                                 </CommandGroup>
                                             )}
                                         </CommandList>
                                     </Command>
                                 </PopoverContent>
                             </Popover>
                              {/* Display Selected Roles as Badges */}
                             <div className="space-x-1 space-y-1 pt-1 min-h-[24px]">
                                {selectedRoles.map((role) => (
                                    <Badge variant="secondary" key={role.id}>
                                       {role.title}
                                       <button 
                                           type="button"
                                           className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                           onClick={() => handleRemoveRole(role.id)}
                                        >
                                            <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                       </button>
                                    </Badge>
                                ))}
                             </div>
                         </FormItem>
                     )}
                  />

                <DialogFooter>
                   <DialogClose asChild>
                       <Button type="button" variant="outline">Cancel</Button>
                   </DialogClose>
                   <Button type="submit" disabled={form.formState.isSubmitting || isLoadingData}>
                      {form.formState.isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Create Matrix')}
                   </Button>
                </DialogFooter>
              </form>
            </Form>
         )}
      </DialogContent>
    </Dialog>
  );
};

export default MatrixDialog; 