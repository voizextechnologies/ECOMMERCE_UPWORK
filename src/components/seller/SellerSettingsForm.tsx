```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';

interface SellerSettingsFormProps {
  initialData: {
    tax_rate: number;
    freight_rules: any;
  };
  onSubmit: (data: { tax_rate: number; freight_rules: any }) => void;
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


  useEffect(() => {
    setTaxRate(initialData.tax_rate || 0);
    // NEW: Parse initial freight rules into structured states
    setFreightType(initialData.freight_rules?.type || 'none');
    setFreightCost(initialData.freight_rules?.cost ?? null);
    setFreeShippingThreshold(initialData.freight_rules?.free_shipping_threshold ?? null);
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
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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

      {/* NEW: Structured Freight Rules Input */}
      <div>
        <label htmlFor="freightType" className="block text-sm font-medium text-gray-700">Freight Type</label>
        <select
          id="freightType"
          value={freightType}
          onChange={(e) => {
            setFreightType(e.target.value as 'none' | 'flat_rate' | 'per_item' | 'free_shipping_threshold');
            setFreightCost(null); // Reset cost when type changes
            setFreeShippingThreshold(null); // Reset threshold when type changes
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

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
```