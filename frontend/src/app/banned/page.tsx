import Link from 'next/link';

export default function BannedPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Account Suspended
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your account has been suspended for violating our community guidelines.
          If you believe this is a mistake, please contact support.
        </p>
        <Link
          href="/"
          className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition"
        >
          Go Home
        </Link>
      </div>
    </main>
  );
}