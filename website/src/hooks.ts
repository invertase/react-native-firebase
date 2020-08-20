import { useContext } from 'react';
import { LocationContext } from './context';

export function useBodyClassToggle(className: string): () => void {
  return () => {
    if (!window?.document?.body) {
      console.warn('useMenuToggle: failed to find document body');
      return;
    }

    window.document.body.classList.toggle(className);
  };
}

export function useLocation() {
  return useContext(LocationContext);
}
