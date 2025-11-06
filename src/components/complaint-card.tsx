
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Pin } from 'lucide-react';
import type { Complaint } from '@/app/lib/types';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useState } from 'react';
import { Input } from './ui/input';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';


interface ComplaintCardProps {
  complaint: Complaint;
  onEdit: (complaint: Complaint) => void;
  onDelete: (id: string, pin: string) => void;
  onStatusChange: (id: string, field: 'noted' | 'resolved', value: boolean) => void;
  canManage: boolean;
}

const ComplaintCard = ({ complaint, onEdit, onDelete, onStatusChange, canManage }: ComplaintCardProps) => {
  const { toast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);
  const [pin, setPin] = useState('');
  const [action, setAction] = useState<'edit' | 'delete' | null>(null);

  const timeAgo = (timestamp: string | Date) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "just now";
  }
  
  const handleAction = (type: 'edit' | 'delete') => {
    setAction(type);
    setIsVerifying(true);
  }

  const verifyAndExecute = () => {
    if (!pin) {
      toast({ title: 'PIN required', description: 'Please enter the 4-digit PIN for this complaint.', variant: 'destructive'});
      return;
    }
    if (action === 'edit') {
      onEdit({ ...complaint, pin });
    }
    if (action === 'delete') {
      onDelete(complaint.id, pin);
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <Badge variant="secondary" className="mb-2">From: {complaint.villa}</Badge>
                  <CardTitle className="font-headline text-lg">{complaint.title}</CardTitle>
                  <CardDescription>{timeAgo(complaint.timestamp)}</CardDescription>
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
        <CardContent>
          <p className="text-sm text-muted-foreground">{complaint.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-muted/50 p-4 rounded-b-lg">
            <div className="flex items-center space-x-2">
              <Switch
                id={`noted-${complaint.id}`}
                checked={complaint.noted}
                onCheckedChange={(checked) => onStatusChange(complaint.id, 'noted', checked)}
                disabled={!canManage}
              />
              <Label htmlFor={`noted-${complaint.id}`}>Noted</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id={`resolved-${complaint.id}`}
                checked={complaint.resolved}
                onCheckedChange={(checked) => onStatusChange(complaint.id, 'resolved', checked)}
                disabled={!canManage}
              />
              <Label htmlFor={`resolved-${complaint.id}`}>Resolved</Label>
            </div>
            {complaint.resolved && complaint.resolvedDate && (
                <span className="text-xs text-green-600 ml-auto">Resolved on {new Date(complaint.resolvedDate).toLocaleDateString()}</span>
            )}
        </CardFooter>
      </Card>
      
      <AlertDialog open={isVerifying} onOpenChange={setIsVerifying}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enter PIN to {action}</AlertDialogTitle>
            <AlertDialogDescription>
              To {action} this complaint, please enter the 4-digit PIN you created with it.
              {canManage && " (Admin/Management can enter any PIN)."}
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

export default ComplaintCard;
