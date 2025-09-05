import React from 'react';
import { Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-brown-900 text-brown-100">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">BuildMart</h3>
            <p className="text-brown-300 mb-4">
              Your trusted partner for all building, hardware, and home improvement needs.
            </p>
            <div className="flex space-x-4">
              <Facebook className="w-5 h-5 text-brown-300 hover:text-white cursor-pointer" />
              <Instagram className="w-5 h-5 text-brown-300 hover:text-white cursor-pointer" />
              <Youtube className="w-5 h-5 text-brown-300 hover:text-white cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-brown-300">
              <li><a href="/our-range" className="hover:text-white transition-colors">Our Range</a></li>
              <li><a href="/services" className="hover:text-white transition-colors">Services</a></li>
              <li><a href="/diy-advice" className="hover:text-white transition-colors">DIY Advice</a></li>
              <li><a href="/find-a-store" className="hover:text-white transition-colors">Find a Store</a></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-white font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-brown-300">
              <li><a href="/my-account" className="hover:text-white transition-colors">My Account</a></li>
              <li><a href="/cart" className="hover:text-white transition-colors">Shopping Cart</a></li>
              <li><a href="/checkout" className="hover:text-white transition-colors">Checkout</a></li>
              <li><a href="/help" className="hover:text-white transition-colors">Help & Support</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3 text-brown-300">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>1800-HARDWARE</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@buildmart.com</span>
              </div>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <span>123 Builder Street, Hardware City</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-brown-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-brown-300 text-sm">
            © 2024 BuildMart. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-brown-300">
            <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="/returns" className="hover:text-white transition-colors">Returns</a>
          </div>
        </div>
      </div>
    </footer>
  );
}