'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import StatusBadge from '@/components/ui/StatusBadge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ordersService } from '@/services/ordersService';
import { Order, OrderItem, OrderStatus } from '@/types';

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'Pending', label: 'Pendiente' },
  { value: 'Processing', label: 'Procesando' },
  { value: 'Delivered', label: 'Entregado' },
  { value: 'Cancelled', label: 'Cancelado' },
  { value: 'Sent', label: 'Enviado' },
];

export default function EditOrderPage() {
  const { orderId } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<OrderStatus>('Pending');
  const [orderDate, setOrderDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [o, i] = await Promise.all([
          ordersService.getOrderById(Number(orderId)),
          ordersService.getOrderItems(Number(orderId)),
        ]);
        setOrder(o);
        setItems(i);
        setStatus((o.status ?? 'Pending') as OrderStatus);
        setOrderDate(o.orderDate?.split('T')[0] ?? '');
      } catch { router.push('/orders'); }
      finally { setLoading(false); }
    };
    fetch();
  }, [orderId]);

  const handleSave = async () => {
    if (!order) return;
    setSaving(true);
    try {
      await ordersService.updateOrder(order.id, { status, orderDate });
      router.push(`/orders/${order.id}`);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleQtyChange = async (item: OrderItem, delta: number) => {
    const newQty = Math.max(1, item.quantity + delta);
    try {
      await ordersService.updateOrderItem(order!.id, item.id, { quantity: newQty });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, quantity: newQty } : i));
    } catch (e) { console.error(e); }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v);

  const subtotal = items.reduce((a, i) => a + i.unitPrice * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  if (loading) return <AppShell><LoadingSpinner size="lg" /></AppShell>;
  if (!order) return null;
  const customer = order.customer;

  return (
    <AppShell tabTitle={`Editar Pedido #${order.orderNumber || order.id}`}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/orders/${order.id}`}>
          <svg className="w-5 h-5 text-slate-500 hover:text-slate-700 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wide">Editar Pedido</h1>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="col-span-2 space-y-4">
          {/* Order Info Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">Pedido #{order.orderNumber || order.id}</h2>
                <p className="text-xs text-slate-500">Última actualización: hoy</p>
              </div>
              <StatusBadge status={status} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Estado del Pedido
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                >
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                  Fecha del Pedido
                </label>
                <input
                  type="date"
                  value={orderDate}
                  onChange={(e) => setOrderDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700"
                />
              </div>
            </div>

            {/* Customer */}
            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Cuenta del Cliente
              </label>
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center text-white text-xs font-bold">
                    {customer ? `${customer.firstName[0]}${customer.lastName[0]}` : 'C'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {customer ? `${customer.firstName} ${customer.lastName}` : `Cliente #${order.customerId}`}
                    </p>
                    <p className="text-xs text-slate-500">ID: {order.customerId}</p>
                  </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Items Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <h3 className="text-sm font-semibold text-slate-900">Artículos del Pedido</h3>
              </div>
              <button className="flex items-center gap-1 px-3 py-1.5 bg-blue-800 text-white text-xs font-medium rounded-lg hover:bg-blue-900 transition-colors shadow-sm">
                + Añadir Producto
              </button>
            </div>

            <div className="space-y-1">
              <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2 pb-2">
                <span className="col-span-5">Producto</span>
                <span className="col-span-3 text-center">Cantidad</span>
                <span className="col-span-2 text-right">Precio Unit.</span>
                <span className="col-span-2 text-right">Subtotal</span>
              </div>

              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 border border-slate-200">
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        {item.product?.productName ?? `Producto #${item.productId}`}
                      </p>
                      <p className="text-xs text-slate-400">SKU: PRD-{item.productId}</p>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center justify-center gap-2">
                    <button
                      onClick={() => handleQtyChange(item, -1)}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none"
                    >−</button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item, 1)}
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 transition-colors text-lg leading-none"
                    >+</button>
                  </div>
                  <div className="col-span-2 text-right text-sm text-slate-700">{fmt(item.unitPrice)}</div>
                  <div className="col-span-2 text-right text-sm font-semibold text-slate-900">
                    {fmt(item.unitPrice * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Resumen Financiero</h3>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal ({items.length} artículos)</span>
                <span className="font-medium text-slate-800">{fmt(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Envío Estimado</span>
                <span className="font-medium text-emerald-600">Gratis</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Impuestos (IPI/ICMS)</span>
                <span className="font-medium text-slate-800">{fmt(tax)}</span>
              </div>
              <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-700">Total del Pedido</span>
                <span className="text-xl font-bold text-blue-800">{fmt(total)}</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-colors disabled:opacity-60 uppercase tracking-wide shadow-sm"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
            <Link href={`/orders/${order.id}`}>
              <button className="w-full mt-2 py-2.5 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors uppercase tracking-wide">
                Cancelar
              </button>
            </Link>
          </div>

          {/* Logistics Info */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Información de Logística</p>
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="text-slate-400">Transportadora:</span>
                <span className="font-medium text-slate-800">Blue Express Log</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plazo Estimado:</span>
                <span className="font-medium text-slate-800">4-5 días hábiles</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-sm font-semibold text-slate-700">Notas Internas</p>
            </div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Adicione observaciones para el equipo de logística..."
              rows={3}
              className="w-full text-xs text-slate-600 border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>
    </AppShell>
  );
}
