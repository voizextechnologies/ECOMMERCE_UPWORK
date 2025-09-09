// src/hooks/useSupabase.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

interface UseProductsOptions {
  categorySlug?: string;
  departmentSlug?: string; // Add this
  searchQuery?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  limit?: number;
  offset?: number;
}

// Hook for fetching products with filtering, searching, and pagination
export function useProducts(options?: UseProductsOptions) {
  const [products, setProducts] = useState<Tables['products']['Row'][]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true); // CORRECTED LINE: Changed from `true` to `useState(true)`
  const [error, setError] = useState<string | null>(null);

  // Create a stable key for the options to prevent unnecessary re-renders
  const optionsKey = JSON.stringify(options || {});
  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        let categoryIdToFilter: string | null = null;
        let departmentIdToFilter: string | null = null;

        // 1. Fetch category ID if categorySlug is provided
        if (options?.categorySlug) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('categories')
            .select('id')
            .eq('slug', options.categorySlug)
            .single();

          if (categoryError) {
            console.error('Error fetching category ID by slug:', categoryError);
            throw new Error('Failed to find category.');
          }
          if (categoryData) {
            categoryIdToFilter = categoryData.id;
          } else {
            // If categorySlug is provided but no category found, return empty products
            setProducts([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
        }

        // 2. Fetch department ID if departmentSlug is provided
        if (options?.departmentSlug) {
          const { data: departmentData, error: departmentError } = await supabase
            .from('departments')
            .select('id')
            .eq('slug', options.departmentSlug)
            .single();

          if (departmentError) {
            console.error('Error fetching department ID by slug:', departmentError);
            throw new Error('Failed to find department.');
          }
          if (departmentData) {
            departmentIdToFilter = departmentData.id;
          } else {
            // If departmentSlug is provided but no department found, return empty products
            setProducts([]);
            setTotalCount(0);
            setLoading(false);
            return;
          }
        }


        let query = supabase
          .from('products')
          .select(
            `
            *,
            categories!category_id (
              id,
              name,
              slug
            ),
            departments!department_id (
              id,
              name,
              slug
            )
          `,
            { count: 'exact' }
          );

        // Apply filters
        if (categoryIdToFilter) {
          query = query.eq('category_id', categoryIdToFilter);
        }
        if (departmentIdToFilter) {
          query = query.eq('department_id', departmentIdToFilter);
        }
        if (options?.brand) {
          query = query.ilike('brand', `%${options.brand}%`);
        }
        if (options?.minPrice !== undefined) {
          query = query.gte('price', options.minPrice);
        }
        if (options?.maxPrice !== undefined) {
          query = query.lte('price', options.maxPrice);
        }

        // Apply search query
        if (options?.searchQuery) {
          query = query.or(
            `name.ilike.%${options.searchQuery}%,description.ilike.%${options.searchQuery}%`
          );
        }

        // Apply pagination
        if (options?.limit !== undefined && options?.offset !== undefined) {
          query = query.range(options.offset, options.offset + options.limit - 1);
        }

        const { data, error, count } = await query;

        if (error) throw error;

        setProducts(data || []);
        setTotalCount(count || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, [optionsKey]); // Use stable key instead of individual options

  return { products, totalCount, loading, error };
}

// Hook for fetching departments with categories
export function useDepartments() {
  const [departments, setDepartments] = useState<Tables['departments']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDepartments() {
      try {
        const { data, error } = await supabase
          .from('departments')
          .select(
            `
            *,
            categories (
              id,
              name,
              slug,
              description,
              product_count
            )
          `
          );

        if (error) throw error;
        setDepartments(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDepartments();
  }, []);

  return { departments, loading, error };
}

// Hook for fetching a single product by slug
export function useProduct(slug: string) {
  const [product, setProduct] = useState<Tables['products']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProduct() {
      if (!slug) return;

      try {
        const { data, error } = await supabase
          .from('products')
          .select(
            `
            *,
            categories!category_id (
              id,
              name,
              slug
            ),
            departments!department_id (
              id,
              name,
              slug
            ),
            product_variants (
              id,
              name,
              price,
              stock,
              attributes
            )
          `
          )
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setProduct(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Product not found');
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
}

// Hook for user cart items
export function useCart(userId: string | null) {
  const [cartItems, setCartItems] = useState<Tables['cart_items']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCartItems() {
      if (!userId) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('cart_items')
          .select(
            `
            *,
            products (
              id,
              name,
              price,
              images,
              slug
            ),
            product_variants (
              id,
              name,
              price,
              attributes
            )
          `
          )
          .eq('user_id', userId);

        if (error) throw error;
        setCartItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch cart');
      } finally {
        setLoading(false);
      }
    }

    fetchCartItems();
  }, [userId]);

  const addToCart = async (productId: string, quantity: number = 1, variantId?: string) => {
    if (!userId) throw new Error('User must be logged in');

    const { error } = await supabase.from('cart_items').upsert({
      user_id: userId,
      product_id: productId,
      variant_id: variantId || null,
      quantity,
    });

    if (error) throw error;

    // Refresh cart items
    const { data } = await supabase
      .from('cart_items')
      .select(
        `
        *,
        products (
          id,
          name,
          price,
          images,
          slug
        ),
        product_variants (
          id,
          name,
          price,
          attributes
        )
      `
      )
      .eq('user_id', userId);

    setCartItems(data || []);
  };

  const removeFromCart = async (cartItemId: string) => {
    const { error } = await supabase.from('cart_items').delete().eq('id', cartItemId);

    if (error) throw error;

    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      return removeFromCart(cartItemId);
    }

    const { error } = await supabase.from('cart_items').update({ quantity }).eq('id', cartItemId);

    if (error) throw error;

    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
    );
  };

  return {
    cartItems,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateQuantity,
  };
}

