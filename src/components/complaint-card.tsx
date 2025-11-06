
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { Complaint } from '@/app/lib/types';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';

interface ComplaintCardProps {
  complaint: Complaint;
  onStatusChange: (id: string, field: 'noted' | 'resolved', value: boolean) => void;
  canManage: boolean;
}

const ComplaintCard = ({ complaint, onStatusChange, canManage }: ComplaintCardProps) => {

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
  
  return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <Badge variant="secondary" className="mb-2">From: {complaint.villa}</Badge>
                  <CardTitle className="font-headline text-lg">{complaint.title}</CardTitle>
                  <CardDescription>{timeAgo(complaint.timestamp)}</CardDescription>
              </div>
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
  );
};

export default ComplaintCard;
