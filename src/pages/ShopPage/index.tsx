import React from 'react';
import { ShopSearchBar } from '../../components/shop/ShopSearchBar';
import { ShopFilters } from '../../components/shop/ShopFilters';
import { ProductListing } from '../../components/shop/ProductListing';
import { ShopPagination } from '../../components/shop/ShopPagination';

export function ShopPage() {
  // Define itemsPerPage here or pass it as a prop if it needs to be dynamic
  const itemsPerPage = 9; // Example: 9 products per page

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
            <ShopPagination totalCount={/* This will be passed from ProductListing or a parent component */ 0} itemsPerPage={itemsPerPage} />
          </section>
        </div>
      </main>
    </div>
  );
}
