
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import type { AuthProps, EmergencyContact } from '@/app/lib/types';
import EmergencyContactCard from '@/components/emergency-contact-card';
import EmergencyContactFormDialog from '@/components/modals/emergency-contact-form-dialog';
import { useToast } from '@/hooks/use-toast';
import { useSheetData, api } from '@/app/lib/api';

const EmergencyTab = ({isAdminLoggedIn}: AuthProps) => {
    const { toast } = useToast();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { data: contacts, isLoading, error, refetch } = useSheetData<EmergencyContact[]>('getEmergencyContacts');

    const handleSaveContact = async (contactData: Omit<EmergencyContact, 'id' | 'likes' | 'dislikes' | 'timestamp'>) => {
        try {
            const result = await api.postEmergencyContact(contactData);
            if (result.success) {
                toast({ title: 'Contact added successfully!' });
                refetch();
            } else {
                throw new Error(result.error || 'Failed to add contact.');
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        } finally {
            setIsFormOpen(false);
        }
    }

    const handleRating = async (id: string, type: 'like' | 'dislike') => {
        try {
            const result = await api.rateEmergencyContact(id, type);
            if (result.success) {
                toast({ title: 'Thank you for your feedback!' });
                refetch();
            } else {
                throw new Error(result.error || 'Failed to submit rating.');
            }
        } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
        }
    }
  
  return (
     <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Emergency Contacts</CardTitle>
          {isAdminLoggedIn && (
             <Button size="sm" onClick={() => setIsFormOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Contact
            </Button>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading && <p>Loading contacts...</p>}
          {error && <p className="text-destructive text-center col-span-full">Error loading contacts: {error.message}</p>}
          {!isLoading && !error && contacts && contacts.map(contact => (
            <EmergencyContactCard key={contact.id} contact={contact} onRate={handleRating} />
          ))}
        </CardContent>
      </Card>
      
      <EmergencyContactFormDialog 
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveContact}
      />

    </div>
  );
};

export default EmergencyTab;
