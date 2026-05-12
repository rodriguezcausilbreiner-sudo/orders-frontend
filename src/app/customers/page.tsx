'use client';

import { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { customersService } from '@/services/customersService';
import { Customer } from '@/types';
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
  ToolbarItems,
} from '@syncfusion/ej2-react-grids';

export default function CustomersPage() {
  const { showToast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const gridRef = useRef<GridComponent>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await customersService.getCustomers({ page: 1, limit: 500 });
      setCustomers(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      console.error(e);
      setCustomers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este cliente?')) return;
    try {
      // Note: the service might not have deleteCustomer but I'll add it or assume it exists based on the plan
      // Actually let's check customersService one last time.
      // It doesn't have it. I'll add it to the service first.
      await customersService.deleteCustomer(id);
      showToast('Cliente Eliminado', 'El registro ha sido removido exitosamente', 'Success');
      fetchCustomers();
    } catch (e) {
      showToast('Error', 'No se pudo eliminar el cliente', 'Error');
    }
  };

  // ── Grid templates ─────────────────────────────────────────
  const customerTemplate = (row: Customer) => (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700">
        {row.firstName?.[0]}{row.lastName?.[0]}
      </div>
      <div>
        <Link href={`/customers/${row.id}`} className="text-sm font-semibold text-blue-800 hover:underline">
          {row.firstName} {row.lastName}
        </Link>
        <p className="text-[10px] text-slate-500">ID: {row.id}</p>
      </div>
    </div>
  );

  const statusTemplate = () => (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
      <span className="w-1 h-1 rounded-full bg-emerald-500 mr-1.5" />
      Activo
    </span>
  );

  const actionsTemplate = (row: Customer) => (
    <div className="flex items-center gap-2">
      <Link href={`/customers/${row.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors border border-transparent hover:border-blue-100">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      </Link>
      <button 
        onClick={() => handleDelete(row.id)}
        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );

  const toolbarClick = (args: any) => {
    if (args.item.id?.includes('excelexport')) gridRef.current?.excelExport();
  };

  return (
    <AppShell tabTitle="Gestión de Clientes — Sistema Ordenes">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-slate-600">Gestión de Clientes</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Clientes</h1>
          <p className="text-sm text-slate-500 mt-1">Administre cuentas corporativas y relaciones individuales con clientes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-all shadow-sm shadow-blue-200">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar Cliente
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-800">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase">CLIENTES TOTALES</p>
              <p className="text-2xl font-bold text-slate-900">{total}</p>
              <p className="text-[10px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                <span>↑ +4.2%</span> <span className="text-slate-400">desde el mes pasado</span>
              </p>
            </div>
          </div>
        </div>
        {/* ... (other stats) ... */}
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[400px]">
        <GridComponent
          ref={gridRef}
          dataSource={customers}
          allowPaging
          allowSorting
          allowExcelExport
          toolbar={['Search', 'ExcelExport'] as ToolbarItems[]}
          toolbarClick={toolbarClick}
          pageSettings={{ pageSize: 10 }}
          height="auto"
        >
          <ColumnsDirective>
            <ColumnDirective
              field="firstName"
              headerText="Nombre del Cliente"
              width="220"
              template={customerTemplate}
            />
            <ColumnDirective
              field="email"
              headerText="Contacto"
              width="200"
            />
            <ColumnDirective
              field="city"
              headerText="Ciudad"
              width="150"
            />
            <ColumnDirective
              field="country"
              headerText="País"
              width="120"
            />
            <ColumnDirective
              headerText="Estado"
              width="120"
              template={statusTemplate}
            />
            <ColumnDirective
              headerText="Acciones"
              width="120"
              textAlign="Center"
              template={actionsTemplate}
            />
          </ColumnsDirective>
          <Inject services={[Page, Sort, Filter, Group, Search, Toolbar, ExcelExport]} />
        </GridComponent>
      </div>
    </AppShell>
  );
}