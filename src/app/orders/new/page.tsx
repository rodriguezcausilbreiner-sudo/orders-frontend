'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { ordersService } from '@/services/ordersService';
import { customersService } from '@/services/customersService';
import { productsService } from '@/services/productsService';
import { Customer, Product } from '@/types';

interface CartItem { product: Product; quantity: number; }

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<number | ''>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [c, p] = await Promise.all([
          customersService.getCustomers({ limit: 50 }),
          productsService.getProducts({ limit: 50 }),
        ]);
        setCustomers(c.data ?? c);
        setProducts(p.data ?? p);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id);
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev
      .map(i => i.product.id === productId ? { ...i, quantity: Math.max(0, i.quantity + delta) } : i)
      .filter(i => i.quantity > 0)
    );
  };

  const handleSubmit = async () => {
    if (!selectedCustomer || cart.length === 0) return;
    setSubmitting(true);
    try {
      const order = await ordersService.createOrder({
        customerId: Number(selectedCustomer),
        items: cart.map(i => ({ productId: i.product.id, quantity: i.quantity })),
      });
      router.push(`/orders/${order.id}`);
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  const fmt = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v);

  const subtotal = cart.reduce((a, i) => a + i.product.unitPrice * i.quantity, 0);
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  const STEPS = ['Detalles del Cliente', 'Selección de Productos', 'Revisar y Finalizar'];

  return (
    <AppShell tabTitle="Crear Nuevo Pedido">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4 flex-1">
          {STEPS.map((label, idx) => {
            const n = idx + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                  ${active ? 'bg-blue-800 text-white' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                  {done ? '✓' : n}
                </div>
                <span className={`text-sm font-medium ${active ? 'text-slate-900' : 'text-slate-400'}`}>{label}</span>
                {idx < STEPS.length - 1 && <div className="w-12 h-px bg-slate-200 ml-2" />}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            Guardar Borrador
          </button>
          <button
            onClick={() => step < 3 ? setStep(s => s + 1) : handleSubmit()}
            disabled={submitting || (step === 1 && !selectedCustomer) || (step === 2 && cart.length === 0)}
            className="px-6 py-2 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors shadow-sm"
          >
            {step === 3 ? (submitting ? 'Creando...' : 'Finalizar Pedido') : 'Siguiente Paso'}
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner size="lg" /> : (
        <div className="grid grid-cols-3 gap-6">
          {/* Left: Steps Content */}
          <div className="col-span-2 space-y-4">
            {/* Step 1: Customer */}
            {step === 1 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">Información del Cliente</h2>
                    <p className="text-xs text-slate-500">Seleccione la cuenta para este pedido.</p>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                    Nombre del Cliente
                  </label>
                  <select
                    value={selectedCustomer}
                    onChange={(e) => setSelectedCustomer(Number(e.target.value))}
                    className="w-full px-3 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-slate-700"
                  >
                    <option value="">Seleccione un cliente...</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} — {c.city}, {c.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 2: Products */}
            {step === 2 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-slate-900">Agregar Productos Rápidamente</h2>
                </div>
                <div className="space-y-1">
                  <div className="grid grid-cols-12 text-[11px] font-semibold text-slate-400 uppercase tracking-wide px-2 pb-2">
                    <span className="col-span-5">SKU / Producto</span>
                    <span className="col-span-2 text-right">Precio</span>
                    <span className="col-span-3 text-center">Cantidad</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>
                  {products.filter(p => !p.isDiscontinued).map(product => {
                    const cartItem = cart.find(i => i.product.id === product.id);
                    return (
                      <div key={product.id} className="grid grid-cols-12 items-center py-3 px-2 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-50">
                        <div className="col-span-5 flex items-center gap-2">
                          <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-slate-800">{product.productName}</p>
                            <p className="text-[10px] text-slate-400">{product.package}</p>
                          </div>
                        </div>
                        <div className="col-span-2 text-right text-xs font-medium text-slate-700">
                          {fmt(product.unitPrice)}
                        </div>
                        <div className="col-span-3 flex items-center justify-center gap-2">
                          {cartItem ? (
                            <>
                              <button onClick={() => updateQty(product.id, -1)}
                                className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm">−</button>
                              <span className="w-6 text-center text-xs font-bold">{cartItem.quantity}</span>
                              <button onClick={() => updateQty(product.id, 1)}
                                className="w-6 h-6 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 text-sm">+</button>
                            </>
                          ) : (
                            <button onClick={() => addToCart(product)}
                              className="px-3 py-1 text-[10px] font-semibold bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors">
                              Añadir
                            </button>
                          )}
                        </div>
                        <div className="col-span-2 text-right text-xs font-semibold text-slate-900">
                          {cartItem ? fmt(product.unitPrice * cartItem.quantity) : '—'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-base font-semibold text-slate-900 mb-4">Revisar y Finalizar</h2>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 mb-1">Cliente</p>
                    <p className="text-sm font-medium text-slate-800">
                      {customers.find(c => c.id === selectedCustomer)
                        ? `${customers.find(c => c.id === selectedCustomer)!.firstName} ${customers.find(c => c.id === selectedCustomer)!.lastName}`
                        : '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs font-semibold text-slate-500 mb-2">Artículos ({cart.length})</p>
                    {cart.map(i => (
                      <div key={i.product.id} className="flex justify-between text-sm py-1">
                        <span className="text-slate-700">{i.product.productName} × {i.quantity}</span>
                        <span className="font-medium text-slate-900">{fmt(i.product.unitPrice * i.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Resumen del Pedido</h3>
              <p className="text-xs text-slate-400 mb-4">ID Borrador: #ORD-TEMP</p>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal ({cart.reduce((a, i) => a + i.quantity, 0)} items)</span>
                  <span className="font-medium text-slate-800">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Tarifa de Logística</span>
                  <span className="font-medium text-blue-600">+$0.00</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Impuestos (Calc.)</span>
                  <span className="font-medium text-slate-800">{fmt(tax)}</span>
                </div>
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Monto Total</span>
                  <span className="text-2xl font-bold text-blue-800">{fmt(total)}</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedCustomer || cart.length === 0}
                className="w-full py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors shadow-md"
              >
                {step === 3 ? (submitting ? 'Creando Pedido...' : 'Confirmar Pedido') : 'Continuar al Paso 3'}
              </button>
              <p className="text-[10px] text-slate-400 text-center mt-3">
                Al proceder, usted acepta los Términos y Condiciones de la Cadena de Suministro del Sistema.
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-2 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <p className="text-xs text-slate-600 font-medium">Sincronización de Inventario Activa</p>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}