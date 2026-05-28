'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/axios';
import { Listing } from '@/lib/types';
import { toast } from 'sonner';

export default function ListingsPage() {
  const [listings, setListings]   = useState<Listing[]>([]);
  const [loading, setLoading]     = useState(true);
  const [category, setCategory]   = useState('');
  const [search, setSearch]       = useState('');

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search)   params.append('search', search);

      const res = await api.get(`/listings?${params.toString()}`);
      setListings(res.data.listings);
    } catch {
      toast.error('Failed to load listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchListings(); }, [category]);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold text-gray-900">
          Campus Marketplace
        </Link>
        <div className="flex gap-3">
          <Link
            href="/listings/new"
            className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            + Post Listing
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Search and filter */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Search listings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchListings()}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
          >
            <option value="">All Categories</option>
            <option value="books">Books</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="furniture">Furniture</option>
            <option value="sports">Sports</option>
            <option value="stationery">Stationery</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Listings grid */}
        {loading ? (
          <div className="text-center text-gray-500 py-20">Loading listings...</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-500 py-20">
            No listings found.{' '}
            <Link href="/listings/new" className="text-gray-900 font-medium hover:underline">
              Be the first to post!
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <Link key={listing._id} href={`/listings/${listing._id}`}>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition cursor-pointer">
                  <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      'No image'
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {listing.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 capitalize">
                      {listing.category} · {listing.condition}
                    </p>
                    <p className="text-base font-semibold text-gray-900 mt-2">
                      ₹{listing.price}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}