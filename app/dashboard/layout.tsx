'use client';

import { useSession, signOut } from 'next-auth/react';
import { ReactNode } from 'react';
import Link from 'next/link';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">SmartStock</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.name} ({session?.user?.role})
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-4 mb-8">
          <Link
            href="/dashboard"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Dashboard
          </Link>
          <Link
            href="/dashboard/products"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Products
          </Link>
          <Link
            href="/dashboard/sales"
            className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            Sales
          </Link>
          {session?.user?.role === 'admin' && (
            <Link
              href="/admin"
              className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900"
            >
              Admin
            </Link>
          )}
        </nav>

        {children}
      </div>
    </div>
  );
}
