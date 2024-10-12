'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { customerId: string };
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="bg-gray-800 text-white p-4">
        <ul className="flex space-x-4">
          <li>
            <Link
              href={`/dashboard/${params.customerId}/orders`}
              className={`hover:text-gray-300 ${
                pathname.endsWith('/orders') ? 'font-bold' : ''
              }`}
            >
              Orders
            </Link>
          </li>
          <li>
            <Link
              href={`/dashboard/${params.customerId}/profile`}
              className={`hover:text-gray-300 ${
                pathname.endsWith('/products') ? 'font-bold' : ''
              }`}
            >
              Profile
            </Link>
          </li>
        </ul>
      </nav>
      <main className="flex-grow p-4">
        {children}
      </main>
    </div>
  );
}
