import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { scrollWindowToTop } from '@/utils/case-store';

export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    scrollWindowToTop();
  }, [pathname]);
  return null;
}
