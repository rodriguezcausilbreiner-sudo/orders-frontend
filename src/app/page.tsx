'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { ordersService } from '@/services/ordersService';
import { productsService } from '@/services/productsService';
import { Order, OrderStatus } from '@/types';

// ── Stat Card ──────────────────────────────────────────────
function StatCard({
  title,
  value,
  subtitle,
  trend,
  trendUp,
  badge,
  children,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: string;
  trendUp?: boolean;
  badge?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        {children}
        <div className="flex flex-col items-end gap-1">
          {badge && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {badge}
            </span>
          )}
          {trend && (
            <span className={`text-xs font-semibold flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
              {trendUp ? '↑' : '↓'} {trend}
            </span>
          )}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}

// ── Icon helpers ───────────────────────────────────────────
const IconSales = () => (
  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  </div>
);

const IconOrders = () => (
  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  </div>
);

const IconProducts = () => (
  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
    <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  </div>
);

// ── Main Dashboard ─────────────────────────────────────────
export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          ordersService.getOrders({ page: 1, limit: 5 }),
          productsService.getProducts({ page: 1, limit: 1 }),
        ]);

        const ordersData: Order[] = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data ?? []);
        const ordersMeta = (ordersRes as any).meta ?? (ordersRes as any).pagination ?? {};
        const productsData = Array.isArray(productsRes) ? productsRes : (productsRes.data ?? []);
        const productsMeta = (productsRes as any).meta ?? (productsRes as any).pagination ?? {};

        setOrders(ordersData);
        setTotalOrders(ordersMeta.total ?? ordersMeta.totalItems ?? ordersData.length);
        setTotalProducts(productsMeta.total ?? productsMeta.totalItems ?? productsData.length);

        const sales = ordersData.reduce((acc, o) => acc + ((o as any).totalAmount || 0), 0);
        setTotalSales(sales);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

  return (
    <AppShell headerAction={{ label: 'Crear Pedido', href: '/orders/new' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Global Operations
          </p>
          <h1 className="text-xl font-bold text-slate-900">Operational Overview</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Today
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Data
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="lg" />
      ) : (
        <>
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <StatCard
              title="Total Sales"
              value={formatCurrency(totalSales)}
              subtitle="Compared to previous period"
              trend="+12%"
              trendUp
            >
              <IconSales />
            </StatCard>

            <StatCard
              title="Total Orders"
              value={totalOrders.toLocaleString()}
              subtitle="85% of projected volume achieved"
              badge="Daily Target"
            >
              <IconOrders />
            </StatCard>

            <StatCard
              title="Active Products"
              value={totalProducts.toLocaleString()}
              subtitle="Listed in catalog"
            >
              <IconProducts />
            </StatCard>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Weekly Performance placeholder */}
            <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Weekly Performance</p>
                  <p className="text-xs text-slate-500">Order distribution per weekday</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-800 inline-block" /> Completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" /> Processing
                  </span>
                </div>
              </div>
              {/* Bar chart visual */}
              <div className="flex items-end justify-between gap-2 h-28 px-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const heights = [60, 80, 45, 90, 70, 35, 50];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col gap-0.5 justify-end" style={{ height: '100px' }}>
                        <div
                          className="w-full bg-blue-800 rounded-t-sm"
                          style={{ height: `${heights[i]}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory Health */}
            <div className="flex flex-col gap-3">
              <div className="bg-blue-800 rounded-xl p-5 flex-1 text-white">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-sm font-semibold">Inventory Health</p>
                  <svg className="w-8 h-8 text-blue-400 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" />
                  </svg>
                </div>
                <p className="text-xs text-blue-200 mb-4">
                  Critical stock levels detected for 8 core items in North Region.
                </p>
                <button className="px-4 py-2 bg-white text-blue-800 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors">
                  Restock Now
                </button>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">Server Latency High</p>
                  <p className="text-[10px] text-slate-500">API nodes showing 120ms lag</p>
                </div>
                <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Latest Orders */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Latest Orders</p>
              <Link href="/orders" className="text-xs text-blue-700 font-medium hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">Order ID</th>
                    <th className="text-left px-5 py-3">Client</th>
                    <th className="text-left px-5 py-3">Date</th>
                    <th className="text-left px-5 py-3">Amount</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {orders.map((order) => {
                    const customer = order.customer;
                    const initials = customer
                      ? `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`
                      : '??';
                    const fullName = customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : `Customer #${order.customerId}`;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-blue-700 font-medium hover:underline text-xs"
                          >
                            #{order.orderNumber || order.id}
                          </Link>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700">
                              {initials}
                            </div>
                            <span className="text-xs text-slate-700 font-medium">{fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">
                          {new Date(order.orderDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-3.5 text-xs font-semibold text-slate-800">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={(order.status ?? 'Pending') as OrderStatus} />
                        </td>
                        <td className="px-5 py-3.5">
                          <Link href={`/orders/${order.id}`}>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Storage bar at bottom */}
            <div className="px-5 py-4 border-t border-slate-100 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Storage Usage</p>
                  <p className="text-[10px] text-slate-400">72% of 5TB used</p>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-40">
                  <div className="h-full bg-blue-800 rounded-full" style={{ width: '72%' }} />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}