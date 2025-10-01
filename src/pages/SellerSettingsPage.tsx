// src/pages/SellerSettingsPage.tsx
import React from 'react';
import { useApp } from '../contexts/AppContext';
import { useSellerSettings, useGlobalSettings } from '../hooks/useSupabase';
import { SellerSettingsForm } from '../components/seller/SellerSettingsForm';

export function SellerSettingsPage() {
  const { state: { user } } = useApp();
  const userId = user?.id || null;

  const { settings, loading, error, upsertSettings } = useSellerSettings(userId);
  const { settings: globalSettings, loading: globalSettingsLoading, error: globalSettingsError } = useGlobalSettings();

  const handleSubmit = async (data: {
    tax_rate: number;
    freight_rules: any;
    override_global_tax: boolean;
    override_global_shipping: boolean;
    tax_registration_number?: string;
    gstin?: string;
    vat_id?: string;
    tax_inclusive_pricing: boolean;
  }) => {
    const result = await upsertSettings({
      seller_id: userId!,
      tax_rate: data.tax_rate,
      freight_rules: data.freight_rules,
      override_global_tax: data.override_global_tax,
      override_global_shipping: data.override_global_shipping,
      tax_registration_number: data.tax_registration_number,
      gstin: data.gstin,
      vat_id: data.vat_id,
      tax_inclusive_pricing: data.tax_inclusive_pricing,
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
      {globalSettings?.default_tax_rate !== null && (
        <div className="bg-blue-50 border-l-4 border-blue-400 text-blue-700 p-4 mb-6" role="alert">
          <p className="font-bold">Global Default Tax Rate:</p>
          <p>A default tax rate of {globalSettings?.default_tax_rate?.toFixed(2)}% is applied if you do not set your own.</p>
        </div>
      )}
      <SellerSettingsForm
        initialData={settings || {
          tax_rate: 0,
          freight_rules: {},
          override_global_tax: false,
          override_global_shipping: false,
          tax_registration_number: '',
          gstin: '',
          vat_id: '',
          tax_inclusive_pricing: false,
        }}
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </div>
  );
}