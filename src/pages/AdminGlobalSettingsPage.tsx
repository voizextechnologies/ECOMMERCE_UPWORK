// src/pages/AdminGlobalSettingsPage.tsx
import React, { useState } from 'react';
import { useGlobalSettings } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';

export function AdminGlobalSettingsPage() {
  const { settings, loading, error, updateGlobalSettings } = useGlobalSettings();
  const [defaultTaxRate, setDefaultTaxRate] = useState(settings?.default_tax_rate || 0);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  React.useEffect(() => {
    if (settings) {
      setDefaultTaxRate(settings.default_tax_rate || 0);
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const result = await updateGlobalSettings({
        default_tax_rate: defaultTaxRate,
      });
      if (result) {
        alert('Global settings saved successfully!');
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
              This tax rate will be applied to products from sellers who haven't set their own tax rate.
            </p>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700 p-4" role="alert">
            <p className="font-bold">Important:</p>
            <p className="text-sm">
              • This default tax rate applies only to products marked as "taxable"<br/>
              • Individual sellers can override this rate in their settings<br/>
              • Tax is only applied for Australian shipping addresses
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