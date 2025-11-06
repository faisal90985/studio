
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Phone, Clock, Pin } from 'lucide-react';
import type { Ad } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';

interface AdCardProps {
  ad: Ad;
  onEdit: (ad: Ad) => void;
  onDelete: (id: string, pin: string) => void;
  isAdmin: boolean;
}

const AdCard = ({ ad, onEdit, onDelete, isAdmin }: AdCardProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pin, setPin] = useState('');
  const [action, setAction] = useState<'edit' | 'delete' | null>(null);

  const now = Date.now();
  const hoursLeft = Math.max(0, Math.ceil((ad.expiry - now) / (1000 * 60 * 60)));

  const handleAction = (type: 'edit' | 'delete') => {
    setAction(type);
    setIsVerifying(true);
  }

  const verifyAndExecute = () => {
    if (!pin) {
        toast({ title: 'PIN required', description: 'Please enter the 4-digit PIN for this ad.', variant: 'destructive'});
        return;
    }
    if (action === 'edit') {
        // Pass pin to parent, which will pass to form dialog
        onEdit({ ...ad, pin });
    }
    if (action === 'delete') {
        onDelete(ad.id, pin);
    }
    closeDialog();
  }

  const closeDialog = () => {
    setIsVerifying(false);
    setPin('');
    setAction(null);
  }

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <Badge variant="secondary" className="mb-2">{ad.category}</Badge>
                  <CardTitle className="font-headline text-lg">{ad.title}</CardTitle>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleAction('edit')}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('delete')} className="text-destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-sm text-muted-foreground">{ad.description}</p>
        </CardContent>
        <CardFooter className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2 font-semibold text-primary">
              <Phone className="w-4 h-4"/>
              <span>{ad.phone}</span>
          </div>
          <div className={`flex items-center gap-1 ${hoursLeft < 6 ? 'text-destructive' : 'text-muted-foreground'}`}>
              <Clock className="w-4 h-4"/>
              <span>{hoursLeft}h left</span>
          </div>
        </CardFooter>
      </Card>

      <AlertDialog open={isVerifying} onOpenChange={setIsVerifying}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter PIN to {action}</AlertDialogTitle>
            <AlertDialogDescription>
              To {action} this advertisement, please enter the 4-digit PIN you created with it.
              {isAdmin && " (Admin can enter any PIN)."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex items-center space-x-2">
            <Pin className="h-5 w-5 text-muted-foreground" />
            <Input 
              type="password"
              maxLength={4}
              placeholder="4-Digit PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && verifyAndExecute()}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={closeDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={verifyAndExecute}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdCard;
