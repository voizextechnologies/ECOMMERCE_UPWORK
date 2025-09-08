import React from 'react';
import { Search, ShoppingCart, User, Menu, Heart, MapPin } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/Button';

export function Header() {
  const { state: { user, authLoading }, cartItems, toggleCart } = useApp(); // Destructure new values
  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0); // Use cartItems

  return (
    <header className="bg-brown-900 text-brown-100 shadow-lg">
      {/* Top bar */}
      <div className="bg-brown-500 text-brown-900">
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Find a Store
              </span>
              <span>📞 1800-HARDWARE</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Free shipping on orders over $99</span>
              <span>|</span>
              <span>Price match guarantee</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-brown-100 hover:text-brown-500"
              onClick={toggleCart} // Use toggleCart
            >
              <Menu className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl font-bold text-brown-100">
              BuildMart
            </h1>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for tools, materials, and more..."
                className="w-full px-4 py-2 pl-12 rounded-lg text-brown-900 focus:outline-none focus:ring-2 focus:ring-brown-500"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-500 w-5 h-5" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex">
              <Heart className="w-5 h-5" />
              <span className="ml-1 hidden lg:inline">Wishlist</span>
            </Button>
            
            {/* Conditional rendering based on authLoading and user state */}
            {authLoading ? (
              <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex">
                <User className="w-5 h-5" />
                <span className="ml-1 hidden lg:inline">Loading...</span>
              </Button>
            ) : user ? (
              <a href="/account">
                <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex">
                  <User className="w-5 h-5" />
                  <span className="ml-1 hidden lg:inline">Account</span>
                </Button>
              </a>
            ) : (
              <a href="/login">
                <Button variant="ghost" size="sm" className="text-brown-100 hover:text-brown-500 hidden sm:flex">
                  <User className="w-5 h-5" />
                  <span className="ml-1 hidden lg:inline">Login</span>
                </Button>
              </a>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="text-brown-100 hover:text-brown-500 relative"
              onClick={toggleCart} // Use toggleCart
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="ml-1 hidden lg:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brown-500 text-brown-900 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 pl-12 rounded-lg text-brown-900 focus:outline-none focus:ring-2 focus:ring-500"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-brown-500 w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-brown-700 border-t border-brown-500">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-8 py-3 text-sm font-medium">
            <a href="/" className="text-brown-100 hover:text-brown-300 transition-colors">
              Home
            </a>
            <a href="/shop" className="text-brown-100 hover:text-brown-300 transition-colors"> {/* Changed href to /shop */}
              Our Range
            </a>
            <a href="/services" className="text-brown-100 hover:text-brown-300 transition-colors">
              Services
            </a>
            <a href="/diy-advice" className="text-brown-100 hover:text-brown-300 transition-colors">
              DIY Advice
            </a>
            <span className="text-brown-900 bg-brown-500 px-2 py-1 rounded text-xs font-medium">
              SALE
            </span>
          </div>
        </div>
      </nav>
    </header>
  );
}
