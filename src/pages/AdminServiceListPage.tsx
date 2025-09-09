import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useAdminServices } from '../hooks/useSupabase';
import { Service } from '../types';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

export function AdminServiceListPage() {
  const { loading, error, fetchAllServices, deleteService } = useAdminServices();
  const [services, setServices] = useState<Service[]>([]);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const getServices = async () => {
      const data = await fetchAllServices();
      if (data) {
        setServices(data as Service[]);
      }
    };
    getServices();
  }, [refresh, fetchAllServices]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the service "${name}"?`)) {
      const success = await deleteService(id);
      if (success) {
        setRefresh(prev => !prev);
      } else {
        alert('Failed to delete service.');
      }
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading services...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-brown-900">Services</h2>
        <Link to="/admin/services/new">
          <Button>
            <PlusCircle className="w-5 h-5 mr-2" />
            Add New Service
          </Button>
        </Link>
      </div>

      {services.length === 0 ? (
        <div className="text-center text-gray-600 py-10">No services found.</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{service.name}</div>
                    <div className="text-sm text-gray-500">{service.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${service.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.duration}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {service.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/admin/services/${service.id}/edit`} className="text-brown-600 hover:text-brown-900 mr-3">
                      <Edit className="w-5 h-5 inline" />
                    </Link>
                    <button onClick={() => handleDelete(service.id, service.name)} className="text-red-600 hover:text-red-900">
                      <Trash2 className="w-5 h-5 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
