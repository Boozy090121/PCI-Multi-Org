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
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, Loader2, X as XIcon } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { type StandardSkill } from '../standard-items/StandardSkillManagement';
import { type StandardResponsibility } from '../standard-items/StandardResponsibilityManagement';
import { useAuth } from '@/context/AuthContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type Process } from '../processes/ProcessDialog';

// Schemas for selected items
const standardSkillSchemaForForm = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(), 
});
const standardResponsibilitySchemaForForm = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable().optional(),
});

// Main form schema
const analysisSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional(),
  analysisType: z.enum(['skill', 'responsibility', 'process'], { required_error: "Please select an analysis type." }),
  targetSkills: z.array(standardSkillSchemaForForm).optional().default([]),
  targetResponsibilities: z.array(standardResponsibilitySchemaForForm).optional().default([]),
  processId: z.string().optional(),
}).refine(data => {
    if (data.analysisType === 'skill' && data.targetSkills.length === 0) {
        return false;
    }
    if (data.analysisType === 'responsibility' && data.targetResponsibilities.length === 0) {
        return false;
    }
    if (data.analysisType === 'process' && !data.processId) {
        return false;
    }
    return true;
}, {
    message: "Please select at least one target item or process for the chosen analysis type.",
    path: ["targetSkills", "targetResponsibilities", "processId"], 
});

// Type for form values inferred from schema
export type AnalysisFormValues = z.infer<typeof analysisSchema>;

// Interface for data passed initially
interface InitialAnalysisData extends Omit<AnalysisFormValues, 'targetSkills' | 'targetResponsibilities'> {
    targetSkillIds?: string[];
    targetResponsibilityIds?: string[];
    targetSkills?: StandardSkill[]; 
    targetResponsibilities?: StandardResponsibility[];
    gapCount?: number;
    severity?: 'Low' | 'Medium' | 'High';
    progress?: number; 
}

interface GapAnalysisDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AnalysisFormValues) => Promise<void> | void; 
  initialData?: InitialAnalysisData | null; 
}

