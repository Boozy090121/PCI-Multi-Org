import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle
} from "@/components/ui/dialog";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext'; // Import useAuth

// Zod schema for validation
const departmentFormSchema = z.object({
  id: z.string().optional(), // Include id for editing, but it's not edited directly
  name: z.string().min(2, { message: "Department name must be at least 2 characters." }),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, { message: "Must be a valid hex color code (e.g., #RRGGBB)." })
});

type DepartmentFormValues = z.infer<typeof departmentFormSchema>;

// Interface matching the one in DepartmentManagement (or define a shared one)
interface Department {
  id: string;
  name: string;
  color: string;
  roleCount?: number; // Add other fields if they exist in the main component
}

interface DepartmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: DepartmentFormValues) => void;
  initialData?: Department | null; // Pass department data for editing
}

const DepartmentDialog: React.FC<DepartmentDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}) => {
  const { currentUser } = useAuth(); // Get auth state for disabling submit

  const form = useForm<DepartmentFormValues>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData 
      ? { id: initialData.id, name: initialData.name, color: initialData.color } 
      : { name: '', color: '#CCCCCC' }, // Default values for new department
  });

  // Reset form when initialData changes (e.g., when opening for edit)
  useEffect(() => {
    if (initialData) {
      form.reset({ id: initialData.id, name: initialData.name, color: initialData.color });
    } else {
      form.reset({ name: '', color: '#CCCCCC' });
    }
  }, [initialData, form]);

  const handleFormSubmit = (data: DepartmentFormValues) => {
     if (!currentUser) return; // Double check auth state before submitting
    onSubmit(data);
    onClose(); // Close dialog after submit
  };

  // Close dialog without submitting
  const handleCancel = () => {
    onClose();
    form.reset(initialData 
        ? { id: initialData.id, name: initialData.name, color: initialData.color } 
        : { name: '', color: '#CCCCCC' }); // Reset form on cancel
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}> {/* Use onOpenChange for closing via overlay/esc */}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Department' : 'Add New Department'}</DialogTitle>
          <DialogDescription>
            {initialData ? 'Update the details for this department.' : 'Enter the details for the new department.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 py-4">
            {/* Name Field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Engineering" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Color Field */}
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Code</FormLabel>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Input type="color" {...field} className="p-1 h-10 w-14 block" />
                    </FormControl>
                    <FormControl>
                       <Input placeholder="#RRGGBB" {...field} />
                    </FormControl>
                   </div>
                   <FormMessage />
                 </FormItem>
               )}
             />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button type="submit" disabled={!currentUser}> {/* Disable if not logged in */}
                {initialData ? 'Save Changes' : 'Add Department'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default DepartmentDialog; 