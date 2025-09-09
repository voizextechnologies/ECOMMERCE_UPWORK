import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAdminUsers } from '../hooks/useSupabase';
import { Button } from '../components/ui/Button';
import { User } from '../types'; // Assuming User type includes role

export function AdminEditUserPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchUserProfileById, updateUserProfile, loading, error } = useAdminUsers();
  const [initialData, setInitialData] = useState<any>(null); // Use 'any' for joined type
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    const getUserProfile = async () => {
      if (id) {
        const data = await fetchUserProfileById(id);
        if (data) {
          setInitialData(data);
          setFirstName(data.first_name || '');
          setLastName(data.last_name || '');
          setRole(data.role || '');
        } else {
          setFetchError('User profile not found or failed to load.');
        }
      }
    };
    getUserProfile();
  }, [id, fetchUserProfileById]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const updatedProfile = {
      first_name: firstName,
      last_name: lastName,
      role: role,
    };

    const result = await updateUserProfile(id, updatedProfile);
    if (result) {
      navigate('/admin/users');
    }
  };

  if (loading && !initialData) {
    return <div className="text-center py-8">Loading user data...</div>;
  }

  if (fetchError) {
    return <div className="text-center py-8 text-red-500">Error: {fetchError}</div>;
  }

  if (!initialData && !loading) {
    return <div className="text-center py-8 text-gray-600">User not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-brown-900 mb-6">Edit User Profile</h2>
      {initialData && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={initialData.users?.email || 'N/A'}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
              disabled
            />
          </div>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              required
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brown-500 focus:ring-brown-500 sm:text-sm"
              required
            >
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Update User'}
          </Button>
        </form>
      )}
    </div>
  );
}
