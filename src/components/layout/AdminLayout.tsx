// src/components/layout/AdminLayout.tsx
import React, { useState, useEffect } from 'react'; // Import useEffect
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  // Initialize isSidebarOpen based on screen width
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 768);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Effect to handle window resizing
  useEffect(() => {
    const handleResize = () => {
      // Only update if the breakpoint is crossed
      if (window.innerWidth >= 768 && !isSidebarOpen) {
        setIsSidebarOpen(true);
      } else if (window.innerWidth < 768 && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isSidebarOpen]); // Depend on isSidebarOpen to re-evaluate when it changes

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'md:ml-64' : 'md:ml-0' // Adjust margin based on sidebar state for medium+ screens
      }`}>
        {/* Header */}
        <AdminHeader toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4">
          <div className="bg-white rounded-lg shadow-md min-h-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
