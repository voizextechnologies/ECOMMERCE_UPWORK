// src/components/seller/SellerSettingsForm.tsx
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
  const [freightRules, setFreightRules] = useState(
    initialData.freight_rules ? JSON.stringify(initialData.freight_rules, null, 2) : '{}'
  );

  useEffect(() => {
    setTaxRate(initialData.tax_rate || 0);
    setFreightRules(initialData.freight_rules ? JSON.stringify(initialData.freight_rules, null, 2) : '{}');
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let parsedFreightRules = {};
    try {
      parsedFreightRules = JSON.parse(freightRules);
    } catch (err) {
      alert('Invalid JSON for freight rules');
      return;
    }

    onSubmit({
      tax_rate: taxRate,
      freight_rules: parsedFreightRules,
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

      <div>
        <label htmlFor="freightRules" className="block text-sm font-medium text-gray-700">Freight Rules (JSON)</label>
        <textarea
          id="freightRules"
          value={freightRules}
          onChange={(e) => setFreightRules(e.target.value)}
          rows={8}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm font-mono"
          placeholder='{"type": "flat_rate", "cost": 10.00}'
        ></textarea>
        <p className="mt-1 text-xs text-gray-500">Define your freight rules as a JSON object. Example: `{"type": "per_item", "cost": 5.00}` or `{"type": "flat_rate", "cost": 15.00}`.</p>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
