import type { NamazTimings, PostType } from './types';

export const AD_EXPIRY_HOURS = 24;

export const namazTimings: NamazTimings = {
    fajr: '06:10',
    zuhar: '13:30',
    asar: '16:45',
    maghrib: '18:00',
    isha: '20:00',
    jumma: '14:00',
    imam: 'janab zulfiqar sahab',
    moazin: 'janab salman sahab',
    khadim: 'janab khalil sahab'
};

export const postTypes: PostType[] = ["Announcement", "Duty Timings", "Maintenance", "Future Plans", "Progress Update", "SOPs"];
