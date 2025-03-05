import { useState, useEffect } from 'react';
import { lockScroll, unlockScroll } from '@/lib/scroll-lock';

interface UseDialogOptions {
  onOpenChange?: (isOpen: boolean) => void;
  preventScroll?: boolean;
}

export function useDialog(initialState = false, options: UseDialogOptions = {}) {
  const [isOpen, setIsOpen] = useState(initialState);
  const { onOpenChange, preventScroll = true } = options;
  
  useEffect(() => {
    if (preventScroll) {
      if (isOpen) {
        lockScroll();
      } else {
        unlockScroll();
      }
    }
    
    if (onOpenChange) {
      onOpenChange(isOpen);
    }
    
    return () => {
      if (preventScroll && isOpen) {
        unlockScroll();
      }
    };
  }, [isOpen, onOpenChange, preventScroll]);
  
  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);
  
  return {
    isOpen,
    open,
    close,
    toggle,
    setIsOpen
  };
}
