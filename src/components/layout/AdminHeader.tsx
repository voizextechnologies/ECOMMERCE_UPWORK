// src/components/layout/AdminHeader.tsx
import React from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

export function AdminHeader() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login'; // Redirect to admin login after logout
  };

  return (
    <header className="bg-brown-900 text-white p-4 flex justify-between items-center shadow-md">
      <h2 className="text-xl font-bold">Admin Dashboard</h2>
      <Button variant="ghost" onClick={handleLogout} className="text-white hover:bg-brown-700">
        <LogOut className="w-5 h-5 mr-2" />
        Logout
      </Button>
    </header>
  );
}
