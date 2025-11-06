
"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { adCategories, type Ad } from '@/app/lib/types';
import { AD_EXPIRY_HOURS } from '@/app/lib/data';

const adSchema = z.object({
  category: z.enum(adCategories, { required_error: "Please select a category." }),
  title: z.string().min(5, "Title must be at least 5 characters.").max(50),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500),
  phone: z.string().min(10, "A valid phone number is required."),
  pin: z.string().length(4, "A 4-digit PIN is required.").regex(/^\d{4}$/, "PIN must be 4 digits."),
});

interface AdFormDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (ad: z.infer<typeof adSchema>) => void;
  adToEdit?: Ad | null;
}

const AdFormDialog = ({ isOpen, onOpenChange, onSave, adToEdit }: AdFormDialogProps) => {
  const form = useForm<z.infer<typeof adSchema>>({
    resolver: zodResolver(adSchema),
    defaultValues: {
      title: '',
      description: '',
      phone: '',
      pin: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (adToEdit) {
        form.reset({
          category: adToEdit.category,
          title: adToEdit.title,
          description: adToEdit.description,
          phone: adToEdit.phone,
          pin: adToEdit.pin, // Pre-fill pin from edit action
        });
      } else {
        form.reset({
            title: '', description: '', phone: '', pin: '', category: undefined
        });
      }
    }
  }, [isOpen, adToEdit, form]);

  const onSubmit = (data: z.infer<typeof adSchema>) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-headline">{adToEdit ? 'Edit' : 'Post'} Advertisement</DialogTitle>
          <DialogDescription>Fill in the details for your ad. It will be visible for {AD_EXPIRY_HOURS} hours. Create a 4-digit PIN to manage this ad later.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto p-1 pr-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {adCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Brand New Sofa" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe your item or service..." {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabel>Contact Phone</FormLabel><FormControl><Input type="tel" placeholder="Your phone number" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="pin" render={({ field }) => (<FormItem><FormLabel>4-Digit PIN</FormLabel><FormControl><Input type="password" maxLength={4} placeholder="Create a PIN to edit/delete later" {...field} /></FormControl><FormMessage /></FormItem>)} />

            
            <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button type="submit">Submit Advertisement</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AdFormDialog;
