
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { villaData } from '@/app/lib/villa-data';
import type { Complaint, AuthProps } from '@/app/lib/types';
import { PlusCircle, FileText } from 'lucide-react';
import ComplaintFormDialog from '@/components/modals/complaint-form-dialog';
import ComplaintCard from '@/components/complaint-card';
import { useSheetData, api } from '@/app/lib/api';
import { useToast } from '@/hooks/use-toast';

const ComplaintsTab = ({ isAdminLoggedIn, isManagementLoggedIn }: AuthProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: complaints, isLoading, error, refetch } = useSheetData<Complaint[]>('getComplaints');

  const handlePostComplaintClick = () => {
    setIsFormOpen(true);
  };

  const handleSaveComplaint = async (complaintData: Partial<Complaint>) => {
    try {
      const result = await api.postComplaint(complaintData);
      if (result.success) {
        toast({ title: `Complaint submitted!` });
        refetch();
        setIsFormOpen(false);
      } else {
        throw new Error(result.error || 'Failed to save complaint.');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleStatusChange = async (id: string, field: 'noted' | 'resolved', value: boolean) => {
    try {
        const result = await api.updateComplaintStatus({ id, [field]: value });
        if(result.success) {
            toast({ title: `Complaint status updated.` });
            refetch();
        } else {
            throw new Error(result.error || 'Failed to update status.');
        }
    } catch (err: any) {
         toast({ title: 'Error updating status', description: err.message, variant: 'destructive' });
    }
  };

  const sortedComplaints = complaints 
    ? [...complaints].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Complaints</CardTitle>
          <Button size="sm" onClick={handlePostComplaintClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Complaint
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading && <p>Loading complaints...</p>}
          {error && <p className="text-destructive text-center">Error loading complaints: {error.message}</p>}
          {!isLoading && !error && sortedComplaints.length > 0 ? (
            sortedComplaints.map(complaint => (
              <ComplaintCard
                key={complaint.id}
                complaint={complaint}
                onStatusChange={handleStatusChange}
                canManage={isAdminLoggedIn || isManagementLoggedIn}
              />
            ))
          ) : (
            !isLoading && !error && (
            <div className="text-center text-muted-foreground py-10">
              <FileText className="mx-auto h-12 w-12" />
              <p className="mt-4">No complaints submitted yet.</p>
            </div>
            )
          )}
        </CardContent>
      </Card>
      
      <ComplaintFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveComplaint}
        villaData={villaData}
      />
    </div>
  );
};

export default ComplaintsTab;
