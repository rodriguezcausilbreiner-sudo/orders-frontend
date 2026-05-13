'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { customersService } from '@/services/customersService';
import { ordersService } from '@/services/ordersService';
import { Customer, Order, OrderStatus } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { BreadcrumbComponent, BreadcrumbItemsDirective, BreadcrumbItemDirective } from '@syncfusion/ej2-react-navigations';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Sort, Filter, Inject } from '@syncfusion/ej2-react-grids';

export default function CustomerDetailPage() {
  const { customerId } = useParams();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [c, o] = await Promise.all([
          customersService.getCustomerById(customerId as string),
          ordersService.getOrders({ customerId: customerId as string, limit: 100 }),
        ]);
        setCustomer(c);
        setOrders(o.data);
      } catch {
        router.push('/customers');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [customerId]);

  if (loading) return <AppShell><LoadingSpinner size="lg" /></AppShell>;
  if (!customer) return null;

  const breadcrumbItems = [
    { text: 'Inicio', url: '/' },
    { text: 'Clientes', url: '/customers' },
    { text: `${customer.firstName} ${customer.lastName}`, url: `/customers/${customerId}` }
  ];

  return (
    <AppShell tabTitle={`${customer.firstName} — Perfil de Cliente`}>
      <div className="mb-6">
        <BreadcrumbComponent items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Customer Info Card */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-blue-800 h-24 flex items-end justify-center pb-0">
               <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-md -mb-10 flex items-center justify-center text-blue-800 text-2xl font-black">
                 {customer.firstName[0]}{customer.lastName[0]}
               </div>
            </div>
            <div className="pt-12 p-6 text-center">
              <h2 className="text-xl font-bold text-slate-900">{customer.firstName} {customer.lastName}</h2>
              <p className="text-sm text-slate-500 uppercase tracking-widest font-semibold">{customer.companyName || 'Cliente Particular'}</p>
              
              <div className="mt-6 space-y-3 text-left">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Email</p>
                    <p className="text-sm font-medium text-slate-700">{customer.email || 'No registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Teléfono</p>
                    <p className="text-sm font-medium text-slate-700">{customer.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Ubicación</p>
                    <p className="text-sm font-medium text-slate-700">{customer.city}, {customer.country}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
             <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                <p className="text-xs font-bold text-amber-700 uppercase">Notas del Cliente</p>
             </div>
             <p className="text-xs text-amber-800 italic">"Cliente preferencial desde 2023. Priorizar entregas matutinas."</p>
          </div>
        </div>

        {/* Right: Orders History */}
        <div className="col-span-2">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Historial de Pedidos</h3>
                <p className="text-xs text-slate-500">Se muestran los últimos {orders.length} pedidos realizados.</p>
              </div>
              <Link href="/orders/new" className="px-3 py-1.5 bg-blue-800 text-white text-xs font-bold rounded-lg hover:bg-blue-900 transition-colors">
                + Nuevo Pedido
              </Link>
            </div>
            
            <GridComponent 
              dataSource={orders} 
              allowPaging 
              pageSettings={{ pageSize: 8 }}
              height="auto"
            >
              <ColumnsDirective>
                <ColumnDirective 
                  field="orderNumber" 
                  headerText="Pedido" 
                  width="120" 
                  template={(row: Order) => (
                    <Link href={`/orders/${row.id}`} className="text-blue-800 font-bold hover:underline">#{row.orderNumber || row.id}</Link>
                  )}
                />
                <ColumnDirective 
                  field="orderDate" 
                  headerText="Fecha" 
                  width="150" 
                  template={(row: Order) => (
                    <span className="text-xs text-slate-600">{new Date(row.orderDate).toLocaleDateString()}</span>
                  )}
                />
                <ColumnDirective field="totalAmount" headerText="Monto" width="130" format="C2" textAlign="Right" />
                <ColumnDirective 
                  field="status" 
                  headerText="Estado" 
                  width="130" 
                  textAlign="Center"
                  template={(row: Order) => <StatusBadge status={row.status as OrderStatus} />}
                />
              </ColumnsDirective>
              <Inject services={[Page, Sort]} />
            </GridComponent>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
