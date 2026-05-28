'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { User, Listing } from '@/lib/types';
import { toast } from 'sonner';

export default function AdminDashboard() {
  const [users, setUsers]       = useState<User[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState<'users' | 'listings'>('users');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, listingsRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/listings'),
        ]);
        setUsers(usersRes.data.users);
        setListings(listingsRes.data.listings);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const banUser = async (userId: string, reason: string) => {
    try {
      await api.patch(`/admin/users/${userId}/ban`, { reason });
      toast.success('User banned successfully');
      setUsers(users.map((u) =>
        u._id === userId ? { ...u, isBanned: true } : u
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to ban user');
    }
  };

  const unbanUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/unban`);
      toast.success('User unbanned successfully');
      setUsers(users.map((u) =>
        u._id === userId ? { ...u, isBanned: false } : u
      ));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unban user');
    }
  };

  const deleteListing = async (listingId: string) => {
    try {
      await api.delete(`/admin/listings/${listingId}`, {
        data: { reason: 'Inappropriate content' },
      });
      toast.success('Listing deleted');
      setListings(listings.filter((l) => l._id !== listingId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('users')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'users'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab('listings')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === 'listings'
                ? 'bg-gray-900 text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
            }`}
          >
            Listings ({listings.length})
          </button>
        </div>

        {/* Users table */}
        {tab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Email</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Student ID</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-900">{user.displayName}</td>
                    <td className="px-4 py-3 text-gray-500">{user.email}</td>
                    <td className="px-4 py-3 text-gray-500">{user.studentID}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.isBanned
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {user.role !== 'admin' && (
                        user.isBanned ? (
                          <button
                            onClick={() => unbanUser(user._id)}
                            className="text-xs text-green-600 hover:underline font-medium"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              const reason = prompt('Enter ban reason:');
                              if (reason) banUser(user._id, reason);
                            }}
                            className="text-xs text-red-600 hover:underline font-medium"
                          >
                            Ban
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Listings table */}
        {tab === 'listings' && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Title</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Seller</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => (
                  <tr key={listing._id} className="border-b border-gray-100 last:border-0">
                    <td className="px-4 py-3 text-gray-900">{listing.title}</td>
                    <td className="px-4 py-3 text-gray-500">
                      {listing.seller?.displayName}
                    </td>
                    <td className="px-4 py-3 text-gray-900">₹{listing.price}</td>
                    <td className="px-4 py-3 text-gray-500 capitalize">{listing.category}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteListing(listing._id)}
                        className="text-xs text-red-600 hover:underline font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}