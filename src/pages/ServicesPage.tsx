import React from 'react';

export function ServicesPage() {
  return (
    <div className="min-h-screen bg-brown-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-brown-900 mb-8 text-center">Our Services</h1>
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <p className="text-lg text-brown-700">Details about our services will be displayed here.</p>
          <p className="text-brown-600 mt-4">Stay tuned for more information!</p>
        </div>
      </div>
    </div>
  );
}
