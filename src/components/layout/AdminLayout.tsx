// src/components/layout/AdminLayout.tsx
import React from 'react';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-100"> {/* Changed overall background to gray-100 */}
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-auto">
          <div className="bg-white rounded-lg shadow-md p-6 min-h-full"> {/* Added white background, rounded corners, shadow, and padding */}
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
