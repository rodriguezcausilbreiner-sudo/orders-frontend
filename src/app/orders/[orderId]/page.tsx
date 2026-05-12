'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ordersService } from '@/services/ordersService';
import { Order, OrderItem, OrderStatus } from '@/types';

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [o, i] = await Promise.all([
          ordersService.getOrderById(Number(orderId)),
          ordersService.getOrderItems(Number(orderId)),
        ]);
        setOrder(o);
        setItems(i);
      } catch { router.push('/orders'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [orderId]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v);

  if (loading) return <AppShell><LoadingSpinner size="lg" /></AppShell>;
  if (!order) return null;

  const customer = order.customer;
  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  const tax = subtotal * 0.08;

  return (
    <AppShell tabTitle={`Detalle de Pedido #${order.orderNumber || order.id}`}>
      {/* Back + Header */}
      <div className="mb-6">
        <Link href="/orders" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Volver al Listado
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-900">
              Pedido #{order.orderNumber || order.id}
            </h1>
            <StatusBadge status={(order.status ?? 'Pending') as OrderStatus} />
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              Descargar Factura
            </button>
            <Link
              href={`/orders/${order.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium shadow-sm"
            >
              ✎ Editar Pedido
            </Link>
          </div>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Realizado el {new Date(order.orderDate).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric',
          })}
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">Información del Cliente</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Nombre</p>
              <p className="text-sm font-medium text-slate-800">
                {customer ? `${customer.firstName} ${customer.lastName}` : `Cliente #${order.customerId}`}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Teléfono</p>
              <p className="text-sm text-slate-700">{customer?.phone ?? '—'}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Ubicación</p>
              <p className="text-sm text-slate-700">
                {customer ? `${customer.city}, ${customer.country}` : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">Información del Pedido</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Número de Pedido</p>
              <p className="text-sm font-medium text-slate-800">#{order.orderNumber || order.id}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Fecha del Pedido</p>
              <p className="text-sm text-slate-700">
                {new Date(order.orderDate).toLocaleDateString('es-ES')}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Estado</p>
              <StatusBadge status={(order.status ?? 'Pending') as OrderStatus} />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-700">Pago y Facturación</p>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Monto Total</p>
              <p className="text-lg font-bold text-blue-800">{fmt(order.totalAmount)}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Artículos</p>
              <p className="text-sm text-slate-700">{items.length} artículos pedidos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6 shadow-sm overflow-hidden text-slate-800">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Artículos del Pedido</p>
          <p className="text-xs text-slate-500">{items.length} Artículos en total</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-3">Producto</th>
              <th className="text-left px-5 py-3">SKU</th>
              <th className="text-center px-5 py-3">Cantidad</th>
              <th className="text-right px-5 py-3">Precio Unitario</th>
              <th className="text-right px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200">
                      <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.product?.productName ?? `Producto #${item.productId}`}
                      </p>
                      <p className="text-xs text-slate-400">{item.product?.package ?? ''}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-xs text-slate-500 font-mono">
                  PRD-{item.productId}
                </td>
                <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                  {item.quantity}
                </td>
                <td className="px-5 py-4 text-right text-sm text-slate-700">
                  {fmt(item.unitPrice)}
                </td>
                <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                  {fmt(item.unitPrice * item.quantity)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom: Timeline + Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">Línea de Tiempo del Pedido</p>
          <div className="space-y-4">
            {[
              { label: 'Pedido Realizado', desc: new Date(order.orderDate).toLocaleString(), done: true },
              { label: 'Pago Confirmado', desc: 'Pago verificado exitosamente', done: true },
              { label: 'Enviado a Suministros', desc: 'Pendiente de asignación', done: false },
            ].map((step) => (
              <div key={step.label} className="flex items-start gap-3">
                <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${step.done ? 'bg-blue-800 shadow-sm' : 'bg-slate-200'}`} />
                <div>
                  <p className={`text-sm font-medium ${step.done ? 'text-slate-800' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  <p className="text-xs text-slate-400">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-900 mb-4">Resumen del Pedido</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Subtotal ({items.length} artículos)</span>
              <span className="font-medium text-slate-800">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Tafira de Envío</span>
              <span className="font-medium text-emerald-600">GRATIS</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Impuestos (Est. 8%)</span>
              <span className="font-medium text-slate-800">{fmt(tax)}</span>
            </div>
            <div className="border-t border-slate-100 pt-2 flex justify-between">
              <span className="text-sm font-semibold text-slate-900">Total</span>
              <span className="text-lg font-bold text-blue-800">{fmt(order.totalAmount)}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-700">
              Este pedido se encuentra actualmente en estado: <strong>{order.status ?? 'Procesando'}</strong>.
              Los cambios en el pedido podrían causar retrasos en la entrega.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}