// src/components/layout/AdminSidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom'; // Import useLocation
import { LayoutDashboard, Package, List, Users, ShoppingBag, BookOpen, Settings } from 'lucide-react';

export function AdminSidebar() {
  const location = useLocation(); // Get current location for active link styling

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
    <aside className="w-64 bg-brown-900 text-brown-100 flex flex-col p-4 shadow-lg"> {/* Changed bg-brown-800 to bg-brown-900 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">BuildMart Admin</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/admin' && location.pathname === '/admin/'); // Handle root admin path

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center p-2 rounded-md transition-colors ${
                    isActive
                      ? 'bg-brown-700 text-white' // Active state: medium brown background, white text
                      : 'hover:bg-brown-700' // Hover state: medium brown background
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
