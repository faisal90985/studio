
"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { NamazTimings, AuthProps } from '@/app/lib/types';
import { Separator } from '../ui/separator';
import { DialogFooter } from '../ui/dialog';
import { Skeleton } from '../ui/skeleton';
import { namazTimings as defaultNamazTimings } from '@/app/lib/data';

// Note: As there's no endpoint in the Apps Script for Namaz timings, this modal will be read-only using static data.

interface MasjidModalProps extends Omit<AuthProps, 'isManagementLoggedIn' | 'setIsManagementLoggedIn' | 'isMartOwnerLoggedIn' | 'setIsMartOwnerLoggedIn'>{
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const MasjidModal = ({ isOpen, onOpenChange, isAdminLoggedIn }: MasjidModalProps) => {
  const [timings, setTimings] = useState<NamazTimings>(defaultNamazTimings);
  const [editMode, setEditMode] = useState(false);
  const [editedTimings, setEditedTimings] = useState<NamazTimings>(defaultNamazTimings);
  const { toast } = useToast();
  
  const handleSave = () => {
    // This is a mock save as there's no backend endpoint.
    setTimings(editedTimings);
    setEditMode(false);
    toast({ title: 'Namaz timings updated (locally).', description: 'Changes are not saved to a backend.' });
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
    setEditedTimings(prev => ({...prev!, [name]: value}));
  };
  
  const renderContent = () => {
    const currentTimings = editMode ? editedTimings : timings;

    const namazRows = [
      { name: 'Fajr', time: formatTime(currentTimings.fajr), key: 'fajr' },
      { name: 'Zuhar', time: formatTime(currentTimings.zuhar), key: 'zuhar' },
      { name: 'Asar', time: formatTime(currentTimings.asar), key: 'asar' },
      { name: 'Maghrib', time: formatTime(currentTimings.maghrib), key: 'maghrib' },
      { name: 'Isha', time: formatTime(currentTimings.isha), key: 'isha' },
      { name: 'Jumma', time: formatTime(currentTimings.jumma), key: 'jumma' },
    ];
  
    const staffRows = [
        { role: 'Imam', name: currentTimings.imam, key: 'imam' },
        { role: 'Moazin', name: currentTimings.moazin, key: 'moazin' },
        { role: 'Khadim', name: currentTimings.khadim, key: 'khadim' },
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
                {namazRows.map(row => (
                     <div key={row.key} className="space-y-2">
                        <Label htmlFor={`edit-${row.key}`} className="capitalize">{row.name}</Label>
                        <Input id={`edit-${row.key}`} name={row.key} type="time" value={editedTimings[row.key as keyof NamazTimings] || ''} onChange={handleInputChange} />
                    </div>
                ))}
            </div>
             <Separator />
              {staffRows.map(row => (
                <div key={row.key} className="space-y-2">
                    <Label htmlFor={`edit-${row.key}`}>{row.role} Name</Label>
                    <Input id={`edit-${row.key}`} name={row.key} value={editedTimings[row.key as keyof NamazTimings] || ''} onChange={handleInputChange} />
                </div>
              ))}
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
