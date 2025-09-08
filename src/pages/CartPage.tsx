import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShoppingCart, Plus, Minus, Trash2 } from 'lucide-react';

export function CartPage() {
  const { cartItems, removeFromCart, updateQuantity } = useApp(); // Destructure new values

  // Calculate total based on the nested product price
  const total = cartItems.reduce((sum, item) => {
    const itemPrice = item.product_variants?.price || item.products.price;
    return sum + (itemPrice * item.quantity);
  }, 0);

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">Your Shopping Cart</h1>

        {cartItems.length === 0 ? ( // Use cartItems
          <div className="flex flex-col items-center justify-center bg-white p-10 rounded-lg shadow-md">
            <ShoppingCart className="w-24 h-24 text-brown-300 mb-6" />
            <p className="text-2xl font-medium text-brown-900 mb-3">Your cart is empty</p>
            <p className="text-brown-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
            <Link to="/shop">
              <Button size="lg">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <div className="divide-y divide-brown-200">
                {cartItems.map((item) => ( // Use cartItems
                  <div key={item.id} className="flex items-center py-4"> {/* Use item.id for key */}
                    <Link to={`/products/${item.products.slug}`} className="flex-shrink-0"> {/* Access nested product slug */}
                      <img
                        src={item.products.images[0]} // Access nested product images
                        alt={item.products.name} // Access nested product name
                        className="w-24 h-24 object-cover rounded-lg border border-brown-200"
                      />
                    </Link>
                    
                    <div className="flex-1 ml-4">
                      <Link to={`/products/${item.products.slug}`}> {/* Access nested product slug */}
                        <h3 className="font-semibold text-lg text-brown-900 hover:text-brown-700 transition-colors">
                          {item.products.name} {/* Access nested product name */}
                        </h3>
                      </Link>
                      {item.product_variants && ( // Display variant name if exists
                        <p className="text-sm text-brown-600">Variant: {item.product_variants.name}</p>
                      )}
                      <p className="text-brown-700 mt-1">
                        ${(item.product_variants?.price || item.products.price).toFixed(2)} each {/* Use variant price if available, else product price */}
                      </p>
                      
                      <div className="flex items-center mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} // Use updateQuantity
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="mx-4 text-lg font-medium text-brown-900">
                          {item.quantity}
                        </span>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} // Use updateQuantity
                        >
                          <Plus className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)} // Use removeFromCart
                          className="ml-6 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-5 h-5 mr-1" /> Remove
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-brown-900">
                        ${((item.product_variants?.price || item.products.price) * item.quantity).toFixed(2)} {/* Use variant price if available, else product price */}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit sticky top-8">
              <h2 className="text-2xl font-bold text-brown-900 mb-6">Order Summary</h2>
              
              <div className="flex justify-between items-center text-lg text-brown-700 mb-3">
                <span>Subtotal ({cartItems.length} items)</span> {/* Use cartItems */}
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-center text-lg text-brown-700 mb-6">
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              
              <div className="flex justify-between items-center text-2xl font-bold text-brown-900 border-t border-brown-200 pt-4">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <Link to="/checkout"> {/* Placeholder for checkout page */}
                <Button className="w-full mt-6" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
