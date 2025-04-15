import React, { useEffect, useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
import { Badge } from "@/components/ui/badge";
import { X as XIcon, PlusCircle, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from '@/context/AuthContext';
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, getDocs, query, orderBy } from 'firebase/firestore'; // Import Firestore functions
import { type StandardResponsibility } from '../standard-items/StandardResponsibilityManagement'; // Import types
import { type StandardSkill } from '../standard-items/StandardSkillManagement';
import { Switch } from "@/components/ui/switch";

// Types for data needed by the dialog
// (Keep these as they are used by RoleManagement as well)
export { type StandardResponsibility, type StandardSkill }; 

// Updated Role interface (used for initialData)
interface Role {
  id: string;
  title: string;
  level: string;
  department: string; 
  skillCount?: number; // This might become derived or removed
  // Store selected standard items (or just their IDs)
  responsibilities?: StandardResponsibility[]; 
  skills?: StandardSkill[];
}

// Type matching the structure passed via props (IDs, not full objects initially)
interface InitialRoleData {
  id: string;
  title: string;
  level: string;
  department: string; 
  responsibilityIds?: string[]; 
  skillIds?: string[];
  handlesComplaints?: boolean;
  complaintsPerFTE?: number | null;
  hoursPerWorkOrder?: number | null;
}

// Placeholder Department Type (Fetch or pass these in a real app)
interface Department {
  id: string;
  name: string;
}

// --- Sample Standard Libraries (Replace with real data source later) ---
const sampleStandardResponsibilities: StandardResponsibility[] = [
  { id: 'resp-1', text: 'Develop and maintain software applications', category: 'Development' },
  { id: 'resp-2', text: 'Write clean, efficient, and well-documented code', category: 'Development' },
  { id: 'resp-3', text: 'Participate in code reviews and testing', category: 'Quality Assurance' },
  { id: 'resp-4', text: 'Troubleshoot and debug issues', category: 'Support' },
  { id: 'resp-5', text: 'Define product vision and strategy', category: 'Product Management' },
  { id: 'resp-6', text: 'Create and maintain product roadmap', category: 'Product Management' },
];

const sampleStandardSkills: StandardSkill[] = [
  { id: 'skill-1', name: 'JavaScript/TypeScript', category: 'Programming Language' },
  { id: 'skill-2', name: 'React', category: 'Frontend Framework' },
  { id: 'skill-3', name: 'Node.js', category: 'Backend Framework' },
  { id: 'skill-4', name: 'SQL/NoSQL databases', category: 'Database' },
  { id: 'skill-5', name: 'Git', category: 'Version Control' },
  { id: 'skill-6', name: 'Product Management', category: 'Methodology' },
  { id: 'skill-7', name: 'Market Analysis', category: 'Business Skill' },
];
// --- End Sample Libraries ---

// Zod schema - updated to use arrays of selected standard items (using zod objects for now)
// We might switch to just arrays of IDs later depending on how we fetch/manage data.
const standardResponsibilitySchema = z.object({ 
  id: z.string(), 
  name: z.string(), // Use 'name' to match actual data
  description: z.string().nullable().optional(), // Use 'description', allow null/optional
  category: z.string().optional() // Keep category if it might exist elsewhere
});
const standardSkillSchema = z.object({ id: z.string(), name: z.string(), category: z.string().optional() });

const roleFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(3, { message: "Role title must be at least 3 characters." }),
  level: z.string().min(1, { message: "Level is required (e.g., I, II, Senior)." }),
  department: z.string().min(1, { message: "Please select a department." }),
  // Store the full selected objects in the form state for easier UI management
  responsibilities: z.array(standardResponsibilitySchema).optional().default([]),
  skills: z.array(standardSkillSchema).optional().default([]),
  // Headcount Calculator Fields
  handlesComplaints: z.boolean().optional().default(false), 
  complaintsPerFTE: z.number().nullable().optional(), // Allow null if not applicable
  hoursPerWorkOrder: z.number().nullable().optional(), // Allow null if not applicable
});

type RoleFormValues = z.infer<typeof roleFormSchema>;

interface RoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RoleFormValues) => Promise<void> | void;
  initialData?: InitialRoleData | null; // Use the correct type for incoming data
}

