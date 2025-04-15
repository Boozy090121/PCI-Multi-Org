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
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Schema for standard responsibility validation
const responsibilitySchema = z.object({
  id: z.string().optional(), // Optional: Only present when editing
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(100),
  description: z.string().max(500).optional(),
});

// Type for form values inferred from schema
export type StandardResponsibilityFormValues = z.infer<typeof responsibilitySchema>;

interface StandardResponsibilityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: StandardResponsibilityFormValues) => Promise<void> | void; // Can be async
  initialData?: StandardResponsibilityFormValues | null; 
}

const StandardResponsibilityDialog: React.FC<StandardResponsibilityDialogProps> = ({ 
    isOpen, 
    onClose, 
    onSubmit, 
    initialData 
}) => {
  const form = useForm<StandardResponsibilityFormValues>({
    resolver: zodResolver(responsibilitySchema),
    defaultValues: initialData || { name: "", description: "" }, 
  });

  // Reset form when initialData changes (e.g., opening edit dialog)
  // or when dialog closes
  useEffect(() => {
    if (isOpen) {
      form.reset(initialData || { name: "", description: "" });
    } else {
       // Optional: Reset form on close to ensure clean state next time
       // form.reset({ name: "", description: "" }); 
    }
  }, [initialData, isOpen, form]);

  const handleFormSubmit = async (data: StandardResponsibilityFormValues) => {
    try {
        await onSubmit(data);
        onClose(); // Close dialog on successful submit
    } catch (error) {
        console.error("Error submitting responsibility form:", error);
        // Optionally show an error message to the user here
    }
  };

  // Handle dialog open/close state changes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Standard Responsibility' : 'Add Standard Responsibility'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details below.' : 'Enter the details for the new standard responsibility.'}
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
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Manage Team Budget" {...field} />
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
                      placeholder="Describe the responsibility... (Optional, max 500 chars)"
                      className="resize-none" // Optional: Prevent resizing
                      {...field}
                      value={field.value ?? ''} // Ensure value is never null/undefined for Textarea
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
                 {form.formState.isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Responsibility')}
               </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default StandardResponsibilityDialog; 