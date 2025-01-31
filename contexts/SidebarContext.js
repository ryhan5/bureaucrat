'use client';
import { createContext, useContext, useState } from 'react';

const SidebarContext = createContext({
  isOpen: true,
  toggle: () => {},
});

export function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = () => setIsOpen(prev => !prev);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

export const useSidebar = () => useContext(SidebarContext);
