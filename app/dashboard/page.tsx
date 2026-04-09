import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-config';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/auth/signin');
  }

  // Get user stats
  const productCount = await prisma.product.count();
  const saleCount = await prisma.sale.count();

  const userSales = await prisma.sale.count({
    where: {
      userId: session.user?.id,
    },
  });

  return (
    <div>
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome back, {session.user?.name}!
        </p>
      </header>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Products
            </dt>
            <dd className="mt-1 text-3xl font-extrabold text-gray-900">
              {productCount}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Total Sales
            </dt>
            <dd className="mt-1 text-3xl font-extrabold text-gray-900">
              {saleCount}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Your Sales
            </dt>
            <dd className="mt-1 text-3xl font-extrabold text-gray-900">
              {userSales}
            </dd>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">
              Your Role
            </dt>
            <dd className="mt-1 text-3xl font-extrabold text-gray-900">
              {session.user?.role}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
}
