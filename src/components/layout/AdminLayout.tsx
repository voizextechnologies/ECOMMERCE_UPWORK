// src/components/layout/AdminLayout.tsx
import React, { useState } from 'react'; // Import useState
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // State for sidebar visibility

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
        <main className="flex-1 overflow-auto p-4"> {/* Added p-4 here, removed from inner div */}
          <div className="bg-white rounded-lg shadow-md min-h-full"> {/* Removed p-6 from here */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
