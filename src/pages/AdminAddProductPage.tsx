// src/pages/AdminAddProductPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/admin/ProductForm';
import { useAdminProducts } from '../hooks/useSupabase';
import { Product } from '../types'; // Assuming Product type is defined here

export function AdminAddProductPage() {
  const navigate = useNavigate();
  const { addProduct, loading, error } = useAdminProducts();

  const handleSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'reviewCount' | 'rating'>) => {
    const newProduct = {
      ...productData,
      // Ensure images is an array of strings, even if empty
      images: productData.images || [],
      // Ensure specifications is a JSONB object, even if empty
      specifications: productData.specifications || {},
      // Default values for new products
      rating: 0,
      review_count: 0,
    };

    const result = await addProduct(newProduct);
    if (result) {
      navigate('/admin/products');
    } else {
      // Error message will be displayed by ProductForm
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Add New Product</h2>
      <ProductForm onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
}
