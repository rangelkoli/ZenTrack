/**
 * Utility to prevent body scrolling when modal dialogs are open
 */

let scrollPosition = 0;
let scrollLocked = false;

export const lockScroll = (): void => {
  if (scrollLocked) return;
  
  if (typeof window !== 'undefined') {
    scrollPosition = window.pageYOffset;
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollPosition}px`;
    document.body.style.width = '100%';
    scrollLocked = true;
  }
};

export const unlockScroll = (): void => {
  if (!scrollLocked) return;
  
  if (typeof window !== 'undefined') {
    document.body.style.removeProperty('overflow');
    document.body.style.removeProperty('position');
    document.body.style.removeProperty('top');
    document.body.style.removeProperty('width');
    window.scrollTo(0, scrollPosition);
    scrollLocked = false;
  }
};
