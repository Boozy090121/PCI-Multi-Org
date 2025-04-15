import React, { useEffect } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle, DialogClose 
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Schema for standard skill validation
const skillSchema = z.object({
  id: z.string().optional(), // Optional: Only present when editing
  name: z.string().min(2, { message: "Skill name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional(),
  // Consider adding category later if needed: 
  // category: z.string().optional(), 
});

// Type for form values inferred from schema
export type StandardSkillFormValues = z.infer<typeof skillSchema>;

interface StandardSkillDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StandardSkillFormValues) => Promise<void> | void; 
  initialData?: StandardSkillFormValues | null; 
}

const StandardSkillDialog: React.FC<StandardSkillDialogProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
  const form = useForm<StandardSkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: initialData || { name: "", description: "" }, 
  });

  // Reset form when initialData changes or dialog closes
  useEffect(() => {
    if (isOpen) {
      form.reset(initialData || { name: "", description: "" });
    } 
  }, [initialData, isOpen, form]);

  const handleFormSubmit = async (data: StandardSkillFormValues) => {
    try {
        await onSubmit(data);
        onClose(); // Close dialog on successful submit
    } catch (error) {
        console.error("Error submitting skill form:", error);
        // Optionally show an error message
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Standard Skill' : 'Add Standard Skill'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details below.' : 'Enter the details for the new standard skill.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Skill Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., React Development" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe the skill... (Optional, max 500 chars)"
                      className="resize-none" 
                      {...field}
                      value={field.value ?? ''} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
               <DialogClose asChild>
                  <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
               </DialogClose>
               <Button type="submit" disabled={form.formState.isSubmitting}>
                 {form.formState.isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Skill')}
               </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StandardSkillDialog; 