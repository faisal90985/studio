
export type Tab = 'villa-locator' | 'advertisements' | 'management' | 'complaints' | 'emergency' | 'admin';

export interface Villa {
  id?: string;
  category: string;
  street: string;
  block: string;
  residents: string;
  mapLink: string;
}

export interface VillaData {
  [key: string]: Villa;
}

export interface Ad {
  id: string; // Changed from ID
  title: string;
  description:string;
  phone: string;
  category: AdCategory;
  expiry: number;
  timestamp: string | Date;
}

export type AdCategory = "Property" | "Food" | "Ladies Items" | "Tution Center" | "Missing Goods" | "Health & Medicine" | "Others" | "All Ads";
export const adCategories: AdCategory[] = ["Property", "Food", "Ladies Items", "Tution Center", "Missing Goods", "Health & Medicine", "Others"];


export interface Complaint {
  id: string; // Changed from ID
  villa: string;
  title: string;
  description: string;
  noted: boolean;
  resolved: boolean;
  resolvedDate?: string | Date;
  timestamp: string | Date;
}

export interface ManagementPost {
  id: string; // Changed from ID
  type: PostType;
  title: string;
  content: string;
  timestamp: string | Date;
}

export type PostType = "Announcement" | "Duty Timings" | "Maintenance" | "Future Plans" | "Progress Update" | "SOPs";
export const postTypes: PostType[] = ["Announcement", "Duty Timings", "Maintenance", "Future Plans", "Progress Update", "SOPs"];


export interface EmergencyContact {
  id: string; // Changed from ID
  type: string;
  name: string;
  phone: string;
  description: string;
  timestamp: string | Date;
}

export interface NamazTimings {
  fajr: string;
  zuhar: string;
  asar: string;
  maghrib: string;
  isha: string;
  jumma: string;
  imam: string;
  moazin: string;
  khadim: string;
}

export type MartStatus = "Mart is Open" | "Mart is Closed" | "Namaz-Break" | "Lunch/Dinner Break";
export const martStatuses: MartStatus[] = ["Mart is Open", "Mart is Closed", "Namaz-Break", "Lunch/Dinner Break"];


export interface AuthProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (value: boolean) => void;
  isManagementLoggedIn: boolean;
  setIsManagementLoggedIn: (value: boolean) => void;
  isMartOwnerLoggedIn: boolean;
  setIsMartOwnerLoggedIn: (value: boolean) => void;
}
    
