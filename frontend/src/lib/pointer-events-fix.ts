/**
 * This utility helper fixes common pointer events issues in React applications
 * 
 * It's especially helpful for applications using:
 * - Framer Motion animations
 * - Absolute positioning
 * - Complex UI with overlapping elements
 * - Multiple stacking contexts
 */

// This should be imported and called in the main application entry point
export function fixPointerEvents() {
  // Check for touch devices
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  if (typeof window !== 'undefined') {
    // Add utility classes to document
    document.documentElement.classList.add('pointer-events-fix');
    
    // Create style element
    const style = document.createElement('style');
    style.textContent = `
      /* Global pointer events fix */
      .pointer-events-fix button, 
      .pointer-events-fix a, 
      .pointer-events-fix [role="button"],
      .pointer-events-fix input,
      .pointer-events-fix label,
      .pointer-events-fix select,
      .pointer-events-fix textarea,
      .pointer-events-fix .interactive {
        pointer-events: auto !important;
        cursor: pointer;
        position: relative;
        z-index: 1;
      }
      
      /* Fix for framer-motion */
      .framer-motion-fix {
        pointer-events: auto !important;
      }
      
      /* Fix for modal dialogs */
      [role="dialog"] {
        pointer-events: auto !important;
      }
      
      /* Better focus styles for accessibility */
      .pointer-events-fix :focus-visible {
        outline: 2px solid #6366f1 !important;
        outline-offset: 2px !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Debug info
    console.info('Pointer events fix applied. Touch device:', isTouchDevice);
  }
  
  return () => {
    // Cleanup function
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('pointer-events-fix');
      const style = document.querySelector('style[data-pointer-events-fix]');
      if (style) style.remove();
    }
  };
}
