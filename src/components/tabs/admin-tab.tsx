"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { AuthProps } from '@/app/lib/types';
import { Separator } from '@/components/ui/separator';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ADMIN_PASSWORD, MANAGEMENT_PASSWORD } from '@/app/lib/passwords';

const AdminTab = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  isManagementLoggedIn,
  setIsManagementLoggedIn
}: Omit<AuthProps, 'isMartOwnerLoggedIn' | 'setIsMartOwnerLoggedIn'>) => {
  const [password, setPassword] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newMgmtPassword, setNewMgmtPassword] = useState('');
  const { toast } = useToast();
  const firestore = useFirestore();

  const approvedPhonesQuery = useMemoFirebase(() => firestore ? collection(firestore, 'approvedPhones') : null, [firestore]);
  const { data: approvedPhones, isLoading: phonesLoading } = useCollection(approvedPhonesQuery);

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      toast({ title: "Admin login successful." });
    } else {
      toast({ title: "Invalid admin password.", variant: "destructive" });
    }
    setPassword('');
  };
  
  const approvePhoneNumber = () => {
    if (!firestore) return;
    if (newPhone && !approvedPhones?.some(p => p.id === newPhone)) {
        const phoneRef = doc(firestore, 'approvedPhones', newPhone);
        setDocumentNonBlocking(phoneRef, { phone: newPhone }, {});
        toast({ title: `Phone number ${newPhone} approved.` });
        setNewPhone('');
    } else if (approvedPhones?.some(p => p.id === newPhone)) {
        toast({ title: 'This phone number is already approved!', variant: 'destructive' });
    } else {
        toast({ title: 'Please enter a phone number.', variant: 'destructive' });
    }
  };

  const removeApprovedPhone = (phoneToRemove: string) => {
    if (!firestore) return;
    const phoneRef = doc(firestore, 'approvedPhones', phoneToRemove);
    deleteDocumentNonBlocking(phoneRef);
    toast({ title: `Phone number ${phoneToRemove} removed.` });
  };
  
  const handleSetManagementPassword = () => {
     if (!firestore) return;
     if (newMgmtPassword) {
        console.warn("Management password should be set in src/app/lib/passwords.ts. This form is for demonstration and does not persist changes securely.");
        toast({ title: "Set password in `passwords.ts`", description: "For this change to be permanent, please update the MANAGEMENT_PASSWORD in the code.", variant: 'default' });
        setNewMgmtPassword('');
    } else {
        toast({ title: "Please enter a new password.", variant: "destructive" });
    }
  };


  if (!isAdminLoggedIn) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="font-headline">Admin Access</CardTitle>
          <CardDescription>Please enter the admin password to continue.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
          />
          <Button onClick={handleAdminLogin} className="w-full">Admin Login</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Admin Control Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Welcome, Admin. Here you can manage community settings.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-lg">Phone Number Approval</CardTitle>
          <CardDescription>Approve phone numbers for posting content.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter phone number to approve"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <Button onClick={approvePhoneNumber}>Approve</Button>
          </div>
          <Separator />
          <h4 className="font-medium">Approved Phone Numbers ({approvedPhones?.length || 0})</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {phonesLoading ? <p>Loading...</p> : approvedPhones && approvedPhones.length > 0 ? (
                approvedPhones.map((phone) => (
                    <div key={phone.id} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <span className="font-mono text-sm">{phone.id}</span>
                        <Button variant="destructive" size="sm" onClick={() => removeApprovedPhone(phone.id)}>Remove</Button>
                    </div>
                ))
            ) : (
                <p className="text-muted-foreground text-sm">No phone numbers approved yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="font-headline text-lg">Management Access</CardTitle>
            <CardDescription>Set the password for the management panel. Current: {MANAGEMENT_PASSWORD}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
             <div className="flex gap-2">
                <Input
                    type="password"
                    placeholder="New Management Password"
                    value={newMgmtPassword}
                    onChange={(e) => setNewMgmtPassword(e.target.value)}
                />
                <Button onClick={handleSetManagementPassword}>Set Password</Button>
            </div>
             <p className="text-xs text-muted-foreground pt-2">Note: To permanently change the management password, you must edit the `src/app/lib/passwords.ts` file.</p>
        </CardContent>
      </Card>
      
       <Button variant="outline" className="w-full" onClick={() => { setIsAdminLoggedIn(false); if (isManagementLoggedIn) setIsManagementLoggedIn(false); }}>Logout</Button>
    </div>
  );
};

export default AdminTab;
