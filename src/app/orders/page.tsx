'use client';

import { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { ordersService } from '@/services/ordersService';
import { Order, OrderStatus } from '@/types';
import StatusBadge from '@/components/ui/StatusBadge';
import { useToast } from '@/components/ToastProvider';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Page,
  Sort,
  Filter,
  Group,
  Search,
  Inject,
  Toolbar,
  ExcelExport,
  PdfExport,
  ToolbarItems,
} from '@syncfusion/ej2-react-grids';

export default function OrdersPage() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const gridRef = useRef<GridComponent>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await ordersService.getOrders({ page: 1, limit: 200 });
      setOrders(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      console.error(e);
      setOrders([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este pedido?')) return;
    try {
      await ordersService.deleteOrder(id);
      showToast('Pedido Eliminado', 'La orden ha sido removida permanentemente', 'Success');
      fetchOrders();
    } catch (e) {
      showToast('Error', 'No se pudo eliminar el pedido', 'Error');
    }
  };

  const toolbarClick = (args: any) => {
    if (args.item.id?.includes('excelexport')) gridRef.current?.excelExport();
    if (args.item.id?.includes('pdfexport')) gridRef.current?.pdfExport();
  };

  const orderTemplate = (row: Order) => (
    <Link href={`/orders/${row.id}`} className="text-blue-800 font-bold hover:underline">
      #{row.orderNumber || row.id}
    </Link>
  );

  const customerTemplate = (row: Order) => {
    const customer = row.customer;
    if (!customer) return <span className="text-slate-400 font-medium">Customer #{row.customerId}</span>;
    return (
      <div className="flex flex-col">
        <Link href={`/customers/${row.customerId}`} className="text-sm font-semibold text-slate-900 hover:text-blue-800 hover:underline">
          {customer.firstName} {customer.lastName}
        </Link>
        <span className="text-[10px] text-slate-500 uppercase tracking-tighter">ID: {row.customerId}</span>
      </div>
    );
  };

  const statusTemplate = (row: Order) => (
    <StatusBadge status={(row.status ?? 'Pending') as OrderStatus} />
  );

  const actionsTemplate = (row: Order) => (
    <div className="flex items-center gap-2">
      <Link href={`/orders/${row.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Link>
      <button 
        onClick={() => handleDelete(row.id)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );

  return (
    <AppShell tabTitle="Listado de Pedidos — Sistema Ordenes">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-slate-600">Listado de Pedidos</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Órdenes</h1>
          <p className="text-sm text-slate-500 mt-1">Supervisar y gestionar todos los pedidos entrantes y estados de envío.</p>
        </div>
        <Link href="/orders/new">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-all shadow-sm shadow-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Crear Pedido
          </button>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        <GridComponent
          ref={gridRef}
          dataSource={orders}
          allowPaging
          allowSorting
          allowFiltering
          allowExcelExport
          allowPdfExport
          toolbar={['Search', 'ExcelExport', 'PdfExport'] as ToolbarItems[]}
          toolbarClick={toolbarClick}
          pageSettings={{ pageSize: 10 }}
          filterSettings={{ type: 'Excel' }}
          height="auto"
        >
          <ColumnsDirective>
            <ColumnDirective
              field="orderNumber"
              headerText="ID Pedido"
              width="120"
              template={orderTemplate}
            />
            <ColumnDirective
              field="customerId"
              headerText="Cliente"
              width="240"
              template={customerTemplate}
            />
            <ColumnDirective
              field="orderDate"
              headerText="Fecha"
              width="160"
              template={(row: Order) => (
                <span className="text-sm text-slate-600">
                  {new Date(row.orderDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              )}
            />
            <ColumnDirective
              field="totalAmount"
              headerText="Monto Total"
              width="150"
              format="C2"
              textAlign="Right"
            />
            <ColumnDirective
              field="status"
              headerText="Estado"
              width="140"
              template={statusTemplate}
              textAlign="Center"
            />
            <ColumnDirective
              headerText="Acciones"
              width="120"
              textAlign="Center"
              template={actionsTemplate}
            />
          </ColumnsDirective>
          <Inject services={[Page, Sort, Filter, Group, Search, Toolbar, ExcelExport, PdfExport]} />
        </GridComponent>
      </div>
    </AppShell>
  );
}