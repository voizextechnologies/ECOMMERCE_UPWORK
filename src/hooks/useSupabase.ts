// src/hooks/useSupabase.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { User } from '../types'; // Import the User interface

type Tables = Database['public']['Tables'];

interface UseProductsOptions {
  categorySlug?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('products')
          .select(
            `
            *,
            categories (
              id,
              name,
              slug
            ),
            departments (
              id,
              name,
              slug
            )
          `,
            { count: 'exact' } // Request exact count for pagination
          );

        // Apply filters
        if (options?.categorySlug) {
          query = query.eq('categories.slug', options.categorySlug);
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
  }, [
    options?.categorySlug,
    options?.searchQuery,
    options?.minPrice,
    options?.maxPrice,
    options?.brand,
    options?.limit,
    options?.offset,
  ]);

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
            categories (
              id,
              name,
              slug
            ),
            departments (
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
// src/hooks/useSupabase.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';
import { User } from '../types'; // Import the User interface

type Tables = Database['public']['Tables'];

interface UseProductsOptions {
  categorySlug?: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('products')
          .select(
            `
            *,
            categories (
              id,
              name,
              slug
            ),
            departments (
              id,
              name,
              slug
            )
          `,
            { count: 'exact' } // Request exact count for pagination
          );

        // Apply filters
        if (options?.categorySlug) {
          query = query.eq('categories.slug', options.categorySlug);
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
  }, [
    options?.categorySlug,
    options?.searchQuery,
    options?.minPrice,
    options?.maxPrice,
    options?.brand,
    options?.limit,
    options?.offset,
  ]);

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
            categories (
              id,
              name,
              slug
            ),
            departments (
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
