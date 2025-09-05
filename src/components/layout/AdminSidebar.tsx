// src/components/layout/AdminSidebar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Package, List, Users, ShoppingBag, BookOpen, Settings } from 'lucide-react';

export function AdminSidebar() {
  return (
    <aside className="w-64 bg-brown-800 text-brown-100 flex flex-col p-4 shadow-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">BuildMart Admin</h1>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              to="/admin"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <LayoutDashboard className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/admin/products"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <Package className="w-5 h-5 mr-3" />
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/admin/categories"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <List className="w-5 h-5 mr-3" />
              Categories & Depts.
            </Link>
          </li>
          <li>
            <Link
              to="/admin/orders"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5 mr-3" />
              Orders
            </Link>
          </li>
          <li>
            <Link
              to="/admin/users"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <Users className="w-5 h-5 mr-3" />
              Users
            </Link>
          </li>
          <li>
            <Link
              to="/admin/articles"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <BookOpen className="w-5 h-5 mr-3" />
              DIY Articles
            </Link>
          </li>
          <li>
            <Link
              to="/admin/services"
              className="flex items-center p-2 rounded-md hover:bg-brown-700 transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              Services
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
