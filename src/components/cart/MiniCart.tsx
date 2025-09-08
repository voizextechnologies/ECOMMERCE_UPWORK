import React from 'react';
import { X, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';

export function MiniCart() {
  const { state, dispatch } = useApp();

  if (!state.isCartOpen) return null;

  const total = state.cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => dispatch({ type: 'CLOSE_CART' })} />
      
      <div className="absolute right-0 top-0 h-full w-96 max-w-full bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-brown-200">
            <div className="flex items-center">
              <ShoppingCart className="w-5 h-5 text-brown-900 mr-2" />
              <h2 className="text-lg font-semibold text-brown-900">
                Shopping Cart ({state.cart.length})
              </h2>
            </div>
            <button
              onClick={() => dispatch({ type: 'CLOSE_CART' })}
              className="p-1 hover:bg-brown-100 rounded"
            >
              <X className="w-5 h-5 text-brown-600" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {state.cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-brown-600">
                <ShoppingCart className="w-16 h-16 text-brown-300 mb-4" />
                <p className="text-lg font-medium mb-2">Your cart is empty</p>
                <p className="text-sm">Add some products to get started</p>
              </div>
            ) : (
              <div className="p-6">
                {state.cart.map((item) => (
                  <div key={`${item.product.id}-${item.variant?.id || 'default'}`} className="flex items-center py-4 border-b border-brown-100 last:border-b-0">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded border border-brown-200"
                    />
                    
                    <div className="flex-1 ml-4">
                      <h3 className="font-medium text-brown-900 text-sm">
                        {item.product.name}
                      </h3>
                      <p className="text-brown-600 text-sm">
                        ${item.product.price.toFixed(2)} each
                      </p>
                      
                      <div className="flex items-center mt-2">
                        <button
                          onClick={() => dispatch({
                            type: 'UPDATE_CART_QUANTITY',
                            payload: {
                              productId: item.product.id,
                              variantId: item.variant?.id,
                              quantity: item.quantity - 1
                            }
                          })}
                          className="p-1 hover:bg-brown-100 rounded"
                        >
                          <Minus className="w-4 h-4 text-brown-600" />
                        </button>
                        
                        <span className="mx-3 text-brown-900 font-medium">
                          {item.quantity}
                        </span>
                        
                        <button
                          onClick={() => dispatch({
                            type: 'UPDATE_CART_QUANTITY',
                            payload: {
                              productId: item.product.id,
                              variantId: item.variant?.id,
                              quantity: item.quantity + 1
                            }
                          })}
                          className="p-1 hover:bg-brown-100 rounded"
                        >
                          <Plus className="w-4 h-4 text-brown-600" />
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-semibold text-brown-900">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </p>
                      <button
                        onClick={() => dispatch({
                          type: 'REMOVE_FROM_CART',
                          payload: {
                            productId: item.product.id,
                            variantId: item.variant?.id
                          }
                        })}
                        className="text-brown-500 hover:text-brown-700 text-sm mt-1"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {state.cart.length > 0 && (
            <div className="border-t border-brown-200 px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-semibold text-brown-900">Total:</span>
                <span className="text-xl font-bold text-brown-900">${total.toFixed(2)}</span>
              </div>
              
              <div className="space-y-2">
                <Link to="/cart">
                  <Button className="w-full" size="lg" onClick={() => dispatch({ type: 'CLOSE_CART' })}>
                    View Cart
                  </Button>
                </Link>
                <Button variant="secondary" className="w-full" size="lg">
                  Checkout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}