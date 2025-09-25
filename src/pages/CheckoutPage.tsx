import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { useAddresses } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';
import { AddressForm } from '../components/account/AddressForm';
import { AddressList } from '../components/account/AddressList';
import { MapPin, Package, CreditCard } from 'lucide-react';
import { Address } from '../types';
import { loadStripe } from '@stripe/stripe-js';
import { supabase } from '../lib/supabase';

export function CheckoutPage() {
  const { cartItems, cartLoading, cartError, closeCart, state: { user } } = useApp();
  const { addresses, loading: addressesLoading, error: addressesError } = useAddresses(user?.id || null);
  const navigate = useNavigate();

  const [selectedShippingAddressId, setSelectedShippingAddressId] = useState<string | null>(null);
  const [selectedBillingAddressId, setSelectedBillingAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formAddressType, setFormAddressType] = useState<'shipping' | 'billing'>('shipping');
  const [processingCheckout, setProcessingCheckout] = useState(false);

  // State for calculated totals
  const [calculatedSubtotal, setCalculatedSubtotal] = useState('0.00');
  const [calculatedTax, setCalculatedTax] = useState('0.00');
  const [calculatedFreight, setCalculatedFreight] = useState('0.00');
  const [calculatedGrandTotal, setCalculatedGrandTotal] = useState('0.00');
  const [calculationLoading, setCalculationLoading] = useState(false);
  const [calculationError, setCalculationError] = useState<string | null>(null);

  useEffect(() => {
    if (!cartLoading && cartItems.length === 0) {
      navigate('/cart');
    }
  }, [cartItems, cartLoading, navigate]);

  useEffect(() => {
    if (!addressesLoading && addresses.length > 0) {
      const defaultShipping = addresses.find(addr => addr.type === 'shipping');
      const defaultBilling = addresses.find(addr => addr.type === 'billing');
      if (defaultShipping) setSelectedShippingAddressId(defaultShipping.id);
      if (defaultBilling) setSelectedBillingAddressId(defaultBilling.id);
    }
  }, [addresses, addressesLoading]);

  // Function to calculate totals using Edge Function
  const calculateTotals = useCallback(async () => {
    if (!selectedShippingAddressId || cartItems.length === 0) {
      setCalculatedSubtotal('0.00');
      setCalculatedTax('0.00');
      setCalculatedFreight('0.00');
      setCalculatedGrandTotal('0.00');
      setCalculationError(null);
      return;
    }

    setCalculationLoading(true);
    setCalculationError(null);

    const shippingAddr = addresses.find(addr => addr.id === selectedShippingAddressId);
    if (!shippingAddr) {
      setCalculationError('Shipping address not found.');
      setCalculationLoading(false);
      return;
    }

    const itemsForCalculation = cartItems.map(item => ({
      product_id: item.product_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
    }));

    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/calculate-order-total`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          items: itemsForCalculation,
          shippingAddress: {
            country: shippingAddr.country,
            state: shippingAddr.state,
            postcode: shippingAddr.postcode,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Calculation failed: ${errorData.error}`);
      }

      const data = await response.json();
      setCalculatedSubtotal(data.subtotal);
      setCalculatedTax(data.totalTax);
      setCalculatedFreight(data.totalFreight);
      setCalculatedGrandTotal(data.grandTotal);

    } catch (err: any) {
      setCalculationError(err.message || 'Failed to calculate totals.');
      console.error('Error calculating totals:', err);
    } finally {
      setCalculationLoading(false);
    }
  }, [cartItems, selectedShippingAddressId, addresses]);

  // Recalculate totals when cart items or selected shipping address changes
  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const handleAddAddress = (type: 'shipping' | 'billing') => {
    setEditingAddress(null);
    setFormAddressType(type);
    setShowAddressForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setFormAddressType(address.type);
    setShowAddressForm(true);
  };

  const handleFormSuccess = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleFormCancel = () => {
    setShowAddressForm(false);
    setEditingAddress(null);
  };

  const handleProceedToPayment = async () => {
    if (!selectedShippingAddressId || !selectedBillingAddressId) {
      alert('Please select both shipping and billing addresses.');
      return;
    }
    if (!user?.id) {
      alert('User not logged in. Please log in to proceed.');
      return;
    }
    if (cartItems.length === 0) {
      alert('Your cart is empty. Please add items to your cart.');
      navigate('/cart');
      return;
    }

    setProcessingCheckout(true);

    try {
      // 1. Create a new order in Supabase with 'pending' status
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          order_number: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          status: 'pending',
          total: parseFloat(calculatedGrandTotal),
          shipping_address_id: selectedShippingAddressId,
          billing_address_id: selectedBillingAddressId,
          delivery_method: 'shipping',
        })
        .select('id')
        .single();

      if (orderError || !newOrder) {
        throw new Error(`Failed to create order: ${orderError?.message}`);
      }

      // 2. Add order items
      const orderItemsToInsert = cartItems.map(item => ({
        order_id: newOrder.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        price: item.product_variants?.price || item.products.price,
      }));

      const { error: orderItemsError } = await supabase
        .from('order_items')
        .insert(orderItemsToInsert);

      if (orderItemsError) {
        throw new Error(`Failed to create order items: ${orderItemsError.message}`);
      }

      // 3. Call Supabase Edge Function to create Stripe Checkout Session
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          orderId: newOrder.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create Stripe Checkout session: ${errorData.error}`);
      }

      const { sessionId } = await response.json();

      // 4. Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
      if (stripe) {
        const { error: stripeRedirectError } = await stripe.redirectToCheckout({ sessionId });
        if (stripeRedirectError) {
          throw new Error(`Stripe redirect error: ${stripeRedirectError.message}`);
        }
      } else {
        throw new Error('Stripe.js failed to load.');
      }

    } catch (error: any) {
      console.error('Checkout process failed:', error);
      alert(`Failed to proceed to payment: ${error.message}`);
    } finally {
      setProcessingCheckout(false);
    }
  };

  if (cartLoading || addressesLoading || processingCheckout) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brown-600">
        {processingCheckout ? 'Processing checkout...' : 'Loading checkout details...'}
      </div>
    );
  }

  if (cartError || addressesError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {cartError || addressesError}
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center text-brown-600">
        Your cart is empty. <Link to="/shop" className="text-brown-700 hover:underline ml-2">Go to shop</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brown-900 mb-6 flex items-center">
              <Package className="w-6 h-6 mr-3" /> Order Summary
            </h2>
            <div className="divide-y divide-brown-200">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center py-4">
                  <img
                    src={item.products.images[0] || 'https://placehold.co/80?text=Product'}
                    alt={item.products.name}
                    className="w-20 h-20 object-cover rounded-lg border border-brown-200"
                  />
                  <div className="flex-1 ml-4">
                    <h3 className="font-semibold text-lg text-brown-900">
                      {item.products.name}
                    </h3>
                    {item.product_variants && (
                      <p className="text-sm text-brown-600">Variant: {item.product_variants.name}</p>
                    )}
                    <p className="text-brown-700 mt-1">
                      {"$" + (item.product_variants?.price || item.products.price).toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brown-900">
                      {"$" + ((item.product_variants?.price || item.products.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center text-lg text-brown-700 mt-6">
              <span>Subtotal ({cartItems.length} items)</span>
              <span>{"$" + calculatedSubtotal}</span>
            </div>
            <div className="flex justify-between items-center text-lg text-brown-700 mb-3">
              <span>Shipping</span>
              {calculationLoading ? (
                <span>Calculating...</span>
              ) : calculationError ? (
                <span className="text-red-500">{calculationError}</span>
              ) : (
                <span>{"$" + calculatedFreight}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-lg text-brown-700 mb-6">
              <span>Tax</span>
              {calculationLoading ? (
                <span>Calculating...</span>
              ) : calculationError ? (
                <span className="text-red-500">{calculationError}</span>
              ) : (
                <span>{"$" + calculatedTax}</span>
              )}
            </div>
            <div className="flex justify-between items-center text-2xl font-bold text-brown-900 border-t border-brown-200 pt-4">
              <span>Total</span>
              <span>{"$" + calculatedGrandTotal}</span>
            </div>
          </div>

          {/* Shipping & Billing Addresses */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit sticky top-8">
            <h2 className="text-2xl font-bold text-brown-900 mb-6 flex items-center">
              <MapPin className="w-6 h-6 mr-3" /> Shipping & Billing
            </h2>

            {showAddressForm ? (
              <>
                <h3 className="text-xl font-semibold text-brown-900 mb-4">
                  {editingAddress ? 'Edit Address' : `Add New ${formAddressType === 'shipping' ? 'Shipping' : 'Billing'} Address`}
                </h3>
                <AddressForm
                  initialData={editingAddress}
                  onSuccess={handleFormSuccess}
                  onCancel={handleFormCancel}
                />
              </>
            ) : (
              <div className="space-y-6">
                {/* Shipping Address Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-brown-900">Shipping Address</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddAddress('shipping')}>
                      Add New
                    </Button>
                  </div>
                  {addresses.filter(addr => addr.type === 'shipping').length > 0 ? (
                    <div className="space-y-3">
                      {addresses.filter(addr => addr.type === 'shipping').map(addr => (
                        <div
                          key={addr.id}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            selectedShippingAddressId === addr.id ? 'border-brown-500 ring-2 ring-brown-500' : 'border-brown-200'
                          }`}
                          onClick={() => setSelectedShippingAddressId(addr.id)}
                        >
                          <p className="font-medium text-brown-900">{addr.first_name} {addr.last_name}</p>
                          <p className="text-sm text-brown-600">{addr.address1}, {addr.city}, {addr.state} {addr.postcode}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}>Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brown-600">No shipping addresses found. Please add one.</p>
                  )}
                </div>

                {/* Billing Address Selection */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xl font-semibold text-brown-900">Billing Address</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddAddress('billing')}>
                      Add New
                    </Button>
                  </div>
                  {addresses.filter(addr => addr.type === 'billing').length > 0 ? (
                    <div className="space-y-3">
                      {addresses.filter(addr => addr.type === 'billing').map(addr => (
                        <div
                          key={addr.id}
                          className={`p-4 border rounded-lg cursor-pointer ${
                            selectedBillingAddressId === addr.id ? 'border-brown-500 ring-2 ring-brown-500' : 'border-brown-200'
                          }`}
                          onClick={() => setSelectedBillingAddressId(addr.id)}
                        >
                          <p className="font-medium text-brown-900">{addr.first_name} {addr.last_name}</p>
                          <p className="text-sm text-brown-600">{addr.address1}, {addr.city}, {addr.state} {addr.postcode}</p>
                          <div className="flex space-x-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEditAddress(addr); }}>Edit</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-brown-600">No billing addresses found. Please add one.</p>
                  )}
                </div>

                <Button
                  className="w-full mt-6"
                  size="lg"
                  onClick={handleProceedToPayment}
                  disabled={!selectedShippingAddressId || !selectedBillingAddressId || processingCheckout || calculationLoading || !!calculationError}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  {processingCheckout ? 'Processing...' : (calculationLoading ? 'Calculating...' : 'Proceed to Payment')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
