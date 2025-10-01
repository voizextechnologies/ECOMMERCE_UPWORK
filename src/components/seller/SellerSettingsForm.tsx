import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface SellerSettingsFormProps {
  initialData: {
    tax_rate: number;
    freight_rules: any;
    override_global_tax?: boolean;
    override_global_shipping?: boolean;
    tax_registration_number?: string;
    gstin?: string;
    vat_id?: string;
    tax_inclusive_pricing?: boolean;
  };
  onSubmit: (data: {
    tax_rate: number;
    freight_rules: any;
    override_global_tax: boolean;
    override_global_shipping: boolean;
    tax_registration_number?: string;
    gstin?: string;
    vat_id?: string;
    tax_inclusive_pricing: boolean;
  }) => void;
  loading: boolean;
  error: string | null;
}

export function SellerSettingsForm({ initialData, onSubmit, loading, error }: SellerSettingsFormProps) {
  const [taxRate, setTaxRate] = useState(initialData.tax_rate || 0);
  // NEW: Structured states for freight rules
  const [freightType, setFreightType] = useState<'none' | 'flat_rate' | 'per_item' | 'free_shipping_threshold'>(
    initialData.freight_rules?.type || 'none'
  );
  const [freightCost, setFreightCost] = useState<number | null>(
    initialData.freight_rules?.cost ?? null
  );
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(
    initialData.freight_rules?.free_shipping_threshold ?? null
  );
  
  // Override states
  const [overrideGlobalTax, setOverrideGlobalTax] = useState(initialData.override_global_tax || false);
  const [overrideGlobalShipping, setOverrideGlobalShipping] = useState(initialData.override_global_shipping || false);

  // Tax registration states
  const [taxRegistrationNumber, setTaxRegistrationNumber] = useState(initialData.tax_registration_number || '');
  const [gstin, setGstin] = useState(initialData.gstin || '');
  const [vatId, setVatId] = useState(initialData.vat_id || '');
  const [taxInclusivePricing, setTaxInclusivePricing] = useState(initialData.tax_inclusive_pricing || false);


  useEffect(() => {
    setTaxRate(initialData.tax_rate || 0);
    // NEW: Parse initial freight rules into structured states
    setFreightType(initialData.freight_rules?.type || 'none');
    setFreightCost(initialData.freight_rules?.cost ?? null);
    setFreeShippingThreshold(initialData.freight_rules?.free_shipping_threshold ?? null);
    
    // Set override states
    setOverrideGlobalTax(initialData.override_global_tax || false);
    setOverrideGlobalShipping(initialData.override_global_shipping || false);

    // Set tax registration states
    setTaxRegistrationNumber(initialData.tax_registration_number || '');
    setGstin(initialData.gstin || '');
    setVatId(initialData.vat_id || '');
    setTaxInclusivePricing(initialData.tax_inclusive_pricing || false);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // NEW: Construct freight_rules JSON from structured states
    let constructedFreightRules: any = { type: freightType };
    if (freightType === 'flat_rate' || freightType === 'per_item') {
      constructedFreightRules.cost = freightCost;
    }
    if (freightType === 'free_shipping_threshold') {
      constructedFreightRules.free_shipping_threshold = freeShippingThreshold;
    }
    // If type is 'none', freight_rules will just be { type: 'none' }

    onSubmit({
      tax_rate: taxRate,
      freight_rules: constructedFreightRules,
      override_global_tax: overrideGlobalTax,
      override_global_shipping: overrideGlobalShipping,
      tax_registration_number: taxRegistrationNumber,
      gstin: gstin,
      vat_id: vatId,
      tax_inclusive_pricing: taxInclusivePricing,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {/* Tax Registration Section */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Registration</h3>
        <p className="text-sm text-gray-600 mb-4">
          Provide your tax registration details. These will be used for tax compliance and invoicing.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="taxRegistrationNumber" className="block text-sm font-medium text-gray-700">
              Tax Registration Number
            </label>
            <input
              type="text"
              id="taxRegistrationNumber"
              value={taxRegistrationNumber}
              onChange={(e) => setTaxRegistrationNumber(e.target.value)}
              placeholder="e.g., TRN12345678"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">General tax registration ID for your region</p>
          </div>

          <div>
            <label htmlFor="gstin" className="block text-sm font-medium text-gray-700">
              GSTIN (India)
            </label>
            <input
              type="text"
              id="gstin"
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              placeholder="e.g., 22AAAAA0000A1Z5"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Goods and Services Tax Identification Number</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="vatId" className="block text-sm font-medium text-gray-700">
              VAT ID (Europe/Other)
            </label>
            <input
              type="text"
              id="vatId"
              value={vatId}
              onChange={(e) => setVatId(e.target.value)}
              placeholder="e.g., GB123456789"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">Value Added Tax registration number</p>
          </div>

          <div className="flex items-center pt-6">
            <input
              id="taxInclusivePricing"
              name="taxInclusivePricing"
              type="checkbox"
              checked={taxInclusivePricing}
              onChange={(e) => setTaxInclusivePricing(e.target.checked)}
              className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
            />
            <label htmlFor="taxInclusivePricing" className="ml-2 block text-sm text-gray-900">
              My product prices include tax (tax-inclusive pricing)
            </label>
          </div>
        </div>
      </div>

      {/* Tax Settings Section */}
      <div className="border-b border-gray-200 pb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tax Rate Override</h3>
        
        <div className="flex items-center mb-4">
          <input
            id="overrideGlobalTax"
            name="overrideGlobalTax"
            type="checkbox"
            checked={overrideGlobalTax}
            onChange={(e) => setOverrideGlobalTax(e.target.checked)}
            className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
          />
          <label htmlFor="overrideGlobalTax" className="ml-2 block text-sm text-gray-900">
            Override global tax rate for my products
          </label>
        </div>

        {overrideGlobalTax && (
          <div>
            <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">Tax Rate (%)</label>
            <input
              type="number"
              id="taxRate"
              value={taxRate}
              onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
              step="0.01"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500">Enter your applicable tax rate (e.g., 10.00 for 10% GST).</p>
          </div>
        )}
      </div>

      {/* Shipping Settings Section */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Settings</h3>
        
        <div className="flex items-center mb-4">
          <input
            id="overrideGlobalShipping"
            name="overrideGlobalShipping"
            type="checkbox"
            checked={overrideGlobalShipping}
            onChange={(e) => setOverrideGlobalShipping(e.target.checked)}
            className="h-4 w-4 text-brown-600 focus:ring-brown-500 border-gray-300 rounded"
          />
          <label htmlFor="overrideGlobalShipping" className="ml-2 block text-sm text-gray-900">
            Override global shipping settings for my products
          </label>
        </div>

        {overrideGlobalShipping && (
          <>
            <div>
              <label htmlFor="freightType" className="block text-sm font-medium text-gray-700">Freight Type</label>
              <select
                id="freightType"
                value={freightType}
                onChange={(e) => {
                  setFreightType(e.target.value as 'none' | 'flat_rate' | 'per_item' | 'free_shipping_threshold');
                  setFreightCost(null);
                  setFreeShippingThreshold(null);
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              >
                <option value="none">No Freight</option>
                <option value="flat_rate">Flat Rate per Order</option>
                <option value="per_item">Per Item</option>
                <option value="free_shipping_threshold">Free Shipping over amount</option>
              </select>
            </div>

            {(freightType === 'flat_rate' || freightType === 'per_item') && (
              <div>
                <label htmlFor="freightCost" className="block text-sm font-medium text-gray-700">
                  Freight Cost {freightType === 'flat_rate' ? '($ per order)' : '($ per item)'}
                </label>
                <input
                  type="number"
                  id="freightCost"
                  value={freightCost ?? ''}
                  onChange={(e) => setFreightCost(parseFloat(e.target.value) || null)}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
              </div>
            )}

            {freightType === 'free_shipping_threshold' && (
              <div>
                <label htmlFor="freeShippingThreshold" className="block text-sm font-medium text-gray-700">
                  Free Shipping Threshold ($)
                </label>
                <input
                  type="number"
                  id="freeShippingThreshold"
                  value={freeShippingThreshold ?? ''}
                  onChange={(e) => setFreeShippingThreshold(parseFloat(e.target.value) || null)}
                  step="0.01"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Orders above this amount will have free shipping.</p>
              </div>
            )}
          </>
        )}
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
