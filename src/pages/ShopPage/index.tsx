import React from 'react';
import { ShopSearchBar } from '../../components/shop/ShopSearchBar';
import { ShopFilters } from '../../components/shop/ShopFilters';
import { ProductListing } from '../../components/shop/ProductListing';
import { ShopPagination } from '../../components/shop/ShopPagination';
import { useProducts } from '../../hooks/useSupabase';
import { useSearchParams } from 'react-router-dom';

export function ShopPage() {
  const [searchParams] = useSearchParams();
  const itemsPerPage = 9;
  
  const categorySlug = searchParams.get('category') || undefined;
  const searchQuery = searchParams.get('search') || undefined;
  const minPrice = Number(searchParams.get('minPrice')) || undefined;
  const maxPrice = Number(searchParams.get('maxPrice')) || undefined;
  const brands = searchParams.getAll('brand');
  const currentPage = Number(searchParams.get('page')) || 1;
  const offset = (currentPage - 1) * itemsPerPage;

  const { totalCount } = useProducts({
    categorySlug,
    searchQuery,
    minPrice,
    maxPrice,
    brand: brands.length > 0 ? brands[0] : undefined,
    limit: itemsPerPage,
    offset,
  });

  return (
    <div className="min-h-screen bg-brown-100">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-brown-900 mb-8">Our Product Range</h1>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="lg:col-span-1">
            <ShopFilters />
          </aside>
          <section className="lg:col-span-3">
            <ShopSearchBar />
            <ProductListing itemsPerPage={itemsPerPage} />
            <ShopPagination totalCount={totalCount} itemsPerPage={itemsPerPage} />
          </section>
        </div>
      </main>
    </div>
  );
}