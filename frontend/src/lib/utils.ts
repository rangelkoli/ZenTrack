import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add this utility function for handling clicks
export function ensureClick<T extends HTMLElement = HTMLElement>(
  callback: (event: React.MouseEvent<T>) => void
) {
  return (event: React.MouseEvent<T>) => {
    // Stop propagation to prevent other elements from capturing the event
    event.stopPropagation();
    
    // Execute the callback
    callback(event);
  };
}

// Fix for framer-motion and pointer events
export const motionSafeProps = {
  style: {
    pointerEvents: 'auto' as const
  }
};
