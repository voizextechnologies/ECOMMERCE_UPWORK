// src/hooks/useSupabase.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

// ... (other hooks like useProducts, useDepartments, useProduct, useCart remain unchanged)

// Admin-specific product CRUD operations
export function useAdminProducts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('useAdminProducts: Attempting to fetch all products...');
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (name),
          departments!department_id (name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('useAdminProducts: Supabase fetch error:', error);
        throw error; // Re-throw to be caught by the outer catch block
      }
      console.log('useAdminProducts: Products fetched successfully.');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during fetch';
      console.error('useAdminProducts: Error in fetchAllProducts:', errorMessage, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProductById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`useAdminProducts: Attempting to fetch product by ID: ${id}`);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories!category_id (id, name),
          departments!department_id (id, name)
        `)
        .eq('id', id)
        .single();
      if (error) {
        console.error('useAdminProducts: Supabase fetch error for single product:', error);
        throw error;
      }
      console.log(`useAdminProducts: Product ${id} fetched successfully.`);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch product';
      console.error('useAdminProducts: Error in fetchProductById:', errorMessage, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = useCallback(async (productData: Tables['products']['Insert']) => {
    setLoading(true);
    setError(null);
    try {
      console.log('useAdminProducts: Attempting to add product:', productData.name);
      const { data, error } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single();
      if (error) {
        console.error('useAdminProducts: Supabase insert error:', error);
        throw error;
      }
      console.log('useAdminProducts: Product added successfully.');
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add product';
      console.error('useAdminProducts: Error in addProduct:', errorMessage, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, productData: Tables['products']['Update']) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`useAdminProducts: Attempting to update product ID: ${id}`);
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      if (error) {
        console.error('useAdminProducts: Supabase update error:', error);
        throw error;
      }
      console.log(`useAdminProducts: Product ${id} updated successfully.`);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update product';
      console.error('useAdminProducts: Error in updateProduct:', errorMessage, err);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`useAdminProducts: Attempting to delete product ID: ${id}`);
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) {
        console.error('useAdminProducts: Supabase delete error:', error);
        throw error;
      }
      console.log(`useAdminProducts: Product ${id} deleted successfully.`);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete product';
      console.error('useAdminProducts: Error in deleteProduct:', errorMessage, err);
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllProducts,
    fetchProductById,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
