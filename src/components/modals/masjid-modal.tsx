"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { NamazTimings, AuthProps } from '@/app/lib/types';
import { Separator } from '../ui/separator';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { DialogFooter } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { namazTimings as defaultNamazTimings } from '@/app/lib/data';

interface MasjidModalProps extends Omit<AuthProps, 'isManagementLoggedIn' | 'setIsManagementLoggedIn' | 'isMartOwnerLoggedIn' | 'setIsMartOwnerLoggedIn'>{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MasjidModal = ({ isOpen, onOpenChange, isAdminLoggedIn }: MasjidModalProps) => {
  const firestore = useFirestore();
  const timingsRef = useMemoFirebase(() => firestore ? doc(firestore, 'namazTimings', 'times') : null, [firestore]);
  const { data: timingsData, isLoading, error } = useDoc<NamazTimings>(timingsRef);

  const [timings, setTimings] = useState<NamazTimings | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [editedTimings, setEditedTimings] = useState<NamazTimings | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (timingsData) {
      setTimings(timingsData);
      setEditedTimings(timingsData);
    } else if (!isLoading && !error) {
      // If no data and not loading/error, maybe it doesn't exist.
      // Let's create it with defaults.
      if (firestore) {
        setDoc(doc(firestore, 'namazTimings', 'times'), defaultNamazTimings);
      }
      setTimings(defaultNamazTimings);
      setEditedTimings(defaultNamazTimings);
    }
  }, [timingsData, isLoading, error, firestore]);

  const handleSave = () => {
    if (editedTimings && firestore) {
      setDocumentNonBlocking(doc(firestore, 'namazTimings', 'times'), editedTimings, { merge: true });
      setTimings(editedTimings);
      setEditMode(false);
      toast({ title: 'Namaz timings updated successfully.' });
    }
  };
  
  const handleCancel = () => {
    setEditedTimings(timings);
    setEditMode(false);
  }
  
  const formatTime = (timeStr: string | undefined) => {
    if (!timeStr) return "Not set";
    const [hours, minutes] = timeStr.split(':');
    if(isNaN(parseInt(hours)) || isNaN(parseInt(minutes))) return "Invalid Time";
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if(editedTimings) {
      setEditedTimings(prev => ({...prev!, [name]: value}));
    }
  };
  
  const renderLoadingSkeleton = () => (
    <div className="space-y-4 py-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex justify-between items-center text-lg">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-24" />
        </div>
      ))}
      <Separator />
      {[...Array(3)].map((_, i) => (
         <div key={i} className="flex justify-between items-center text-md">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
        </div>
      ))}
    </div>
  );

  const renderContent = () => {
    if (isLoading || !timings || !editedTimings) {
      return renderLoadingSkeleton();
    }
    if (error) {
      return <p className='text-center text-destructive py-4'>Could not load timings. Please check your connection.</p>
    }


    const namazRows = [
      { name: 'Fajr', time: formatTime(timings.fajr) },
      { name: 'Zuhar', time: formatTime(timings.zuhar) },
      { name: 'Asar', time: formatTime(timings.asar) },
      { name: 'Maghrib', time: formatTime(timings.maghrib) },
      { name: 'Isha', time: formatTime(timings.isha) },
      { name: 'Jumma', time: formatTime(timings.jumma) },
    ];
  
    const staffRows = [
        { role: 'Imam', name: timings.imam },
        { role: 'Moazin', name: timings.moazin },
        { role: 'Khadim', name: timings.khadim },
    ];

    if (!editMode) {
      return (
        <>
          <div className="space-y-2 py-4">
              {namazRows.map(row => (
                  <div key={row.name} className="flex justify-between items-center text-lg">
                      <span className="font-semibold text-primary">{row.name}</span>
                      <span className="font-mono font-medium">{row.time}</span>
                  </div>
              ))}
          </div>
          <Separator />
          <div className="space-y-2 py-4">
               {staffRows.map(row => (
                  <div key={row.role} className="flex justify-between items-center text-md">
                      <span className="font-semibold text-muted-foreground">{row.role}</span>
                      <span className="font-medium">{row.name}</span>
                  </div>
              ))}
          </div>
        </>
      );
    } else {
      return (
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-2 gap-4">
                {Object.keys(timings).filter(k => k !== 'imam' && k !== 'moazin' && k !== 'khadim' && k !== 'jumma' && !k.endsWith('Id')).map(key => (
                     <div key={key} className="space-y-2">
                        <Label htmlFor={`edit-${key}`} className="capitalize">{key}</Label>
                        <Input id={`edit-${key}`} name={key} type="time" value={editedTimings[key as keyof NamazTimings] || ''} onChange={handleInputChange} />
                    </div>
                ))}
                <div className="space-y-2">
                  <Label htmlFor="edit-jumma">Jumma</Label>
                  <Input id="edit-jumma" name="jumma" type="time" value={editedTimings.jumma || ''} onChange={handleInputChange} />
                </div>
            </div>
             <Separator />
             <div className="space-y-2">
                <Label htmlFor="edit-imam">Imam Name</Label>
                <Input id="edit-imam" name="imam" value={editedTimings.imam || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="edit-moazin">Moazin Name</Label>
                <Input id="edit-moazin" name="moazin" value={editedTimings.moazin || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2">
                <Label htmlFor="edit-khadim">Khadim Name</Label>
                <Input id="edit-khadim" name="khadim" value={editedTimings.khadim || ''} onChange={handleInputChange} />
            </div>
        </div>
      );
    }
  }


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-center">🕌 Masjid Namaz Timings</DialogTitle>
          <DialogDescription className="text-center">Current prayer and Jumma times.</DialogDescription>
        </DialogHeader>
        
        {renderContent()}
        
        <DialogFooter className="sm:justify-between">
            <div>
            {isAdminLoggedIn && !editMode && <Button variant="outline" onClick={() => setEditMode(true)}>Edit Timings</Button>}
            </div>
            <div className='flex gap-2'>
            {editMode ? (
                <>
                <Button variant="outline" onClick={handleCancel}>Cancel</Button>
                <Button onClick={handleSave}>Save Changes</Button>
                </>
            ) : (
                <Button onClick={() => onOpenChange(false)}>Close</Button>
            )}
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MasjidModal;
