'use client';
import { useSidebar } from '../contexts/SidebarContext';

export default function PageContainer({ children }) {
  const { isOpen } = useSidebar();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div 
        className={`
          transition-all duration-300 
          ${isOpen ? 'lg:pl-72' : ''}
        `}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
