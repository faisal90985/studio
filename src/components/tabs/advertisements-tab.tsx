
"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { adCategories, type AdCategory, type AuthProps, type Ad } from '@/app/lib/types';
import AdFormDialog from '@/components/modals/ad-form-dialog';
import AdCard from '@/components/ad-card';
import { PlusCircle, Megaphone } from 'lucide-react';
import { useSheetData, api } from '@/app/lib/api';
import { useToast } from '@/hooks/use-toast';

const AdvertisementsTab = ({ isAdminLoggedIn }: AuthProps) => {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<AdCategory | 'All Ads'>('All Ads');
  const [isFormOpen, setIsFormOpen] = useState(false);

  const { data: allAds, isLoading, error, refetch } = useSheetData<Ad[]>('getAds');
  
  const handlePostAdClick = () => {
    setIsFormOpen(true);
  };
  
  const handleSaveAd = async (adData: Partial<Ad>) => {
    try {
      const result = await api.postAd(adData);

      if (result.success) {
        toast({ title: `Advertisement posted!` });
        refetch(); // Refetch data to show the new/updated ad
        setIsFormOpen(false);
      } else {
        throw new Error(result.error || 'Failed to save ad.');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };
  
  const now = Date.now();
  const filteredAds = allAds
    ? allAds
        .filter(ad => ad.expiry && ad.expiry > now)
        .filter(ad => selectedCategory === 'All Ads' || ad.category === selectedCategory)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    : [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline">Community Ads</CardTitle>
          <Button size="sm" onClick={handlePostAdClick}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Post Ad
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
             <Button
                variant={selectedCategory === 'All Ads' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('All Ads')}
              >
                All Ads
              </Button>
            {adCategories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {isLoading && <p>Loading ads...</p>}
            {error && <p className="text-destructive col-span-full text-center">Error loading ads: {error.message}</p>}
            {!isLoading && !error && filteredAds.length > 0 ? (
              filteredAds.map(ad => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                />
              ))
            ) : (
             !isLoading && !error && (
              <div className="col-span-full text-center text-muted-foreground py-10">
                <Megaphone className="mx-auto h-12 w-12" />
                <p className="mt-4">No advertisements in this category.</p>
              </div>
             )
            )}
          </div>
        </CardContent>
      </Card>
      
      <AdFormDialog
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveAd}
      />
    </div>
  );
};

export default AdvertisementsTab;
