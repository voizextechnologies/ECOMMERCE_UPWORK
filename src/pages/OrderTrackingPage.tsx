import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { supabase } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Package, Truck, CheckCircle, MapPin, Calendar, ExternalLink } from 'lucide-react';

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state: { user } } = useApp();
  const [order, setOrder] = useState<any>(null);
  const [trackingEvents, setTrackingEvents] = useState<any[]>([]);
  const [carrier, setCarrier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderTracking();
  }, [id]);

  const fetchOrderTracking = async () => {
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
            products (id, name, images),
            product_variants (id, name)
          ),
          shipping_address:addresses!orders_shipping_address_id_fkey (*)
        `)
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (orderError) throw orderError;

      setOrder(orderData);

      if (orderData.carrier) {
        const { data: carrierData } = await supabase
          .from('carriers')
          .select('*')
          .eq('code', orderData.carrier)
          .maybeSingle();

        if (carrierData) {
          setCarrier(carrierData);
        }
      }

      const { data: eventsData, error: eventsError } = await supabase
        .from('order_tracking_events')
        .select('*')
        .eq('order_id', id)
        .order('created_at', { ascending: false });

      if (!eventsError && eventsData) {
        setTrackingEvents(eventsData);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching order tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTrackingUrl = () => {
    if (!carrier?.tracking_url_template || !order?.tracking_number) return null;
    return carrier.tracking_url_template.replace('{tracking_number}', order.tracking_number);
  };

  const getStatusIcon = (eventType: string) => {
    switch (eventType) {
      case 'delivered':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'in_transit':
      case 'out_for_delivery':
        return <Truck className="w-6 h-6 text-blue-600" />;
      case 'processing':
      case 'picked':
        return <Package className="w-6 h-6 text-yellow-600" />;
      default:
        return <Package className="w-6 h-6 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading order tracking...</div>;
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error || 'Order not found'}</p>
          <Button onClick={() => navigate('/account')}>Back to Account</Button>
        </div>
      </div>
    );
  }

  const trackingUrl = getTrackingUrl();

  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button variant="outline" onClick={() => navigate('/account')} className="mb-6">
          Back to Account
        </Button>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-brown-900">Order #{order.order_number}</h1>
              <p className="text-gray-600 mt-1">Placed on {new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm text-gray-600">Delivery Type</p>
              <p className="font-semibold text-brown-900 capitalize">{order.delivery_type || 'standard'}</p>
            </div>
            {order.tracking_number && (
              <div>
                <p className="text-sm text-gray-600">Tracking Number</p>
                <p className="font-semibold text-brown-900">{order.tracking_number}</p>
              </div>
            )}
            {order.carrier && carrier && (
              <div>
                <p className="text-sm text-gray-600">Carrier</p>
                <p className="font-semibold text-brown-900">{carrier.name}</p>
              </div>
            )}
            {order.estimated_delivery_date && (
              <div>
                <p className="text-sm text-gray-600 flex items-center">
                  <Calendar className="w-4 h-4 mr-1" /> Estimated Delivery
                </p>
                <p className="font-semibold text-brown-900">
                  {new Date(order.estimated_delivery_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-brown-600 hover:text-brown-800 font-medium mb-6"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Track on {carrier?.name} website
            </a>
          )}
        </div>

        {trackingEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-6">Tracking Timeline</h2>
            <div className="space-y-6">
              {trackingEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    {getStatusIcon(event.event_type)}
                    {index < trackingEvents.length - 1 && (
                      <div className="w-0.5 h-16 bg-gray-300 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <h3 className="font-semibold text-brown-900 capitalize">
                      {event.event_type.replace(/_/g, ' ')}
                    </h3>
                    {event.event_description && (
                      <p className="text-gray-700 mt-1">{event.event_description}</p>
                    )}
                    {event.location && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center">
                        <MapPin className="w-4 h-4 mr-1" /> {event.location}
                      </p>
                    )}
                    <p className="text-sm text-gray-500 mt-2">
                      {new Date(event.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-brown-900 mb-4">Order Items</h2>
          <div className="divide-y divide-gray-200">
            {order.order_items.map((item: any) => (
              <div key={item.id} className="flex items-center py-4">
                <img
                  src={item.products?.images[0] || 'https://via.placeholder.com/80'}
                  alt={item.products?.name}
                  className="w-20 h-20 object-cover rounded-lg border border-brown-200"
                />
                <div className="flex-1 ml-4">
                  <h3 className="font-semibold text-lg text-brown-900">
                    {item.products?.name}
                  </h3>
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
          <div className="border-t border-gray-200 mt-4 pt-4">
            <div className="flex justify-between text-2xl font-bold text-brown-900">
              <span>Order Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {order.shipping_address && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-brown-900 mb-4 flex items-center">
              <MapPin className="w-6 h-6 mr-2" /> Shipping Address
            </h2>
            <address className="not-italic text-brown-700">
              <p className="font-semibold">{order.shipping_address.first_name} {order.shipping_address.last_name}</p>
              <p>{order.shipping_address.address1}</p>
              {order.shipping_address.address2 && <p>{order.shipping_address.address2}</p>}
              <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postcode}</p>
              <p>{order.shipping_address.country}</p>
              {order.shipping_address.phone && <p>Phone: {order.shipping_address.phone}</p>}
            </address>
          </div>
        )}
      </div>
    </div>
  );
}
