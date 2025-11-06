
"use client";

// S-Hook: This is a custom hook that simplifies fetching data from the Google Apps Script backend.
import { useState, useEffect, useCallback } from 'react';

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyXgKP80vpjkKXIE78R7fj4Ae5wGSv0fByoHSSitLAeES84rYC7rz1smvze-e1Zyak/exec";

// Generic function to handle all GET requests
async function fetchData(action: string, params: Record<string, string> = {}) {
  try {
    const url = new URL(SCRIPT_URL);
    url.searchParams.append('action', action);
    for (const key in params) {
      url.searchParams.append(key, params[key]);
    }
    const response = await fetch(url.toString(), { method: 'GET', redirect: 'follow' });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    const json = await response.json();
    if (json.success === false) { // Handle script-level errors
        throw new Error(json.error || 'An unknown error occurred in the script.');
    }
    return json;
  } catch (error) {
    console.error(`Error fetching ${action}:`, error);
    throw error; // Re-throw to be caught by the caller
  }
}

// Generic function to handle all POST requests
async function postData(action: string, data: Record<string, any>) {
  try {
    const url = new URL(SCRIPT_URL);
    url.searchParams.append('action', action);

    // Using URLSearchParams to correctly encode the body for 'application/x-www-form-urlencoded'
    const body = new URLSearchParams();
    for (const key in data) {
        if (data[key] !== undefined && data[key] !== null) {
            body.append(key, data[key].toString());
        }
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
    }
    const json = await response.json();
     if (json.success === false) { // Handle script-level errors
        throw new Error(json.error || 'An unknown error occurred in the script.');
    }
    return json;
  } catch (error) {
    console.error(`Error posting ${action}:`, error);
    throw error;
  }
}

// --- Data Fetching Hooks and Functions ---

// Custom hook for fetching data to replace useCollection/useDoc
export function useSheetData<T>(action: string) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(() => {
    setIsLoading(true);
    fetchData(action)
      .then(result => {
        // The Google Apps Script returns objects with capitalized keys.
        // We'll convert them to camelCase to match the app's existing type definitions.
        const camelCaseResult = Array.isArray(result) 
            ? result.map(item => mapKeysToCamelCase(item))
            : mapKeysToCamelCase(result);
        setData(camelCaseResult);
        setError(null);
      })
      .catch(err => {
        setError(err);
        setData(null);
      })
      .finally(() => setIsLoading(false));
  }, [action]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
}

// --- API Functions ---
export const api = {
  getAds: () => fetchData('getAds'),
  postAd: (data: Record<string, any>) => postData('postAd', data),
  
  getComplaints: () => fetchData('getComplaints'),
  postComplaint: (data: Record<string, any>) => postData('postComplaint', data),
  updateComplaintStatus: (data: Record<string, any>) => postData('updateComplaintStatus', data),

  getManagementPosts: () => fetchData('getManagementPosts'),
  postManagementPost: (data: Record<string, any>) => postData('postManagementPost', data),
  updateManagementPost: (data: Record<string, any>) => postData('updateManagementPost', data),
  deleteManagementPost: (id: string) => postData('deleteManagementPost', { id }),
  getManagementPassword: () => fetchData('getManagementPassword'),
  setManagementPassword: (password: string) => postData('setManagementPassword', { password }),

  getEmergencyContacts: () => fetchData('getEmergencyContacts'),
  postEmergencyContact: (data: Record<string, any>) => postData('postEmergencyContact', data),

  getMartStatus: () => fetchData('getMartStatus'),
  updateMartStatus: (data: Record<string, any>) => postData('updateMartStatus', data),
};


// --- Utility to convert sheet data keys ---
function toCamelCase(str: string): string {
    if (str.toUpperCase() === 'ID') return 'id';
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function mapKeysToCamelCase(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => mapKeysToCamelCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((result, key) => {
            result[toCamelCase(key)] = obj[key];
            return result;
        }, {} as any);
    }
    return obj;
}
