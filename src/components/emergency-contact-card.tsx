
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';
import type { EmergencyContact } from '@/app/lib/types';

interface EmergencyContactCardProps {
  contact: EmergencyContact;
}

const EmergencyContactCard = ({ contact }: EmergencyContactCardProps) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">{contact.type}</Badge>
        <CardTitle className="font-headline text-lg pt-2">{contact.name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground">{contact.description}</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Button asChild className="w-full">
            <a href={`tel:${contact.phone}`}>
                <Phone className="mr-2 h-4 w-4" />
                {contact.phone}
            </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmergencyContactCard;
