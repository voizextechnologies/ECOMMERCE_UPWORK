import React, { useState, useEffect } from 'react';
import { useDepartments, useProducts } from '../../hooks/useSupabase';
import { Link, useSearchParams } from 'react-router-dom';

export function ShopFilters() {
  const { departments, loading: departmentsLoading, error: departmentsError } = useDepartments();
  const [searchParams, setSearchParams] = useSearchParams();

  const [minPrice, setMinPrice] = useState<number>(
    Number(searchParams.get('minPrice')) || 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    Number(searchParams.get('maxPrice')) || 1000
  );
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    searchParams.getAll('brand')
  );

  // Fetch products to get unique brands for the brand filter
  // This is a simplified approach; for a large number of products,
  // you might want a dedicated Supabase function to get unique brands.
  const { products: allProducts, loading: productsLoading, error: productsError } = useProducts();
  const uniqueBrands = Array.from(new Set(allProducts.map(p => p.brand))).filter(Boolean) as string[];

  useEffect(() => {
    setMinPrice(Number(searchParams.get('minPrice')) || 0);
    setMaxPrice(Number(searchParams.get('maxPrice')) || 1000);
    setSelectedBrands(searchParams.getAll('brand'));
  }, [searchParams]);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (e.target.id === 'minPrice') {
      setMinPrice(value);
    } else {
      setMaxPrice(value);
    }
  };

  const handleBrandChange = (brand: string, isChecked: boolean) => {
    setSelectedBrands(prev => {
      if (isChecked) {
        return [...prev, brand];
      } else {
        return prev.filter(b => b !== brand);
      }
    });
  };

  const applyFilters = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('page'); // Reset page when filters change

    if (minPrice > 0) {
      newSearchParams.set('minPrice', minPrice.toString());
    } else {
      newSearchParams.delete('minPrice');
    }

    if (maxPrice < 1000) {
      newSearchParams.set('maxPrice', maxPrice.toString());
    } else {
      newSearchParams.delete('maxPrice');
    }

    newSearchParams.delete('brand');
    selectedBrands.forEach(brand => newSearchParams.append('brand', brand));

    setSearchParams(newSearchParams);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-brown-900 mb-4">Filters</h2>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-brown-700 mb-3">Category</h3>
        {departmentsLoading ? (
          <p className="text-brown-600">Loading categories...</p>
        ) : departmentsError ? (
          <p className="text-red-500">Error loading categories: {departmentsError}</p>
        ) : (
          <ul className="space-y-2 text-brown-600">
            <li>
              <Link
                to="/shop"
                className={`hover:text-brown-900 ${!searchParams.get('category') ? 'font-bold text-brown-900' : ''}`}
                onClick={() => {
                  const newSearchParams = new URLSearchParams(searchParams.toString());
                  newSearchParams.delete('category');
                  newSearchParams.delete('page');
                  setSearchParams(newSearchParams);
                }}
              >
                All Categories
              </Link>
            </li>
            {departments.map((department) => (
              <React.Fragment key={department.id}>
                {department.categories && department.categories.map((category) => (
                  <li key={category.id}>
                    <Link
                      to={`/shop?category=${category.slug}`}
                      className={`hover:text-brown-900 ${searchParams.get('category') === category.slug ? 'font-bold text-brown-900' : ''}`}
                      onClick={() => {
                        const newSearchParams = new URLSearchParams(searchParams.toString());
                        newSearchParams.set('category', category.slug);
                        newSearchParams.delete('page');
                        setSearchParams(newSearchParams);
                      }}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-brown-700 mb-3">Price Range</h3>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="number"
            id="minPrice"
            value={minPrice}
            onChange={handlePriceChange}
            className="w-1/2 px-2 py-1 border border-brown-300 rounded text-sm"
          />
          <span>-</span>
          <input
            type="number"
            id="maxPrice"
            value={maxPrice}
            onChange={handlePriceChange}
            className="w-1/2 px-2 py-1 border border-brown-300 rounded text-sm"
          />
        </div>
        <input
          type="range"
          min="0"
          max="1000"
          value={minPrice}
          onChange={handlePriceChange}
          id="minPriceSlider"
          className="w-full h-2 bg-brown-200 rounded-lg appearance-none cursor-pointer mb-2"
        />
        <input
          type="range"
          min="0"
          max="1000"
          value={maxPrice}
          onChange={handlePriceChange}
          id="maxPriceSlider"
          className="w-full h-2 bg-brown-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-brown-600 mt-2">
          <span>${minPrice}</span>
          <span>${maxPrice}+</span>
        </div>
      </div>

      {/* Brand Filter */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-brown-700 mb-3">Brand</h3>
        {productsLoading ? (
          <p className="text-brown-600">Loading brands...</p>
        ) : productsError ? (
          <p className="text-red-500">Error loading brands: {productsError}</p>
        ) : (
          <div className="space-y-2">
            {uniqueBrands.map((brand) => (
              <label key={brand} className="flex items-center text-brown-600">
                <input
                  type="checkbox"
                  className="form-checkbox text-brown-500 rounded"
                  checked={selectedBrands.includes(brand)}
                  onChange={(e) => handleBrandChange(brand, e.target.checked)}
                />
                <span className="ml-2">{brand}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Apply Filters Button */}
      <button
        onClick={applyFilters}
        className="w-full bg-brown-900 text-white py-2 rounded-lg hover:bg-brown-700 transition-colors"
      >
        Apply Filters
      </button>
    </div>
  );
}
