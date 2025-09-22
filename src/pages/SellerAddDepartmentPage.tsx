// src/pages/SellerAddDepartmentPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DepartmentForm } from '../components/admin/DepartmentForm'; // Re-use existing form
import { useSellerCategories } from '../hooks/useSupabase'; // Use new seller hook
import { Department } from '../types';
import { useApp } from '../contexts/AppContext'; // To get current user's ID

export function SellerAddDepartmentPage() {
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { addDepartment, loading, error } = useSellerCategories(userId);

  const handleSubmit = async (departmentData: Omit<Department, 'id' | 'categories'>) => {
    const newDepartment = {
      slug: departmentData.slug,
      name: departmentData.name,
      description: departmentData.description || '',
      image: departmentData.image || '',
      // seller_id will be automatically added by useSellerCategories hook
    };

    const result = await addDepartment(newDepartment);
    if (result) {
      navigate('/seller/categories');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Department</h2>
      <DepartmentForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
