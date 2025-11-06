
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { AuthProps } from '@/app/lib/types';
import { ADMIN_PASSWORD } from '@/app/lib/passwords';
import { api, useSheetData } from '@/app/lib/api';

const AdminTab = ({
  isAdminLoggedIn,
  setIsAdminLoggedIn,
  isManagementLoggedIn,
  setIsManagementLoggedIn
}: Omit<AuthProps, 'isMartOwnerLoggedIn' | 'setIsMartOwnerLoggedIn'>) => {
  const [password, setPassword] = useState('');
  const [newMgmtPassword, setNewMgmtPassword] = useState('');
  const { toast } = useToast();
  
  const { data: mgmtPasswordObj, refetch: refetchMgmtPassword } = useSheetData<{ password?: string }>('getManagementPassword');

  const handleAdminLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      toast({ title: "Admin login successful." });
    } else {
      toast({ title: "Invalid admin password.", variant: "destructive" });
    }
    setPassword('');
  };
  
  const handleSetManagementPassword = async () => {
     if (newMgmtPassword) {
        try {
            const result = await api.setManagementPassword(newMgmtPassword);
            if (result.success) {
                toast({ title: "Management password updated successfully." });
                setNewMgmtPassword('');
                refetchMgmtPassword();
            } else {
                throw new Error(result.error || "Failed to set password.");
            }
        } catch (err: any) {
            toast({ title: "Error", description: err.message, variant: 'destructive' });
        }
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
            <CardTitle className="font-headline text-lg">Management Access</CardTitle>
            <CardDescription>Set the password for the management panel. Current: {mgmtPasswordObj?.password || 'Not Set'}</CardDescription>
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
        </CardContent>
      </Card>
      
       <Button variant="outline" className="w-full" onClick={() => { setIsAdminLoggedIn(false); if (isManagementLoggedIn) setIsManagementLoggedIn(false); }}>Logout</Button>
    </div>
  );
};

export default AdminTab;
