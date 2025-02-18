import { useEffect, useRef, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface AutosaveOptions {
  interval?: number;
  onSave: () => Promise<void>;
}

export function useAutosave({ interval = 30000, onSave }: AutosaveOptions) {
  const lastSaveRef = useRef<Date>(new Date());
  const pendingSaveRef = useRef<boolean>(false);

  const debouncedSave = useCallback(
    debounce(async () => {
      if (pendingSaveRef.current) return;
      
      pendingSaveRef.current = true;
      try {
        await onSave();
        lastSaveRef.current = new Date();
      } catch (error) {
        console.error('Autosave failed:', error);
      } finally {
        pendingSaveRef.current = false;
      }
    }, 1000),
    [onSave]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      const timeSinceLastSave = new Date().getTime() - lastSaveRef.current.getTime();
      if (timeSinceLastSave >= interval) {
        debouncedSave();
      }
    }, interval);

    return () => {
      clearInterval(intervalId);
      debouncedSave.flush();
    };
  }, [interval, debouncedSave]);

  return { save: debouncedSave };
}
