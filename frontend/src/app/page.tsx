import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-4xl font-semibold text-gray-900 mb-4">
          Campus Marketplace
        </h1>
        <p className="text-gray-500 text-lg mb-8">
          Buy and sell books, electronics, and more within your campus community.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/listings"
            className="bg-gray-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-700 transition"
          >
            Browse Listings
          </Link>
          <Link
            href="/register"
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}