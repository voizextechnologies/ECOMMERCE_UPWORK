import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProduct } from '../../hooks/useSupabase';
import { Button } from '../../components/ui/Button';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, error } = useProduct(slug || '');
  const { addToCart, addToWishlist, state: { user }, wishlistItems } = useApp(); // Get wishlistItems
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);

  // Check if the current product is in the wishlist
  const isProductInWishlist = wishlistItems.some(item => item.product_id === product?.id);

  if (loading) {
    return (
      <div className="flex-grow container mx-auto px-4 py-8 text-center text-brown-600">
        Loading product details...
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex-grow container mx-auto px-4 py-8 text-center text-red-500">
        Error loading product or product not found: {error}
      </div>
    );
  }

   const handleAddToCart = async () => {
    console.log('handleAddToCart called');
    await addToCart(product.id, quantity, selectedVariant);
    setQuantity(1);
  };

  const handleAddToWishlist = async () => {
    if (!user) {
      alert('Please log in to add items to your wishlist.');
      return;
    }
    await addToWishlist(product.id);
    // No need for alert here, the icon change will be the feedback
  };

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const currentPrice = selectedVariant
    ? product.product_variants?.find(v => v.id === selectedVariant)?.price || product.price
    : product.price;

  const currentStock = selectedVariant
    ? product.product_variants?.find(v => v.id === selectedVariant)?.stock || product.stock
    : product.stock;

  return (
    <div className="min-h-screen bg-brown-100 flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image Gallery */}
          <div className="flex flex-col items-center">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full max-w-lg h-auto rounded-lg shadow-md object-cover"
            />
            {product.images.length > 1 && (
              <div className="flex space-x-2 mt-4 overflow-x-auto">
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`${product.name} thumbnail ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-md cursor-pointer border-2 border-brown-500 transition-colors"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-brown-900 mb-3">
              {product.name}
            </h1>
            <p className="text-brown-600 text-lg mb-4">{product.description}</p>

            <div className="flex items-center mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? 'text-brown-500 fill-current'
                        : 'text-brown-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-brown-600 ml-2">
                ({product.review_count} reviews)
              </span>
            </div>

            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-4xl font-bold text-brown-900">
                ${currentPrice.toFixed(2)}
              </span>
              {product.original_price && (
                <span className="text-brown-500 line-through text-xl">
                  ${product.original_price.toFixed(2)}
                </span>
              )}
            </div>

            {/* Variants */}
            {product.product_variants && product.product_variants.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-brown-900 mb-2">Select Variant:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.product_variants.map(variant => (
                    <Button
                      key={variant.id}
                      variant={selectedVariant === variant.id ? 'primary' : 'outline'}
                      onClick={() => setSelectedVariant(variant.id)}
                      size="sm"
                    >
                      {variant.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Stock */}
            <div className="flex items-center mb-6 space-x-4">
              <h3 className="text-lg font-semibold text-brown-900">Quantity:</h3>
              <div className="flex items-center border border-brown-300 rounded-lg">
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>
                  -
                </Button>
                <span className="px-4 text-lg font-medium text-brown-900">{quantity}</span>
                <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(1)} disabled={quantity >= currentStock}>
                  +
                </Button>
              </div>
              <span className="text-sm text-brown-600">
                Stock: {currentStock} {currentStock <= 5 && currentStock > 0 && <span className="text-orange-500">(Low Stock!)</span>}
                {currentStock === 0 && <span className="text-red-500">(Out of Stock)</span>}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 mb-6">
              <Button
                className="flex-1"
                size="lg"
                onClick={handleAddToCart}
                disabled={currentStock === 0}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Add to Cart
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleAddToWishlist}
                className={isProductInWishlist ? 'bg-red-500 text-white hover:bg-red-600 border-red-500 hover:border-red-600' : ''}
              >
                <Heart className={`w-5 h-5 ${isProductInWishlist ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Specifications */}
            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-brown-900 mb-2">Specifications:</h3>
                <ul className="list-disc list-inside text-brown-700 space-y-1">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-medium">{key}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Brand and Category */}
            <div className="text-sm text-brown-700">
              <p>
                <span className="font-semibold">Brand:</span> {product.brand}
              </p>
              <p>
                <span className="font-semibold">Category:</span> {product.categories?.name}
              </p>
              <p>
                <span className="font-semibold">Department:</span> {product.departments?.name}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

