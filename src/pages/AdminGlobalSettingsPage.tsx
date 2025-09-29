// src/pages/AdminGlobalSettingsPage.tsx
import React, { useState } from 'react';
import { useGlobalSettings } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';
import { useAdminProducts } from '../hooks/useSupabase';

export function AdminGlobalSettingsPage() {
  const { settings, loading, error, updateGlobalSettings } = useGlobalSettings();
  const { fetchAllProducts, updateProduct } = useAdminProducts();
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings?.default_tax_rate || 0);
  const [defaultShippingCost, setDefaultShippingCost] = useState(settings?.default_shipping_cost || 9.95);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(settings?.free_shipping_threshold || 99.00);
  const [applyTaxToShipping, setApplyTaxToShipping] = useState(settings?.apply_tax_to_shipping || false);
  const [applyToAllProducts, setApplyToAllProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setDefaultTaxRate(settings.default_tax_rate || 0);
      setDefaultShippingCost(settings.default_shipping_cost || 9.95);
      setFreeShippingThreshold(settings.free_shipping_threshold || 99.00);
      setApplyTaxToShipping(settings.apply_tax_to_shipping || false);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const result = await updateGlobalSettings({
        default_tax_rate: defaultTaxRate,
        default_shipping_cost: defaultShippingCost,
        free_shipping_threshold: freeShippingThreshold,
        apply_tax_to_shipping: applyTaxToShipping,
      });

      // If "Apply to All Products" is checked, update all products
      if (applyToAllProducts && result) {
        const allProducts = await fetchAllProducts();
        if (allProducts) {
          const updatePromises = allProducts.map(product => 
            updateProduct(product.id, {
              custom_tax_rate: defaultTaxRate,
              custom_shipping_cost: defaultShippingCost,
              override_global_settings: false, // Reset to use global settings
            })
          );
          await Promise.all(updatePromises);
        }
      }

      if (result) {
        alert(applyToAllProducts ? 'Global settings saved and applied to all products!' : 'Global settings saved successfully!');
      } else {
        setSaveError('Failed to save global settings.');
      }
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save global settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading global settings...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Global Settings</h2>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          {saveError && <p className="text-red-500 text-sm mb-4">{saveError}</p>}

          <div>
            <label htmlFor="defaultTaxRate" className="block text-sm font-medium text-gray-700">
              Default Tax Rate (%)
            </label>
            <input
              type="number"
              id="defaultTaxRate"
              value={defaultTaxRate}
              onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              This tax rate will be applied to taxable products unless overridden by seller or product settings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultShippingCost" className="block text-sm font-medium text-gray-700">
                Default Shipping Cost ($)
              </label>
              <input
                type="number"
                id="defaultShippingCost"
                value={defaultShippingCost}
                onChange={(e) => setDefaultShippingCost(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                required
              />
            </div>
            <div>
              <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                Free Shipping Threshold ($)
              </label>
              <input
                type="number"
                id="freeShippingThreshold"
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || 0)}
                step="0.01"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="applyTaxToShipping"
              name="applyTaxToShipping"
              type="checkbox"
              checked={applyTaxToShipping}
              onChange={(e) => setApplyTaxToShipping(e.target.checked)}
              className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
            />
            <label htmlFor="applyTaxToShipping" className="ml-2 block text-sm text-gray-900">
              Apply tax to shipping costs
            </label>
          </div>

          <div className="flex items-center">
            <input
              id="applyToAllProducts"
              name="applyToAllProducts"
              type="checkbox"
              checked={applyToAllProducts}
              onChange={(e) => setApplyToAllProducts(e.target.checked)}
              className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
            />
            <label htmlFor="applyToAllProducts" className="ml-2 block text-sm text-gray-900">
              Apply these settings to ALL existing products
            </label>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Important:</p>
            <p className="text-sm">
              • These settings apply as defaults unless overridden by sellers or individual products<br/>
              • Tax applies only to products marked as "taxable" and Australian addresses<br/>
              • Sellers can override these settings for their products<br/>
              • Individual products can have custom tax/shipping rates
            </p>
          </div>

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Global Settings'}
          </Button>
        </form>
      </div>
    </div>
  );
}