const GapAnalysisDialog: React.FC<GapAnalysisDialogProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
  const { currentUser } = useAuth();

  // State for fetched items
  const [standardSkills, setStandardSkills] = useState<StandardSkill[]>([]);
  const [standardResponsibilities, setStandardResponsibilities] = useState<StandardResponsibility[]>([]);
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [errorData, setErrorData] = useState<string | null>(null);
  const [skillPopoverOpen, setSkillPopoverOpen] = useState(false);
  const [respPopoverOpen, setRespPopoverOpen] = useState(false);

  const form = useForm<AnalysisFormValues>({
    resolver: zodResolver(analysisSchema),
    defaultValues: { 
        name: "", 
        description: "", 
        analysisType: 'skill',
        targetSkills: [], 
        targetResponsibilities: [],
        processId: undefined,
    }, 
  });

  // --- Fetch Standard Skills, Responsibilities & Processes --- 
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setErrorData(null);
    try {
        const skillsPromise = getDocs(query(collection(db, "standardSkills"), orderBy("name")));
        const responsibilitiesPromise = getDocs(query(collection(db, "standardResponsibilities"), orderBy("name")));
        const processesPromise = getDocs(query(collection(db, "processes"), orderBy("name")));

        const [skillsSnap, responsibilitiesSnap, processesSnap] = await Promise.all([skillsPromise, responsibilitiesPromise, processesPromise]);
        
        const fetchedSkills = skillsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardSkill[];
        const fetchedResponsibilities = responsibilitiesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as StandardResponsibility[];
        const fetchedProcesses = processesSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Process[];
        
        setStandardSkills(fetchedSkills);
        setStandardResponsibilities(fetchedResponsibilities);
        setProcesses(fetchedProcesses);
    } catch (err) {
        console.error("Error fetching standard items/processes for gap analysis dialog:", err);
        setErrorData("Failed to load selection lists.");
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
       let initialSkillsForForm: StandardSkill[] = [];
       let initialResponsibilitiesForForm: StandardResponsibility[] = [];
       let initialProcessId: string | undefined = undefined;
       
       if (initialData) {
           const type = initialData.analysisType || 'skill';
           
           if (type === 'skill' && standardSkills.length > 0) {
               if (initialData.targetSkillIds) {
                   initialSkillsForForm = standardSkills.filter(ss => 
                       initialData.targetSkillIds?.includes(ss.id)
                   );
               } else if (initialData.targetSkills) {
                  initialSkillsForForm = initialData.targetSkills;
               }
           } else if (type === 'responsibility' && standardResponsibilities.length > 0) {
               if (initialData.targetResponsibilityIds) {
                   initialResponsibilitiesForForm = standardResponsibilities.filter(sr => 
                       initialData.targetResponsibilityIds?.includes(sr.id)
                   );
               } else if (initialData.targetResponsibilities) {
                  initialResponsibilitiesForForm = initialData.targetResponsibilities;
               }
           } else if (type === 'process') {
                initialProcessId = initialData.processId;
           }

           form.reset({
                id: initialData.id,
                name: initialData.name || "",
                description: initialData.description || "",
                analysisType: type,
                targetSkills: initialSkillsForForm,
                targetResponsibilities: initialResponsibilitiesForForm,
                processId: initialProcessId,
           });
       } else {
            form.reset({
                name: "",
                description: "",
                analysisType: 'skill',
                targetSkills: [],
                targetResponsibilities: [],
                processId: undefined,
            });
       }
    } 
  }, [initialData, isOpen, form, standardSkills, standardResponsibilities, processes]);

  const handleFormSubmit = async (data: AnalysisFormValues) => {
    try {
        await onSubmit(data);
        onClose();
    } catch (error) {
        console.error("Error submitting analysis form:", error);
    }
  };

  // --- Multi-select Handlers --- 
  const handleToggleSkill = (skill: StandardSkill) => {
    const current = form.getValues('targetSkills') || [];
    const isSelected = current.some(s => s.id === skill.id);
    if (isSelected) {
        form.setValue('targetSkills', current.filter((s) => s.id !== skill.id), { shouldValidate: true });
    } else {
        form.setValue('targetSkills', [...current, skill], { shouldValidate: true });
    }
  };
  const handleRemoveSkill = (id: string) => {
      const current = form.getValues('targetSkills') || [];
      form.setValue('targetSkills', current.filter((s) => s.id !== id), { shouldValidate: true });
  };
  const handleToggleResponsibility = (resp: StandardResponsibility) => {
    const current = form.getValues('targetResponsibilities') || [];
    const isSelected = current.some(r => r.id === resp.id);
    if (isSelected) {
        form.setValue('targetResponsibilities', current.filter((r) => r.id !== resp.id), { shouldValidate: true });
    } else {
        form.setValue('targetResponsibilities', [...current, resp], { shouldValidate: true });
    }
  };
  const handleRemoveResponsibility = (id: string) => {
      const current = form.getValues('targetResponsibilities') || [];
      form.setValue('targetResponsibilities', current.filter((r) => r.id !== id), { shouldValidate: true });
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const selectedSkills = form.watch('targetSkills') || [];
  const selectedResponsibilities = form.watch('targetResponsibilities') || [];
  const analysisType = form.watch('analysisType');

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Gap Analysis Settings' : 'Create New Gap Analysis'}</DialogTitle>
          <DialogDescription>
            Configure the analysis details and select the target skills.
          </DialogDescription>
        </DialogHeader>

        {isLoadingData && !initialData ? ( 
             <div className="flex items-center justify-center p-10"> <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading selection options... </div>
         ) : errorData ? (
             <div className="text-destructive p-4 border border-destructive bg-destructive/10 rounded-md"> {errorData} </div>
         ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
                 {/* Name Field */}
                 <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Analysis Name *</FormLabel> <FormControl><Input placeholder="e.g., Q3 Engineering Skills Gap" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
                 {/* Description Field */}
                 <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl><Textarea placeholder="Describe the purpose of this analysis..." {...field} value={field.value ?? ''} /></FormControl> <FormMessage /> </FormItem> )} />
                 
                 {/* Analysis Type Selector */}
                 <FormField
                   control={form.control}
                   name="analysisType"
                   render={({ field }) => (
                     <FormItem className="space-y-3">
                       <FormLabel>Analysis Type *</FormLabel>
                       <FormControl>
                         <RadioGroup
                           onValueChange={(value) => {
                                field.onChange(value); 
                                if (value === 'skill') { form.setValue('targetResponsibilities', []); form.setValue('processId', undefined); }
                                if (value === 'responsibility') { form.setValue('targetSkills', []); form.setValue('processId', undefined); }
                                if (value === 'process') { form.setValue('targetSkills', []); form.setValue('targetResponsibilities', []); }
                           }}
                           defaultValue={field.value}
                           className="flex space-x-4"
                         >
                           <FormItem className="flex items-center space-x-2 space-y-0">
                             <FormControl><RadioGroupItem value="skill" /></FormControl>
                             <FormLabel className="font-normal">Skill Gap</FormLabel>
                           </FormItem>
                           <FormItem className="flex items-center space-x-2 space-y-0">
                             <FormControl><RadioGroupItem value="responsibility" /></FormControl>
                             <FormLabel className="font-normal">Responsibility Gap</FormLabel>
                           </FormItem>
                           <FormItem className="flex items-center space-x-2 space-y-0">
                             <FormControl><RadioGroupItem value="process" /></FormControl>
                             <FormLabel className="font-normal">Process Gap</FormLabel>
                           </FormItem>
                         </RadioGroup>
                       </FormControl>
                       <FormMessage />
                     </FormItem>
                   )}
                 />

                 {/* Conditionally Render Target Skills or Responsibilities */}
                 {analysisType === 'skill' && (
                   <FormField
                     control={form.control}
                     name="targetSkills"
                     render={({ field }) => (
                         <FormItem className="flex flex-col">
                             <FormLabel>Target Skills *</FormLabel>
                             <Popover open={skillPopoverOpen} onOpenChange={setSkillPopoverOpen}>
                                 <PopoverTrigger asChild>
                                     <Button
                                         variant="outline"
                                         role="combobox"
                                         aria-expanded={skillPopoverOpen}
                                         className={cn("w-full justify-between", !selectedSkills.length && "text-muted-foreground")}
                                         disabled={isLoadingData}
                                     >
                                         <span className="truncate"> 
                                             {selectedSkills.length > 0 
                                                 ? `${selectedSkills.length} selected` 
                                                 : "Select target skills..."}
                                         </span>
                                         <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                     </Button>
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
                                                     {standardSkills.map((skill) => (
                                                         <CommandItem
                                                             key={skill.id}
                                                             value={skill.name}
                                                             onSelect={() => handleToggleSkill(skill)}
                                                         >
                                                             <Check
                                                                 className={cn("mr-2 h-4 w-4", selectedSkills.some(s => s.id === skill.id) ? "opacity-100" : "opacity-0")}
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
                             <div className="space-x-1 space-y-1 pt-1 min-h-[24px]">
                                {selectedSkills.map((skill) => (
                                    <Badge variant="secondary" key={skill.id}>
                                       {skill.name}
                                       <button 
                                           type="button"
                                           className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                           onClick={() => handleRemoveSkill(skill.id)}
                                        >
                                            <XIcon className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                       </button>
                                    </Badge>
                                ))}
                             </div>
                         </FormItem>
                     )}
                  />
                 )}

                 {analysisType === 'responsibility' && (
                    <FormField
                      control={form.control}
                      name="targetResponsibilities"
                      render={({ field }) => (
                          <FormItem className="flex flex-col">
                              <FormLabel>Target Responsibilities *</FormLabel>
                              <Popover open={respPopoverOpen} onOpenChange={setRespPopoverOpen}>
                                  <PopoverTrigger asChild>
                                      <Button
                                          variant="outline"
                                          role="combobox"
                                          aria-expanded={respPopoverOpen}
                                          className={cn("w-full justify-between", !selectedResponsibilities.length && "text-muted-foreground")}
                                          disabled={isLoadingData}
                                      >
                                          <span className="truncate"> 
                                              {selectedResponsibilities.length > 0 
                                                  ? `${selectedResponsibilities.length} selected` 
                                                  : "Select target responsibilities..."}
                                          </span>
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                      </Button>
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
                                                              value={resp.name}
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
                          </FormItem>
                      )}
                  />
                 )}

                 {analysisType === 'process' && (
                     <FormField
                         control={form.control}
                         name="processId"
                         render={({ field }) => (
                             <FormItem>
                                 <FormLabel>Select Process *</FormLabel>
                                 <Select onValueChange={field.onChange} defaultValue={field.value} disabled={processes.length === 0}>
                                     <FormControl>
                                         <SelectTrigger>
                                             <SelectValue placeholder={processes.length === 0 ? "No processes defined" : "Select a process..."} />
                                         </SelectTrigger>
                                     </FormControl>
                                     <SelectContent>
                                         {processes.map((process) => (
                                             <SelectItem key={process.id} value={process.id}>
                                                 {process.name}
                                             </SelectItem>
                                         ))}
                                     </SelectContent>
                                 </Select>
                                 <FormMessage />
                             </FormItem>
                         )}
                     />
                 )}

                <DialogFooter className="pt-4">
                   <DialogClose>
                     <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                   </DialogClose>
                   <Button type="submit" disabled={!currentUser || form.formState.isSubmitting}>
                      <>
                        {form.formState.isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {initialData ? 'Save Changes' : 'Create Analysis'}
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

export default GapAnalysisDialog; 