
"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { martStatuses, type MartStatus, type AuthProps } from '@/app/lib/types';
import { api } from '@/app/lib/api';
import { MART_OWNER_PASSWORD } from '@/app/lib/passwords';

interface SaimaMartModalProps extends Omit<AuthProps, 'isManagementLoggedIn' | 'setIsManagementLoggedIn'> {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  martStatus: MartStatus;
  onStatusUpdate: (newStatus: MartStatus) => void;
}

const SaimaMartModal = ({ isOpen, onOpenChange, martStatus, onStatusUpdate, isAdminLoggedIn, isMartOwnerLoggedIn, setIsMartOwnerLoggedIn }: SaimaMartModalProps) => {
  const [password, setPassword] = useState('');
  const { toast } = useToast();
  
  const canManage = isMartOwnerLoggedIn || isAdminLoggedIn;

  const getStatusColor = (status: MartStatus) => {
    switch (status) {
      case 'Mart is Open':
        return 'bg-green-500';
      case 'Mart is Closed':
        return 'bg-red-500';
      case 'Namaz-Break':
      case 'Lunch/Dinner Break':
        return 'bg-yellow-500';
      default:
        return 'bg-red-500';
    }
  };

  const handleLogin = () => {
    if (password === MART_OWNER_PASSWORD) {
      setIsMartOwnerLoggedIn(true);
      toast({ title: 'Mart owner login successful.' });
      setPassword('');
    } else {
      toast({ title: 'Invalid password.', variant: 'destructive' });
      setPassword('');
    }
  };
  
  const handleLogout = () => {
    setIsMartOwnerLoggedIn(false);
  }

  const handleStatusUpdate = async (newStatus: MartStatus) => {
    try {
        const result = await api.updateMartStatus({ status: newStatus, password: MART_OWNER_PASSWORD });
        if (result.success) {
            onStatusUpdate(newStatus);
            toast({title: 'Mart status updated!'});
        } else {
            throw new Error(result.error || 'Failed to update status.');
        }
    } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive'});
    }
  }

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      if (!isAdminLoggedIn) {
        setIsMartOwnerLoggedIn(false);
      }
      setPassword('');
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="text-4xl">🛒</div>
          <DialogTitle className="font-headline text-2xl">Saima Mart</DialogTitle>
          <DialogDescription>
            Check the current status of the community mart.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center space-x-4 rounded-md border p-6 my-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium leading-none">
              Mart Status
            </p>
            <p className="text-sm text-muted-foreground">
              {martStatus}
            </p>
          </div>
          <div className={`w-4 h-4 rounded-full shadow-inner ${getStatusColor(martStatus)}`} />
        </div>
        
        {canManage ? (
          <div className="space-y-4">
             <div className="p-4 bg-muted/50 rounded-lg">
                <Label className="mb-4 block text-center">Update Mart Status</Label>
                <RadioGroup
                    value={martStatus}
                    onValueChange={(value: MartStatus) => handleStatusUpdate(value)}
                    className="grid grid-cols-2 gap-4"
                >
                    {martStatuses.map((status) => (
                         <div key={status} className="flex items-center space-x-2">
                            <RadioGroupItem value={status} id={`status-${status}`} />
                            <Label htmlFor={`status-${status}`}>{status}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>
            {isMartOwnerLoggedIn && !isAdminLoggedIn && <Button variant="outline" className="w-full" onClick={handleLogout}>Owner Logout</Button>}
          </div>
        ) : (
          <div className="space-y-4">
            <Label htmlFor="owner-password">Mart Owner Login</Label>
            <div className="flex gap-2">
                <Input 
                    id="owner-password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
                <Button onClick={handleLogin}>Login</Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => handleOpenChange(false)} className="w-full">Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaimaMartModal;
