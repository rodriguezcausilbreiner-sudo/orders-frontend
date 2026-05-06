'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { customersService } from '@/services/customersService';
import { Customer } from '@/types';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersService.getCustomers({ page, limit: 5, search: search || undefined });
      setCustomers(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchCustomers(); }, [page, search]);

  const initials = (c: Customer) =>
    `${c.firstName?.[0] ?? ''}${c.lastName?.[0] ?? ''}`.toUpperCase();

  const colors = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700', 'bg-rose-100 text-rose-700'];

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Gestión de Clientes</h1>
          <p className="text-sm text-slate-500">Manage corporate accounts and individual customer relationships.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors">
          + Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Clients', value: total.toLocaleString(), sub: '↑ +4.2% from last month', icon: '👥' },
          { label: 'New (Last 30D)', value: '—', sub: 'Direct API integration active', icon: '👤' },
          { label: 'Active Status', value: '98.2%', sub: 'Operational accounts', icon: '⚙️' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-xl flex-shrink-0">
              {s.icon}
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{s.label}</p>
              <p className="text-xl font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6">
        {/* Filters */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <select className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option>All Segments</option>
              <option>Enterprise</option>
              <option>SME</option>
              <option>Individual</option>
            </select>
            <select className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option>Status: All</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            </button>
          </div>
        </div>

        {loading ? <LoadingSpinner /> : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                <th className="text-left px-5 py-3">Client Name</th>
                <th className="text-left px-5 py-3">Contact</th>
                <th className="text-left px-5 py-3">Location</th>
                <th className="text-left px-5 py-3">Phone</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-left px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">No clients found.</td>
                </tr>
              ) : customers.map((customer, idx) => (
                <tr key={customer.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 ${colors[idx % colors.length]}`}>
                        {initials(customer)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-slate-400">ID: CLT-{customer.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-500">{customer.phone}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{customer.city}, {customer.country}</td>
                  <td className="px-5 py-4 text-xs text-slate-600">{customer.phone}</td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Showing 1 to {customers.length} of {total.toLocaleString()} clients
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
              Previous
            </button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === p ? 'bg-blue-800 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {p}
              </button>
            ))}
            {totalPages > 3 && <span className="text-slate-400 text-xs">...</span>}
            {totalPages > 3 && (
              <button onClick={() => setPage(totalPages)}
                className="w-8 h-8 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">{totalPages}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Insights */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 bg-blue-800 rounded-xl p-5 text-white">
          <span className="text-[10px] font-semibold bg-blue-600 px-2 py-0.5 rounded-full uppercase tracking-wide">
            VIP Integration
          </span>
          <h3 className="text-base font-bold mt-3 mb-2">Enterprise Onboarding Flow</h3>
          <p className="text-xs text-blue-200 mb-4">
            4 new corporate entities are awaiting technical validation for direct EDI connection.
          </p>
          <button className="px-4 py-2 bg-white text-blue-800 text-xs font-semibold rounded-lg hover:bg-blue-50 transition-colors">
            Review Queue
          </button>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-slate-900">12</p>
          <p className="text-xs text-slate-500 mt-1">Incomplete Profiles</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col items-center justify-center">
          <p className="text-2xl font-bold text-slate-900">99%</p>
          <p className="text-xs text-slate-500 mt-1">Email Deliverability</p>
        </div>
      </div>
    </AppShell>
  );
}