import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Package, MapPin, Truck, Calendar } from 'lucide-react';

export function SellerOrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const [trackingNumber, setTrackingNumber] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('');
  const [estimatedDeliveryDate, setEstimatedDeliveryDate] = useState('');

  useEffect(() => {
    fetchOrderDetails();
    fetchCarriers();
  }, [id]);

  const fetchCarriers = async () => {
    const { data, error } = await supabase
      .from('carriers')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (!error && data) {
      setCarriers(data);
    }
  };

  const fetchOrderDetails = async () => {
    if (!id || !user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            *,
            products (id, name, images, seller_id),
            product_variants (id, name)
          ),
          shipping_address:addresses!orders_shipping_address_id_fkey (*),
          billing_address:addresses!orders_billing_address_id_fkey (*)
        `)
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      const sellerItems = orderData.order_items.filter(
        (item: any) => item.products?.seller_id === user.id
      );

      if (sellerItems.length === 0) {
        throw new Error('You do not have permission to view this order');
      }

      setOrder({ ...orderData, order_items: sellerItems });
      setTrackingNumber(orderData.tracking_number || '');
      setSelectedCarrier(orderData.carrier || '');
      setEstimatedDeliveryDate(
        orderData.estimated_delivery_date
          ? new Date(orderData.estimated_delivery_date).toISOString().split('T')[0]
          : ''
      );
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateShipping = async () => {
    if (!id) return;

    setUpdateLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          carrier: selectedCarrier,
          estimated_delivery_date: estimatedDeliveryDate || null,
          status: order.status === 'pending' ? 'processing' : order.status,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      if (trackingNumber && selectedCarrier) {
        await supabase.from('order_tracking_events').insert({
          order_id: id,
          event_type: 'in_transit',
          event_description: `Shipment in transit with ${selectedCarrier}. Tracking: ${trackingNumber}`,
          created_by: user?.id,
        });
      }

      alert('Shipping information updated successfully!');
      fetchOrderDetails();
    } catch (err: any) {
      alert(`Failed to update shipping: ${err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleMarkAsShipped = async () => {
    if (!id) return;

    setUpdateLoading(true);
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', id);

      if (updateError) throw updateError;

      await supabase.from('order_tracking_events').insert({
        order_id: id,
        event_type: 'in_transit',
        event_description: 'Order has been shipped',
        created_by: user?.id,
      });

      alert('Order marked as shipped!');
      fetchOrderDetails();
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading order details...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">Error: {error}</p>
        <Button onClick={() => navigate('/seller/orders')}>Back to Orders</Button>
      </div>
    );
  }

  if (!order) {
    return <div className="text-center py-8">Order not found</div>;
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => navigate('/seller/orders')}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
      </Button>

      <h2 className="text-3xl font-bold text-brown-900">Order #{order.order_number}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-brown-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2" /> Your Items in This Order
            </h3>
            <div className="divide-y divide-gray-200">
              {order.order_items.map((item: any) => (
                <div key={item.id} className="flex items-center py-4">
                  <img
                    src={item.products?.images[0] || 'https://via.placeholder.com/80'}
                    alt={item.products?.name}
                    className="w-20 h-20 object-cover rounded-lg border border-brown-200"
                  />
                  <div className="flex-1 ml-4">
                    <h4 className="font-semibold text-lg text-brown-900">
                      {item.products?.name}
                    </h4>
                    {item.product_variants && (
                      <p className="text-sm text-brown-600">Variant: {item.product_variants.name}</p>
                    )}
                    <p className="text-brown-700 mt-1">
                      ${item.price.toFixed(2)} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-brown-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-brown-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" /> Shipping Address
            </h3>
            {order.shipping_address ? (
              <address className="not-italic text-brown-700">
                <p className="font-semibold">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
                <p>{order.shipping_address.address1}</p>
                {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
                <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postcode}</p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
              </address>
            ) : (
              <p className="text-gray-500">No shipping address available</p>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-brown-900 mb-4">Order Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                  order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                  order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-medium">{new Date(order.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery Method:</span>
                <span className="font-medium capitalize">{order.delivery_type || 'standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fulfillment:</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  order.fulfillment_method === 'platform' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                }`}>
                  {order.fulfillment_method === 'platform' ? 'Platform' : 'Self'}
                </span>
              </div>
            </div>
          </div>

          {order.fulfillment_method === 'self' && (
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold text-brown-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2" /> Shipping Management
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tracking Number
                  </label>
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number"
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carrier
                  </label>
                  <select
                    value={selectedCarrier}
                    onChange={(e) => setSelectedCarrier(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  >
                    <option value="">Select carrier</option>
                    {carriers.map((carrier) => (
                      <option key={carrier.id} value={carrier.code}>
                        {carrier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" /> Estimated Delivery Date
                  </label>
                  <input
                    type="date"
                    value={estimatedDeliveryDate}
                    onChange={(e) => setEstimatedDeliveryDate(e.target.value)}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  />
                </div>

                <Button
                  onClick={handleUpdateShipping}
                  disabled={updateLoading}
                  className="w-full"
                >
                  {updateLoading ? 'Updating...' : 'Update Shipping Info'}
                </Button>

                {order.status !== 'shipped' && order.status !== 'delivered' && (
                  <Button
                    onClick={handleMarkAsShipped}
                    disabled={updateLoading}
                    className="w-full"
                    variant="outline"
                  >
                    {updateLoading ? 'Updating...' : 'Mark as Shipped'}
                  </Button>
                )}
              </div>
            </div>
          )}

          {order.fulfillment_method === 'platform' && (
            <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4">
              <p className="font-bold">Platform Fulfilled</p>
              <p className="text-sm mt-1">
                This order is fulfilled by the platform. Shipping is managed automatically.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
