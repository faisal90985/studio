
"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Clock } from 'lucide-react';
import type { Ad } from '@/app/lib/types';

interface AdCardProps {
  ad: Ad;
}

const AdCard = ({ ad }: AdCardProps) => {
  const now = Date.now();
  const hoursLeft = Math.max(0, Math.ceil((ad.expiry - now) / (1000 * 60 * 60)));

  return (
      <Card className="flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
              <div>
                  <Badge variant="secondary" className="mb-2">{ad.category}</Badge>
                  <CardTitle className="font-headline text-lg">{ad.title}</CardTitle>
              </div>
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
  );
};

export default AdCard;
