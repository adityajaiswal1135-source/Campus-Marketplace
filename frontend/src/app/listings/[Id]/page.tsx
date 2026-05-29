'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Listing } from '@/lib/types';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ListingDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchListing = async () => {
      try {
        const res = await api.get(`/listings/${id}`);
        setListing(res.data.listing);
      } catch (err: any) {
        setError(true);
        toast.error(err.response?.data?.message || 'Listing not found');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
        <p>Listing not found.</p>
        <Link href="/listings" className="text-gray-900 font-medium hover:underline text-sm">
          ← Back to listings
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <Link href="/listings" className="text-sm text-gray-500 hover:text-gray-900">
          ← Back to listings
        </Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Image */}
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
            {listing.images?.[0] ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              'No image available'
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {listing.title}
                </h1>
                <p className="text-sm text-gray-500 mt-1 capitalize">
                  {listing.category} · {listing.condition}
                </p>
              </div>
              <span className="text-2xl font-bold text-gray-900">
                ₹{listing.price}
              </span>
            </div>

            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              {listing.description}
            </p>

            <div className="border-t border-gray-100 pt-4">
              <p className="text-sm text-gray-500">
                Posted by{' '}
                <span className="font-medium text-gray-900">
                  {listing.seller?.displayName || 'Unknown'}
                </span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {listing.views} views · Posted{' '}
                {new Date(listing.createdAt).toLocaleDateString()}
              </p>
            </div>

            <button
              onClick={() => toast.info('Contact feature coming soon!')}
              className="mt-6 w-full bg-gray-900 text-white py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
            >
              Contact Seller
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}