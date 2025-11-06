
"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { EmergencyContact } from '@/app/lib/types';
import { useEffect } from 'react';

const contactSchema = z.object({
  type: z.string().min(3, "Category is required.").max(50),
  name: z.string().min(3, "Name is required.").max(50),
  phone: z.string().min(10, "A valid phone number is required."),
  description: z.string().max(200).optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface EmergencyContactFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (contact: ContactFormData) => void;
}

const EmergencyContactFormDialog = ({ isOpen, onOpenChange, onSave }: EmergencyContactFormDialogProps) => {
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { type: '', name: '', phone: '', description: '' },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        type: '',
        name: '',
        phone: '',
        description: '',
      });
    }
  }, [isOpen, form]);


  const onSubmit = (data: ContactFormData) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">Add Emergency Contact</DialogTitle>
          <DialogDescription>Add a new service provider to the directory. This will be visible to all residents.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField control={form.control} name="type" render={({ field }) => (<FormItem><FormLabel>Category / Type</FormLabel><FormControl><Input placeholder="e.g., Plumber, Electrician" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>Contact Name</FormLabel><FormControl><Input placeholder="e.g., Ali Ahmed" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="0300-1234567" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description/Notes (Optional)</FormLabel><FormControl><Textarea placeholder="e.g., 24/7 service, reasonable rates" {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Add Contact</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EmergencyContactFormDialog;
