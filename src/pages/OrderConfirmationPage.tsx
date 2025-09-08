// src/pages/OrderConfirmationPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-brown-100 flex items-center justify-center py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md w-full">
        <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-brown-900 mb-4">Order Confirmed!</h1>
        <p className="text-lg text-brown-700 mb-6">
          Thank you for your purchase. Your order has been successfully placed and will be processed shortly.
        </p>
        <p className="text-brown-600 mb-8">
          You will receive an email confirmation with your order details.
        </p>
        <div className="space-y-4">
          <Link to="/account">
            <Button className="w-full" size="lg">
              View My Orders
            </Button>
          </Link>
          <Link to="/shop">
            <Button variant="outline" className="w-full" size="lg">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
