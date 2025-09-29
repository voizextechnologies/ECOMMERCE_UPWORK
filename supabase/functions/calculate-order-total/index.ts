import { createClient } from 'npm:@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { items, shippingAddress } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Cart items are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    let subtotal = 0;
    let totalTax = 0;
    let totalFreight = 0;
    const processedItems: any[] = [];

    // Fetch global settings for default tax rate
    const { data: globalSettings, error: globalSettingsError } = await supabaseClient
      .from('global_settings')
      .select('default_tax_rate')
      .maybeSingle();

    if (globalSettingsError) {
      console.error('Error fetching global settings:', globalSettingsError.message);
    }
    const globalDefaultTaxRate = globalSettings?.default_tax_rate || 0;

    // Group items by seller to fetch settings once per seller
    const itemsBySeller: { [sellerId: string]: any[] } = {};
    for (const item of items) {
      const { data: productData, error: productError } = await supabaseClient
        .from('products')
        .select(`
          price,
          seller_id,
          discount_type,
          discount_value,
          is_taxable,
          is_shipping_exempt,
          product_variants (id, price)
        `)
        .eq('id', item.product_id)
        .single();

      if (productError || !productData) {
        console.error('Error fetching product data:', productError?.message || 'Product not found');
        throw new Error(`Product not found for ID: ${item.product_id}`);
      }

      const sellerId = productData.seller_id;
      if (!sellerId) {
        console.warn(`Product ${item.product_id} has no seller_id. Skipping.`);
        continue;
      }

      if (!itemsBySeller[sellerId]) {
        itemsBySeller[sellerId] = [];
      }
      itemsBySeller[sellerId].push({ ...item, productData });
    }

    for (const sellerId in itemsBySeller) {
      const sellerItems = itemsBySeller[sellerId];

      // Fetch seller settings
      const { data: sellerSettings, error: settingsError } = await supabaseClient
        .from('seller_settings')
        .select('tax_rate, freight_rules')
        .eq('seller_id', sellerId)
        .maybeSingle();

      if (settingsError) {
        console.error(`Error fetching seller settings for ${sellerId}:`, settingsError.message);
      }

      // Use seller's tax rate if available, otherwise fall back to global default
      const sellerTaxRate = sellerSettings?.tax_rate !== undefined && sellerSettings.tax_rate !== null
        ? sellerSettings.tax_rate
        : globalDefaultTaxRate;

      const sellerFreightRules = sellerSettings?.freight_rules || { type: 'none' };

      let sellerSubtotal = 0;
      let sellerFreightForThisSeller = 0;
      let sellerSubtotalForFreightCalculation = 0; // Subtotal of items NOT shipping exempt
      let totalQuantityForFreightCalculation = 0; // Quantity of items NOT shipping exempt

      for (const item of sellerItems) {
        const basePrice = item.variant_id
          ? item.productData.product_variants.find((v: any) => v.id === item.variant_id)?.price || item.productData.price
          : item.productData.price;

        let effectivePrice = basePrice;

        // Apply discount
        if (item.productData.discount_type === 'percentage' && item.productData.discount_value !== null) {
          effectivePrice = basePrice * (1 - item.productData.discount_value / 100);
        } else if (item.productData.discount_type === 'flat_amount' && item.productData.discount_value !== null) {
          effectivePrice = basePrice - item.productData.discount_value;
        }
        effectivePrice = Math.max(0, effectivePrice); // Ensure price doesn't go below zero

        sellerSubtotal += effectivePrice * item.quantity;
        processedItems.push({ ...item, effectivePrice });

        // Only include items that are NOT shipping exempt in freight calculation
        if (!item.productData.is_shipping_exempt) {
          sellerSubtotalForFreightCalculation += effectivePrice * item.quantity;
          totalQuantityForFreightCalculation += item.quantity;
        }

        // Calculate tax for this item if it's taxable
        if (item.productData.is_taxable && shippingAddress.country === 'Australia' && sellerTaxRate > 0) {
          totalTax += effectivePrice * item.quantity * (parseFloat(sellerTaxRate) / 100);
        }
      }

      // Calculate freight for this seller based on items NOT shipping exempt
      if (totalQuantityForFreightCalculation > 0) { // Only apply freight if there are non-exempt items
        if (sellerFreightRules.type === 'flat_rate' && sellerFreightRules.cost !== undefined) {
          sellerFreightForThisSeller = parseFloat(sellerFreightRules.cost);
        } else if (sellerFreightRules.type === 'per_item' && sellerFreightRules.cost !== undefined) {
          sellerFreightForThisSeller = parseFloat(sellerFreightRules.cost) * totalQuantityForFreightCalculation;
        } else if (sellerFreightRules.type === 'free_shipping_threshold' && sellerFreightRules.free_shipping_threshold !== undefined) {
          if (sellerSubtotalForFreightCalculation < parseFloat(sellerFreightRules.free_shipping_threshold)) {
            sellerFreightForThisSeller = 10; // Example default freight if threshold not met
          } else {
            sellerFreightForThisSeller = 0;
          }
        }
      }

      totalFreight += sellerFreightForThisSeller;
      subtotal += sellerSubtotal; // This subtotal includes all items, even non-taxable ones
    }

    const grandTotal = subtotal + totalTax + totalFreight;

    return new Response(JSON.stringify({
      subtotal: subtotal.toFixed(2),
      totalTax: totalTax.toFixed(2),
      totalFreight: totalFreight.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      processedItems: processedItems, // Optional: return processed items for debugging
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    console.error('Order total calculation failed:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});