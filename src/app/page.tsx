
"use client";

import { useState, useEffect } from 'react';
import Header from '@/components/header';
import BottomNav from '@/components/bottom-nav';
import VillaLocatorTab from '@/components/tabs/villa-locator-tab';
import AdvertisementsTab from '@/components/tabs/advertisements-tab';
import ManagementTab from '@/components/tabs/management-tab';
import ComplaintsTab from '@/components/tabs/complaints-tab';
import EmergencyTab from '@/components/tabs/emergency-tab';
import AdminTab from '@/components/tabs/admin-tab';
import MasjidModal from '@/components/modals/masjid-modal';
import SaimaMartModal from '@/components/modals/saima-mart-modal';
import { Button } from '@/components/ui/button';
import type { Tab, MartStatus } from '@/app/lib/types';
import { useSheetData } from './lib/api';

interface MartStatusData {
  status: MartStatus;
  lastUpdated: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('villa-locator');
  const [showMasjidModal, setShowMasjidModal] = useState(false);
  const [showSaimaMartModal, setShowSaimaMartModal] = useState(false);
  
  const { data: martStatusData, refetch: refetchMartStatus } = useSheetData<MartStatusData>('getMartStatus');
  const [martStatus, setMartStatus] = useState<MartStatus>('Closed');

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isManagementLoggedIn, setIsManagementLoggedIn] = useState(false);
  const [isMartOwnerLoggedIn, setIsMartOwnerLoggedIn] = useState(false);

  useEffect(() => {
    if (martStatusData) {
      setMartStatus(martStatusData.status);
    }
  }, [martStatusData]);

  const authProps = {
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    isManagementLoggedIn,
    setIsManagementLoggedIn,
    isMartOwnerLoggedIn,
    setIsMartOwnerLoggedIn
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'villa-locator':
        return <VillaLocatorTab {...authProps} />;
      case 'advertisements':
        return <AdvertisementsTab {...authProps} />;
      case 'management':
        return <ManagementTab {...authProps} />;
      case 'complaints':
        return <ComplaintsTab {...authProps} />;
      case 'emergency':
        return <EmergencyTab {...authProps} />;
      case 'admin':
        return <AdminTab {...authProps} />;
      default:
        return <VillaLocatorTab {...authProps} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow container mx-auto px-4 pt-4 pb-28 w-full max-w-4xl">
        {renderTabContent()}
      </main>
      
      <div className="fixed top-24 right-5 z-50 flex flex-col gap-4">
        <Button 
          size="icon"
          aria-label="Saima Mart Status"
          onClick={() => setShowSaimaMartModal(true)}
          className="rounded-full w-14 h-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 text-2xl"
        >
          🛒
        </Button>
        <Button 
          size="icon"
          aria-label="Masjid Timings"
          onClick={() => setShowMasjidModal(true)}
          className="rounded-full w-14 h-14 bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 text-2xl"
        >
          🕌
        </Button>
      </div>

      <MasjidModal isOpen={showMasjidModal} onOpenChange={setShowMasjidModal} {...authProps} />
      <SaimaMartModal 
        isOpen={showSaimaMartModal} 
        onOpenChange={setShowSaimaMartModal}
        martStatus={martStatus}
        onStatusUpdate={(newStatus) => {
            setMartStatus(newStatus);
            refetchMartStatus();
        }}
        {...authProps}
      />

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
