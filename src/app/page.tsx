'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import StatusBadge from '@/components/ui/StatusBadge';
import Link from 'next/link';
import { ordersService } from '@/services/ordersService';
import { productsService } from '@/services/productsService';
import { Order, OrderStatus } from '@/types';
import {
  ChartComponent,
  SeriesCollectionDirective,
  SeriesDirective,
  Inject as ChartInject,
  Legend,
  Category,
  Tooltip,
  DataLabel,
  ColumnSeries,
  LineSeries,
  AreaSeries,
} from '@syncfusion/ej2-react-charts';
import {
  AccumulationChartComponent,
  AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective,
  Inject as AccumInject,
  AccumulationLegend,
  AccumulationTooltip,
  AccumulationDataLabel,
  PieSeries,
} from '@syncfusion/ej2-react-charts';

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
          ordersService.getOrders({ page: 1, limit: 10 }),
          productsService.getProducts({ page: 1, limit: 1 }),
        ]);

        setOrders(ordersRes.data);
        setTotalOrders(ordersRes.meta.total);
        setTotalProducts(productsRes.meta.total);

        const sales = ordersRes.data.reduce((acc: number, o: Order) => acc + (o.totalAmount || 0), 0);
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
            Operaciones Globales
          </p>
          <h1 className="text-xl font-bold text-slate-900">Resumen Operativo</h1>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 hover:bg-slate-50 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Hoy
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-800 text-white rounded-lg hover:bg-blue-900 transition-colors font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar Datos
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
              title="Ventas Totales"
              value={formatCurrency(totalSales)}
              subtitle="En comparación con el período anterior"
              trend="+12%"
              trendUp
            >
              <IconSales />
            </StatCard>

            <StatCard
              title="Pedidos Totales"
              value={totalOrders.toLocaleString()}
              subtitle="85% del volumen proyectado alcanzado"
              badge="Objetivo Diario"
            >
              <IconOrders />
            </StatCard>

            <StatCard
              title="Productos Activos"
              value={totalProducts.toLocaleString()}
              subtitle="Listados en el catálogo"
            >
              <IconProducts />
            </StatCard>
          </div>

          {/* Middle Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2 bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Rendimiento Semanal</p>
                  <p className="text-xs text-slate-500">Volumen de pedidos por día</p>
                </div>
              </div>
              <div className="h-64">
                <ChartComponent
                  id="weekly-chart"
                  primaryXAxis={{ valueType: 'Category', labelIntersectAction: 'Rotate45' }}
                  primaryYAxis={{ labelFormat: '{value}' }}
                  chartArea={{ border: { width: 0 } }}
                  tooltip={{ enable: true }}
                >
                  <ChartInject services={[ColumnSeries, Category, Tooltip, DataLabel, Legend]} />
                  <SeriesCollectionDirective>
                    <SeriesDirective
                      dataSource={[
                        { x: 'Lun', y: 45 }, { x: 'Mar', y: 52 }, { x: 'Mié', y: 38 },
                        { x: 'Jue', y: 65 }, { x: 'Vie', y: 48 }, { x: 'Sáb', y: 25 }, { x: 'Dom', y: 32 }
                      ]}
                      xName="x" yName="y"
                      name="Pedidos"
                      type="Column"
                      marker={{ dataLabel: { visible: true, position: 'Top', font: { fontWeight: '600' } } }}
                      cornerRadius={{ topLeft: 4, topRight: 4 }}
                      fill="#1e40af"
                    />
                  </SeriesCollectionDirective>
                </ChartComponent>
              </div>
            </div>

            {/* Order Status Distribution */}
            <div className="flex flex-col gap-3">
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1 shadow-sm">
                <p className="text-sm font-semibold text-slate-900 mb-4">Distribución de Estados</p>
                <div className="h-48">
                  <AccumulationChartComponent
                    id="status-pie"
                    legendSettings={{ visible: true, position: 'Bottom' }}
                    enableSmartLabels={true}
                    tooltip={{ enable: true }}
                    background="transparent"
                  >
                    <AccumInject services={[AccumulationLegend, PieSeries, AccumulationTooltip, AccumulationDataLabel]} />
                    <AccumulationSeriesCollectionDirective>
                      <AccumulationSeriesDirective
                        dataSource={[
                          { x: 'Entregado', y: 40, text: '40%' },
                          { x: 'Pendiente', y: 25, text: '25%' },
                          { x: 'Procesando', y: 20, text: '20%' },
                          { x: 'Cancelado', y: 15, text: '15%' },
                        ]}
                        xName="x" yName="y"
                        innerRadius="40%"
                        dataLabel={{
                          visible: true,
                          name: 'text',
                          position: 'Inside',
                          font: { fontWeight: '600', color: '#ffffff' }
                        }}
                        palettes={['#1e40af', '#3b82f6', '#93c5fd', '#cbd5e1']}
                      />
                    </AccumulationSeriesCollectionDirective>
                  </AccumulationChartComponent>
                </div>
              </div>

              <div className="bg-blue-800 rounded-xl p-4 flex items-center gap-3 text-white">
                <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold">Salud del Sistema</p>
                  <p className="text-[10px] text-blue-200">Todos los servicios operando normalmente</p>
                </div>
              </div>
            </div>
          </div>

          {/* Latest Orders */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <p className="text-sm font-semibold text-slate-900">Últimos Pedidos</p>
              <Link href="/orders" className="text-xs text-blue-700 font-medium hover:underline">
                Ver Todos
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
                    <th className="text-left px-5 py-3">ID Pedido</th>
                    <th className="text-left px-5 py-3">Cliente</th>
                    <th className="text-left px-5 py-3">Fecha</th>
                    <th className="text-left px-5 py-3">Monto</th>
                    <th className="text-left px-5 py-3">Estado</th>
                    <th className="text-left px-5 py-3">Acción</th>
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
                          {new Date(order.orderDate).toLocaleDateString('es-ES', {
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
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Uso de Almacenamiento</p>
                  <p className="text-[10px] text-slate-400">72% de 5TB utilizados</p>
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