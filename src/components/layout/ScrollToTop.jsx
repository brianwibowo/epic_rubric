import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures that whenever a user navigates or logs in to a new page,
 * the window and all scroll containers immediately reset to the top (y: 0).
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // 1. Reset standard browser window scroll
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });

    // 2. Reset document root
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    // 3. Reset any application containers
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTop = 0;

    const contentWrapper = document.querySelector('[class*="contentWrapper"]');
    if (contentWrapper) contentWrapper.scrollTop = 0;

    const pageContainer = document.querySelector('[class*="page"]');
    if (pageContainer) pageContainer.scrollTop = 0;
  }, [pathname]);

  return null;
};

export default ScrollToTop;
