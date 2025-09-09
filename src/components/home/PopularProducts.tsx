import React from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';
import { useProducts } from '../../hooks/useSupabase'; // Import useProducts hook
import { Link } from 'react-router-dom'; // Import Link for navigation

export function PopularProducts() {
  const { addToCart } = useApp(); // Get addToCart directly
  const { products, loading, error } = useProducts({ limit: 6 }); // Limit to 6 products and add stable options

  const handleAddToCart = async (product: any) => { // Make it async
    await addToCart(product.id, 1); // Call addToCart directly
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center text-brown-600">
          <div className="animate-pulse">
            <div className="h-8 bg-brown-200 rounded w-64 mx-auto mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-brown-100 h-64 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center text-red-500">
          Error loading popular products: {error}
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-900 mb-4">
            Popular Products
          </h2>
          <p className="text-lg text-brown-600 max-w-2xl mx-auto">
            Best-selling items trusted by professionals and DIY enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-brown-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 group"
            >
              <Link to={`/products/${product.slug}`} className="block"> {/* Wrap the entire clickable area */}
                <div className="relative">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {product.original_price && ( // Use original_price from Supabase
                    <div className="absolute top-2 left-2 bg-brown-500 text-white px-2 py-1 rounded text-sm font-medium">
                      SALE
                    </div>
                  )}
                </div>
              </Link>

              <div className="p-6">
                <div className="flex items-center mb-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(product.rating)
                            ? 'text-brown-500 fill-current'
                            : 'text-brown-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-brown-600 ml-2">
                    ({product.review_count}) {/* Use review_count from Supabase */}
                  </span>
                </div>

                <Link to={`/products/${product.slug}`}> {/* Wrap title with Link */}
                  <h3 className="text-lg font-semibold text-brown-900 mb-2 group-hover:text-brown-700 transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <p className="text-brown-600 text-sm mb-4 line-clamp-2">
                  {product.description}
                </p>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-brown-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.original_price && ( // Use original_price from Supabase
                      <span className="text-brown-500 line-through text-sm">
                        ${product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-brown-600">
                    Stock: {product.stock}
                  </span>
                </div>

                <Button
                  className="w-full"
                  onClick={() => handleAddToCart(product)} // Call the new handleAddToCart
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/shop" // Link to general shop page
            className="inline-flex items-center px-8 py-3 bg-brown-900 text-white font-medium rounded-lg hover:bg-brown-700 transition-colors duration-200"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
