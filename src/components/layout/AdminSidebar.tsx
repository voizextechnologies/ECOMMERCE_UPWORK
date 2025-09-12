// src/components/layout/AdminSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { LayoutDashboard, Package, List, Users, ShoppingBag, BookOpen, Settings, X } from 'lucide-react'; // Import X icon

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
}

export function AdminSidebar({ isSidebarOpen, toggleSidebar }: AdminSidebarProps) {
  const location = useLocation();

  const navItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/categories', icon: List, label: 'Categories & Depts.' },
    { path: '/admin/orders', icon: ShoppingBag, label: 'Orders' },
    { path: '/admin/users', icon: Users, label: 'Users' },
    { path: '/admin/articles', icon: BookOpen, label: 'DIY Articles' },
    { path: '/admin/services', icon: Settings, label: 'Services' },
  ];

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-brown-900 text-brown-100 flex flex-col p-4 shadow-lg
      transform transition-transform duration-300 ease-in-out
      ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:flex-shrink-0
    `}>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-white">BuildMart Admin</h1>
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 text-white hover:bg-brown-700 rounded-md"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/');

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  // Only close sidebar on navigation if on a small screen
                  onClick={() => {
                    if (window.innerWidth < 768) { // Check if on mobile breakpoint
                      toggleSidebar();
                    }
                  }}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-brown-700 text-white'
                      : 'hover:bg-brown-700'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
