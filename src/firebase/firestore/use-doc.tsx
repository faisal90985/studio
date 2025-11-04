'use client';
    
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DocumentReference,
  onSnapshot,
  DocumentData,
  FirestoreError,
  DocumentSnapshot,
} from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/** Utility type to add an 'id' field to a given type T. */
type WithId<T> = T & { id: string };

/**
 * Interface for the return value of the useDoc hook.
 * @template T Type of the document data.
 */
export interface UseDocResult<T> {
  data: WithId<T> | null; // Document data with ID, or null.
  isLoading: boolean;       // True if loading.
  error: FirestoreError | Error | null; // Error object, or null.
}

/**
 * React hook to subscribe to a single Firestore document in real-time.
 * Handles nullable references.
 * 
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *
 *
 * @template T Optional type for document data. Defaults to any.
 * @param {DocumentReference<DocumentData> | null | undefined} docRef -
 * The Firestore DocumentReference. Waits if null/undefined.
 * @returns {UseDocResult<T>} Object with data, isLoading, error.
 */
export function useDoc<T = any>(
  memoizedDocRef: (DocumentReference<DocumentData> & {__memo?: boolean}) | null | undefined,
): UseDocResult<T> {
  type StateDataType = WithId<T> | null;

  const [data, setData] = useState<StateDataType>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeSetData = useCallback((d: StateDataType) => {
    if (isMounted.current) setData(d);
  }, []);
  const safeSetError = useCallback((e: FirestoreError | Error | null) => {
    if (isMounted.current) setError(e);
  }, []);
  const safeSetIsLoading = useCallback((b: boolean) => {
    if (isMounted.current) setIsLoading(b);
  }, []);

  useEffect(() => {
    if (!memoizedDocRef) {
      safeSetData(null);
      safeSetIsLoading(false);
      safeSetError(null);
      return;
    }

    safeSetIsLoading(true);
    safeSetError(null);

    const unsubscribe = onSnapshot(
      memoizedDocRef,
      (snapshot: DocumentSnapshot<DocumentData>) => {
        if (snapshot.exists()) {
          safeSetData({ ...(snapshot.data() as T), id: snapshot.id });
        } else {
          safeSetData(null);
        }
        safeSetError(null); 
        safeSetIsLoading(false);
      },
      (error: FirestoreError) => {
        const contextualError = new FirestorePermissionError({
          operation: 'get',
          path: memoizedDocRef.path,
        });

        safeSetError(contextualError);
        safeSetData(null);
        safeSetIsLoading(false);

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedDocRef, safeSetData, safeSetError, safeSetIsLoading]);

  if(memoizedDocRef && typeof memoizedDocRef === 'object' && !('__memo' in memoizedDocRef)) {
     console.warn('The document reference passed to useDoc was not memoized. This can cause performance issues and infinite loops.', memoizedDocRef);
  }

  return { data, isLoading, error };
}