// Hook for user addresses
export function useAddresses(userId: string | null) {
  const [addresses, setAddresses] = useState<Tables['addresses']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAddresses() {
      if (!userId) {
        setAddresses([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAddresses(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
      } finally {
        setLoading(false);
      }
    }

    fetchAddresses();
  }, [userId]);

  const addAddress = async (addressData: Tables['addresses']['Insert']) => {
    if (!userId) throw new Error('User must be logged in');

    const { data, error } = await supabase
      .from('addresses')
      .insert({ ...addressData, user_id: userId })
      .select()
      .single();

    if (error) throw error;

    setAddresses(prev => [data, ...prev]);
    return data;
  };

  const updateAddress = async (id: string, addressData: Tables['addresses']['Update']) => {
    const { data, error } = await supabase
      .from('addresses')
      .update(addressData)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    setAddresses(prev => prev.map(addr => addr.id === id ? data : addr));
    return data;
  };

  const deleteAddress = async (id: string) => {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;

    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  return {
    addresses,
    loading,
    error,
    addAddress,
    updateAddress,
    deleteAddress,
  };
}

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
      const { data, error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update product');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
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

// Admin-specific Categories & Departments CRUD operations
export function useAdminCategoriesDepartments() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDepartmentsWithCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          categories (
            id,
            slug,
            name,
            description,
            image,
            product_count
          )
        `)
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch departments and categories');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDepartmentById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch department');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDepartment = useCallback(async (departmentData: Tables['departments']['Insert']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('departments')
        .insert(departmentData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add department');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, departmentData: Tables['departments']['Update']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('departments')
        .update(departmentData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('departments')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete department');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategoryById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addCategory = useCallback(async (categoryData: Tables['categories']['Insert']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert(categoryData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, categoryData: Tables['categories']['Update']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('categories')
        .update(categoryData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllDepartmentsWithCategories,
    fetchDepartmentById,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    fetchCategoryById,
    addCategory,
    updateCategory,
    deleteCategory,
  };
}

// Admin-specific Orders CRUD operations
export function useAdminOrders() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*),
          order_items (
            *,
            products (name, images),
            product_variants (name)
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          shipping_address:addresses!orders_shipping_address_id_fkey(*),
          billing_address:addresses!orders_billing_address_id_fkey(*),
          order_items (
            *,
            products (name, images),
            product_variants (name)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Tables['orders']['Update']['status']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllOrders,
    fetchOrderById,
    updateOrderStatus,
  };
}

// Admin-specific Users CRUD operations
export function useAdminUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllUserProfiles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`*`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profiles');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserProfileById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`*`)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserProfile = useCallback(async (id: string, profileData: Tables['user_profiles']['Update']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .update(profileData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllUserProfiles,
    fetchUserProfileById,
    updateUserProfile,
  };
}

// Admin-specific DIY Articles CRUD operations
export function useAdminDIYArticles() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllDIYArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('diy_articles')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DIY articles');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDIYArticleById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('diy_articles')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch DIY article');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addDIYArticle = useCallback(async (articleData: Tables['diy_articles']['Insert']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('diy_articles')
        .insert(articleData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add DIY article');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDIYArticle = useCallback(async (id: string, articleData: Tables['diy_articles']['Update']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('diy_articles')
        .update(articleData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update DIY article');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteDIYArticle = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('diy_articles')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete DIY article');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllDIYArticles,
    fetchDIYArticleById,
    addDIYArticle,
    updateDIYArticle,
    deleteDIYArticle,
  };
}

// Admin-specific Services CRUD operations
export function useAdminServices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServiceById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch service');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addService = useCallback(async (serviceData: Tables['services']['Insert']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('services')
        .insert(serviceData)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add service');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateService = useCallback(async (id: string, serviceData: Tables['services']['Update']) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('services')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update service');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteService = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete service');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchAllServices,
    fetchServiceById,
    addService,
    updateService,
    deleteService,
  };
}

// New hook for fetching a single DIY article by slug
export function useDIYArticleBySlug(slug: string) {
  const [article, setArticle] = useState<Tables['diy_articles']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchArticle() {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('diy_articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'DIY article not found');
      } finally {
        setLoading(false);
      }
    }
    fetchArticle();
  }, [slug]);

  return { article, loading, error };
}

// New hook for fetching a single Service by slug
export function useServiceBySlug(slug: string) {
  const [service, setService] = useState<Tables['services']['Row'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchService() {
      if (!slug) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setService(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Service not found');
      } finally {
        setLoading(false);
      }
    }
    fetchService();
  }, [slug]);

  return { service, loading, error };
}

// New hook for user wishlist items
export function useWishlist(userId: string | null) {
  const [wishlistItems, setWishlistItems] = useState<Tables['wishlist']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWishlistItems() {
      if (!userId) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('wishlist')
          .select(
            `
            *,
            products (
              id,
              name,
              price,
              images,
              slug,
              stock
            )
          `
          )
          .eq('user_id', userId);

        if (error) throw error;
        setWishlistItems(data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wishlist');
      } finally {
        setLoading(false);
      }
    }

    fetchWishlistItems();
  }, [userId]);

  const addToWishlist = async (productId: string) => {
    if (!userId) {
      setError('User must be logged in to add to wishlist');
      return;
    }
    setError(null); // Clear previous errors

    try {
      // Check if item already exists in wishlist to prevent duplicates
      const { data: existingItem, error: selectError } = await supabase
        .from('wishlist')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .maybeSingle(); // Use maybeSingle() here

      if (selectError) { // If maybeSingle() returns an error, it's a real query error
        throw selectError;
      }

      if (existingItem) {
        console.log('Product already in wishlist:', productId);
        return; // Item already exists, do nothing
      }

      // If no existing item, proceed with insert
      const { data, error: insertError } = await supabase
        .from('wishlist')
        .insert({ user_id: userId, product_id: productId })
        .select(
          `
          *,
          products (
            id,
            name,
            price,
            images,
            slug,
            stock
          )
        `
        )
        .single(); // Use single() here as we expect one result after insert

      if (insertError) {
        throw insertError;
      }

      setWishlistItems((prev) => [...prev, data]);
    } catch (err: any) {
      setError(err.message || 'Failed to add to wishlist');
    }
  };

  const removeFromWishlist = async (wishlistItemId: string) => {
    try {
      const { error } = await supabase
        .from('wishlist')
        .delete()
        .eq('id', wishlistItemId)
        .eq('user_id', userId); // Ensure user can only delete their own items

      if (error) throw error;

      setWishlistItems((prev) => prev.filter((item) => item.id !== wishlistItemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove from wishlist');
    }
  };

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
  };
}
