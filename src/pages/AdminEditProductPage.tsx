// src/pages/AdminEditProductPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../components/admin/ProductForm';
import { useAdminProducts } from '../hooks/useSupabase';
import { Product } from '../types'; // Assuming Product type is defined here

export function AdminEditProductPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProductById, updateProduct, loading, error } = useAdminProducts();
  const [initialData, setInitialData] = useState<Product | undefined>(undefined);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getProduct = async () => {
      if (id) {
        const data = await fetchProductById(id);
        if (data) {
          // Map Supabase product data to your Product interface
          const mappedProduct: Product = {
            id: data.id,
            slug: data.slug,
            name: data.name,
            description: data.description || '',
            price: data.price,
            originalPrice: data.original_price || undefined,
            images: data.images || [],
            category: (data.categories as { name: string } | null)?.name || 'N/A',
            department: (data.departments as { name: string } | null)?.name || 'N/A',
            brand: data.brand || '',
            rating: data.rating || 0,
            reviewCount: data.review_count || 0,
            stock: data.stock || 0,
            specifications: data.specifications || {},
            category_id: data.category_id || null,
            department_id: data.department_id || null,
          };
          setInitialData(mappedProduct);
        } else {
          setFetchError('Product not found or failed to load.');
        }
      }
    };
    getProduct();
  }, [id]);

  const handleSubmit = async (productData: Omit<Product, 'id' | 'created_at' | 'reviewCount' | 'rating'>) => {
    if (!id) return;

    const updatedProduct = {
      ...productData,
      images: productData.images || [],
      specifications: productData.specifications || {},
    };

    const result = await updateProduct(id, updatedProduct);
    if (result) {
      navigate('/admin/products');
    } else {
      // Error message will be displayed by ProductForm
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading product data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">Product not found.</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit Product</h2>
      {initialData && (
        <ProductForm initialData={initialData} onSubmit={handleSubmit} loading={loading} error={error} />
      )}
    </div>
  );
}
