/**
 * Calendar component styling fix
 * This utility ensures that calendar components have proper background colors and stylings
 */

export function applyCalendarFixes() {
  if (typeof window === 'undefined') return;

  // Function to find and fix calendar elements
  function fixCalendarElements() {
    // Find all calendar-related elements that might have styling issues
    const calendarElements = document.querySelectorAll('.rdp, [data-radix-popper-content-wrapper] > div');
    
    calendarElements.forEach(element => {
      if (element instanceof HTMLElement) {
        // Apply background and other styles
        element.style.backgroundColor = 'white';
        element.style.borderRadius = '0.375rem';
        element.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)';
        element.style.zIndex = '100';
      }
    });

    // Fix Popover Content
    const popoverContent = document.querySelectorAll('[role="dialog"]');
    popoverContent.forEach(element => {
      if (element instanceof HTMLElement) {
        element.style.backgroundColor = 'white';
      }
    });
  }

  // Create observer to watch for calendar elements being added to the DOM
  const observer = new MutationObserver((mutations) => {
    let shouldFix = false;
    
    mutations.forEach(mutation => {
      if (mutation.addedNodes.length > 0) {
        // Check if any calendar-related elements were added
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (
              node.classList.contains('rdp') || 
              node.getAttribute('data-radix-popper-content-wrapper') !== null ||
              node.getAttribute('role') === 'dialog'
            ) {
              shouldFix = true;
            }
          }
        });
      }
    });
    
    if (shouldFix) {
      fixCalendarElements();
    }
  });

  // Start observing the document
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Initial fix in case calendar is already present
  fixCalendarElements();

  // Return cleanup function
  return () => observer.disconnect();
}