const RoleDialog: React.FC<RoleDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const { currentUser } = useAuth();
  const [respPopoverOpen, setRespPopoverOpen] = useState(false);
  const [skillPopoverOpen, setSkillPopoverOpen] = useState(false);

  // --- State for Fetched Libraries ---
  const [standardResponsibilities, setStandardResponsibilities] = useState<StandardResponsibility[]>([]);
  const [standardSkills, setStandardSkills] = useState<StandardSkill[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    // Update default values to use the structured format
    defaultValues: initialData 
      ? { 
          id: initialData.id, 
          title: initialData.title, 
          level: initialData.level, 
          department: initialData.department,
          // Ensure initialData format matches StandardResponsibility/StandardSkill or map it here
          responsibilities: initialData.responsibilities || [],
          skills: initialData.skills || [],
          handlesComplaints: initialData.handlesComplaints,
          complaintsPerFTE: initialData.complaintsPerFTE,
          hoursPerWorkOrder: initialData.hoursPerWorkOrder
        } 
      : { title: '', level: '', department: '', responsibilities: [], skills: [], handlesComplaints: false, complaintsPerFTE: null, hoursPerWorkOrder: null },
  });

  // Reset form when initialData changes or dialog closes
  useEffect(() => {
    // Use the correct type here if needed, but access pattern should be okay
    const dataToReset = initialData 
      ? { 
          id: initialData.id, 
          title: initialData.title, 
          level: initialData.level, 
          department: initialData.department,
          // These will be populated by the second useEffect
          responsibilities: [], 
          skills: [],
          handlesComplaints: initialData.handlesComplaints,
          complaintsPerFTE: initialData.complaintsPerFTE,
          hoursPerWorkOrder: initialData.hoursPerWorkOrder
        } 
      : { title: '', level: '', department: '', responsibilities: [], skills: [], handlesComplaints: false, complaintsPerFTE: null, hoursPerWorkOrder: null };
    form.reset(dataToReset);
  }, [initialData, form, isOpen]); // Simpler effect just for basic fields reset

  // Populate selections when initialData AND standard lists are available
  useEffect(() => {
    if (isOpen && initialData && standardResponsibilities.length > 0 && standardSkills.length > 0) { 
      const initialResponsibilities = standardResponsibilities.filter(sr => 
        (initialData.responsibilityIds || []).includes(sr.id)
      );
      const initialSkills = standardSkills.filter(ss => 
        (initialData.skillIds || []).includes(ss.id)
      );

      // Update only the selections, don't reset everything again
      form.setValue('responsibilities', initialResponsibilities, { shouldDirty: false });
      form.setValue('skills', initialSkills, { shouldDirty: false });
      
    } 
    // This effect specifically handles populating the multi-selects
  }, [isOpen, initialData, form.setValue, standardResponsibilities, standardSkills]); // Dependencies updated

  // --- Fetch Standard Libraries --- 
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setErrorData(null);
    try {
      const respRef = query(collection(db, "standardResponsibilities"), orderBy("name"));
      const skillRef = query(collection(db, "standardSkills"), orderBy("name"));
      const deptRef = query(collection(db, "departments"), orderBy("name"));

      const [respSnap, skillSnap, deptSnap] = await Promise.all([
        getDocs(respRef),
        getDocs(skillRef),
        getDocs(deptRef)
      ]);

      const respData = respSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StandardResponsibility[];
      const skillData = skillSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as StandardSkill[];
      const deptData = deptSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Department[];

      setStandardResponsibilities(respData);
      setStandardSkills(skillData);
      setDepartments(deptData);
    } catch (error) {
      console.error("Error fetching standard libraries:", error);
      setErrorData("Failed to load standard responsibilities or skills.");
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen, fetchData]);

  const handleFormSubmit = async (data: RoleFormValues) => {
    if (!currentUser) return;
    console.log('RoleDialog form errors:', form.formState.errors); // Log validation errors
    console.log('RoleDialog submitting data:', data); // Log data before sending
    await onSubmit(data);
    onClose();
  };

  const handleCancel = () => {
    onClose();
    // Resetting is handled by useEffect now
  };

  // Placeholder handlers - will be replaced by selector logic
  const handleToggleResponsibility = (item: StandardResponsibility) => {
    console.log('Toggling responsibility:', JSON.stringify(item)); // Log the item being toggled
    const current = form.getValues('responsibilities') || [];
    const isSelected = current.some(r => r.id === item.id);
    let updatedResponsibilities; // Variable to hold the new array
    if (isSelected) {
      updatedResponsibilities = current.filter((r) => r.id !== item.id);
      console.log('Removing responsibility, intended new array:', JSON.stringify(updatedResponsibilities));
    } else {
      updatedResponsibilities = [...current, item];
      console.log('Adding responsibility, intended new array:', JSON.stringify(updatedResponsibilities));
    }
    form.setValue('responsibilities', updatedResponsibilities, { shouldValidate: true });
    // Log the value immediately after setting it
    console.log('Responsibilities in form state AFTER setValue:', JSON.stringify(form.getValues('responsibilities')));
  };
  const handleRemoveResponsibility = (id: string) => {
    const current = form.getValues('responsibilities') || [];
    form.setValue('responsibilities', current.filter((r) => r.id !== id), { shouldValidate: true });
  };
  const handleToggleSkill = (item: StandardSkill) => {
    const current = form.getValues('skills') || [];
    const isSelected = current.some(s => s.id === item.id);
    if (isSelected) {
      form.setValue('skills', current.filter((s) => s.id !== item.id), { shouldValidate: true });
    } else {
      form.setValue('skills', [...current, item], { shouldValidate: true });
    }
  };
  const handleRemoveSkill = (id: string) => {
    const current = form.getValues('skills') || [];
    form.setValue('skills', current.filter((s) => s.id !== id), { shouldValidate: true });
  };

  const selectedResponsibilities = form.watch('responsibilities') || [];
  const selectedSkills = form.watch('skills') || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Role' : 'Add New Role'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this role.' : 'Enter the details for the new role.'}
          </DialogDescription>
        </DialogHeader>
        {isLoadingData ? (
          <div className="flex items-center justify-center p-10">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading data...
          </div>
        ) : errorData ? (
          <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md">
            {errorData}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer II" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., I, II, Senior" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.length === 0 ? (
                          null
                        ) : (
                          departments
                            .filter(dept => dept.name && dept.name.trim() !== "")
                            .map((dept) => (
                              <SelectItem key={dept.id} value={dept.name}>
                                {dept.name}
                              </SelectItem>
                            ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormItem className="flex flex-col">
                <FormLabel>Responsibilities</FormLabel>
                <Popover open={respPopoverOpen} onOpenChange={setRespPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={respPopoverOpen}
                        className={cn(
                          "w-full justify-between",
                          !selectedResponsibilities.length && "text-muted-foreground"
                        )}
                        disabled={!currentUser}
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
                            {standardResponsibilities
                              .filter(resp => resp.name && resp.name.trim() !== "") // Revert filter to resp.name
                              .map((resp) => (
                              <CommandItem
                                key={resp.id}
                                value={resp.name} // Revert value to resp.name
                                onSelect={() => handleToggleResponsibility(resp)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedResponsibilities.some(r => r.id === resp.id) ? "opacity-100" : "opacity-0"
                                  )}
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
                <div className="space-x-1 space-y-1 pt-1">
                   {selectedResponsibilities.map((resp) => (
                       <Badge variant="secondary" key={resp.id}>
                          {resp.name}
                          <button 
                              type="button"
                              className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                              onClick={() => handleRemoveResponsibility(resp.id)}
                              disabled={!currentUser}
                           >
                               <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                          </button>
                       </Badge>
                   ))}
                </div>
                <FormMessage />
              </FormItem>

              <FormItem className="flex flex-col">
                <FormLabel>Skills</FormLabel>
                <Popover open={skillPopoverOpen} onOpenChange={setSkillPopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={skillPopoverOpen}
                        className={cn(
                          "w-full justify-between",
                          !selectedSkills.length && "text-muted-foreground"
                        )}
                        disabled={!currentUser}
                      >
                         <span className="truncate">
                          {selectedSkills.length > 0 
                            ? `${selectedSkills.length} selected` 
                            : "Select skills..."}
                         </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
                    <Command>
                      <CommandInput placeholder="Search skills..." />
                      <CommandList>
                        {isLoadingData && <CommandEmpty>Loading...</CommandEmpty>}
                        {errorData && <CommandEmpty className="text-destructive">{errorData}</CommandEmpty>}
                        {!isLoadingData && !errorData && standardSkills.length === 0 && <CommandEmpty>No standard skills found.</CommandEmpty>}
                        {!isLoadingData && !errorData && standardSkills.length > 0 && (
                          <CommandGroup>
                            {standardSkills
                              .filter(skill => skill.name && skill.name.trim() !== "") // Filter out empty names
                              .map((skill) => (
                              <CommandItem
                                key={skill.id}
                                value={skill.name}
                                onSelect={() => handleToggleSkill(skill)}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedSkills.some(s => s.id === skill.id) ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                {skill.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                  {/* Display Selected as Badges */}
                 <div className="space-x-1 space-y-1 pt-1">
                    {selectedSkills.map((skill) => (
                        <Badge variant="secondary" key={skill.id}>
                           {skill.name}
                           <button 
                               type="button"
                               className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                               onClick={() => handleRemoveSkill(skill.id)}
                               disabled={!currentUser}
                            >
                               <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                            </button>
                        </Badge>
                    ))}
                 </div>
                 <FormMessage />
               </FormItem>

              {/* --- Headcount Calculator Fields --- */}
              <div className="border-t pt-4 mt-4 space-y-4">
                 <h3 className="text-md font-medium text-muted-foreground">Headcount Calculation Config</h3>
                <FormField
                  control={form.control}
                  name="handlesComplaints"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Handles Complaints?</FormLabel>
                        <FormDescription>
                          Does this role primarily handle incoming customer complaints?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="complaintsPerFTE"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaints Handled / FTE / Month</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="e.g., 150" 
                            {...field}
                            value={field.value ?? ''} // Handle null
                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                            disabled={!form.watch('handlesComplaints')} // Disable if not handling complaints
                          />
                        </FormControl>
                        <FormDescription>If Handles Complaints is ON.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="hoursPerWorkOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Avg. Hours per Work Order</FormLabel>
                        <FormControl>
                           <Input 
                            type="number"
                            step="0.1" // Allow decimals
                            placeholder="e.g., 0.5" 
                            {...field}
                            value={field.value ?? ''} // Handle null
                            onChange={e => field.onChange(e.target.value === '' ? null : Number(e.target.value))}
                            disabled={form.watch('handlesComplaints')} // Disable if handling complaints
                          />
                        </FormControl>
                         <FormDescription>If Handles Complaints is OFF.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
                </DialogClose>
                <Button type="submit" disabled={!currentUser}> 
                  {form.formState.isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Role')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RoleDialog; 