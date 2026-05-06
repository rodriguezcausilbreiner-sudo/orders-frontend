'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ordersService } from '@/services/ordersService';
import { Order, OrderStatus } from '@/types';

const STATUS_TABS = ['All', 'Pending', 'Processing', 'Delivered', 'Cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({
    total: 0, pending: 0, delivered: 0, revenue: 0,
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const filters: Record<string, unknown> = { page, limit: 5 };
      if (activeTab !== 'All') filters.status = activeTab;
      const res = await ordersService.getOrders(filters);
      setOrders(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);

      // stats from first load
      if (page === 1 && activeTab === 'All') {
        const revenue = res.data.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        setStats({
          total: res.meta.total,
          pending: res.data.filter(o => o.status === 'Pending').length,
          delivered: res.data.filter(o => o.status === 'Delivered').length,
          revenue,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [page, activeTab]);

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const filteredOrders = search
    ? orders.filter(o => {
        const name = o.customer
          ? `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase()
          : '';
        return (
          name.includes(search.toLowerCase()) ||
          String(o.id).includes(search) ||
          (o.orderNumber || '').toLowerCase().includes(search.toLowerCase())
        );
      })
    : orders;

  return (
    <AppShell headerAction={{ label: '+ New Order', href: '/orders/new' }}>
      {/* Page Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Listado de Pedidos</h1>
          <p className="text-sm text-slate-500">Manage and track all logistics orders in real-time.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
          <Link
            href="/orders/new"
            className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium"
          >
            + New Order
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: 'TOTAL ORDERS', value: stats.total.toLocaleString(), badge: '+12.5%', badgeUp: true, icon: '🛒' },
          { label: 'PENDING', value: stats.pending, badge: 'Action Required', badgeColor: 'text-amber-600 bg-amber-50', icon: '📋' },
          { label: 'DELIVERED', value: stats.delivered, badge: 'On Track', badgeColor: 'text-emerald-600 bg-emerald-50', icon: '🚚' },
          { label: 'REVENUE (MTD)', value: formatCurrency(stats.revenue), badge: 'Target Met', badgeColor: 'text-blue-600 bg-blue-50', icon: '💰' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-2">
              <span className="text-lg">{s.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badgeColor ?? (s.badgeUp ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100')}`}>
                {s.badge}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{s.label}</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl">
        {/* Filters */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
              </svg>
            </button>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Filter by customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-3">Order ID</th>
                  <th className="text-left px-5 py-3">Customer Name</th>
                  <th className="text-left px-5 py-3">Date</th>
                  <th className="text-left px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      No orders found.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const customer = order.customer;
                    const initials = customer
                      ? `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`
                      : '??';
                    const fullName = customer
                      ? `${customer.firstName} ${customer.lastName}`
                      : `Customer #${order.customerId}`;
                    const email = customer?.phone ?? '';

                    return (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-5 py-4">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-blue-700 font-semibold hover:underline text-xs"
                          >
                            #{order.orderNumber || order.id}
                          </Link>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[11px] font-bold text-blue-700 flex-shrink-0">
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{fullName}</p>
                              <p className="text-xs text-slate-400">{email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs text-slate-500">
                          {new Date(order.orderDate).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>
                        <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-5 py-4">
                          <StatusBadge status={(order.status ?? 'Pending') as OrderStatus} />
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <Link href={`/orders/${order.id}`}>
                              <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              </button>
                            </Link>
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing 1 to {filteredOrders.length} of {total.toLocaleString()} results
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${
                  page === p
                    ? 'bg-blue-800 text-white'
                    : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            ))}
            {totalPages > 3 && (
              <>
                <span className="text-slate-400 text-xs px-1">...</span>
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-8 h-8 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  {totalPages}
                </button>
              </>
            )}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="mx-5 mb-5 bg-slate-900 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Automated Optimization is Active</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              System AI has analyzed recent order patterns. We recommend prioritizing 12 deliveries
              to the North-East hub to reduce shipping overhead by 8.4% this week.
            </p>
          </div>
          <button className="px-4 py-2 bg-white text-slate-900 text-sm font-semibold rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0">
            View Suggestions
          </button>
        </div>
      </div>
    </AppShell>
  );
}