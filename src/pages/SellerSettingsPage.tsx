// src/pages/SellerSettingsPage.tsx
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useSellerSettings } from '../hooks/useSupabase';
import { SellerSettingsForm } from '../components/seller/SellerSettingsForm'; // New component

export function SellerSettingsPage() {
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { settings, loading, error, upsertSettings } = useSellerSettings(userId);

  const handleSubmit = async (data: { tax_rate: number; freight_rules: any }) => {
    const result = await upsertSettings({
      seller_id: userId!, // userId is guaranteed to be present if this page is accessed
      tax_rate: data.tax_rate,
      freight_rules: data.freight_rules,
    });
    if (result) {
      alert('Settings saved successfully!');
    } else {
      alert('Failed to save settings.');
    }
  };

  if (loading || globalSettingsLoading) {
    return <div className="text-center py-8">Loading settings...</div>;
  }

  if (error || globalSettingsError) {
    return <div className="text-center py-8 text-red-500">Error: {error || globalSettingsError}</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Seller Settings</h2>
      {globalDefaultTaxRate !== null && (
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Global Default Tax Rate:</p>
          <p>A default tax rate of {globalDefaultTaxRate.toFixed(2)}% is applied if you do not set your own.</p>
        </div>
      )}
      <SellerSettingsForm
        initialData={settings || { tax_rate: 0, freight_rules: {} }}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}
