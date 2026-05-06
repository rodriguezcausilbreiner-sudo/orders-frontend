'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { productsService } from '@/services/productsService';
import { Product } from '@/types';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCount, setActiveCount] = useState(0);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsService.getProducts({ page, limit: 5, search: search || undefined });
      setProducts(res.data);
      setTotal(res.meta.total);
      setTotalPages(res.meta.totalPages);
      setActiveCount(res.data.filter(p => !p.isDiscontinued).length);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v);

  const handleToggleDiscontinued = async (product: Product) => {
    try {
      await productsService.updateProduct(product.id, { isDiscontinued: !product.isDiscontinued });
      fetchProducts();
    } catch (e) { console.error(e); }
  };

  return (
    <AppShell>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
        <span>Inventario</span>
        <span>›</span>
        <span className="text-slate-700 font-medium">Gestión de Productos</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Productos</h1>
          <p className="text-sm text-slate-500">Supervise el catálogo global de productos y niveles de stock.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors">
          + Añadir Producto
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Total Productos</p>
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</p>
          <p className="text-xs text-emerald-600 font-medium mt-1">↑ +12 este mes</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Activos</p>
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-slate-900">{activeCount.toLocaleString()}</p>
          <p className="text-xs text-slate-400 mt-1">89.5% del catálogo</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Acciones Rápidas</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              ↓ Exportar CSV
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              ↺ Ver Historial
            </button>
            <button className="flex items-center gap-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors">
              ☰ Más Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl">
        {loading ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="text-left px-5 py-3">Producto</th>
                  <th className="text-left px-5 py-3">SKU</th>
                  <th className="text-left px-5 py-3">Categoría</th>
                  <th className="text-left px-5 py-3">Estado</th>
                  <th className="text-right px-5 py-3">Precio</th>
                  <th className="text-left px-5 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 text-sm">
                      No products found.
                    </td>
                  </tr>
                ) : products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{product.productName}</p>
                          <p className="text-xs text-slate-400">{product.package}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-500 font-mono">PRD-{product.id}</td>
                    <td className="px-5 py-4 text-xs text-slate-600">
                      {product.supplier?.companyName ?? `Supplier #${product.supplierId}`}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        product.isDiscontinued
                          ? 'bg-slate-100 text-slate-500'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {product.isDiscontinued ? 'DISCONTINUED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-800">
                      {fmt(product.unitPrice)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleDiscontinued(product)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                          title={product.isDiscontinued ? 'Reactivar' : 'Discontinuar'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
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
          </div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Mostrando 1-{products.length} de {total.toLocaleString()} productos
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">‹</button>
            {Array.from({ length: Math.min(3, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === p ? 'bg-blue-800 text-white' : 'border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                {p}
              </button>
            ))}
            {totalPages > 3 && <span className="text-slate-400 text-xs px-1">...</span>}
            {totalPages > 3 && (
              <button onClick={() => setPage(totalPages)}
                className="w-8 h-8 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">{totalPages}</button>
            )}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors">›</button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs text-slate-500">Conexión estable</span>
            <span className="text-xs text-slate-400">· Última sincronización: Hace 2 min</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-blue-700 font-medium">
            <button className="hover:underline">Soporte Técnico</button>
            <button className="hover:underline">Documentación API</button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}