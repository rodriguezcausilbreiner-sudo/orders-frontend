'use client';

import { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { suppliersService } from '@/services/suppliersService';
import { Supplier } from '@/types';
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

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const gridRef = useRef<GridComponent>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await suppliersService.getSuppliers({ page: 1, limit: 500 });
      setSuppliers(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      console.error(e);
      setSuppliers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSuppliers(); }, []);

  const toolbarClick = (args: any) => {
    if (args.item.id?.includes('excelexport')) gridRef.current?.excelExport();
    if (args.item.id?.includes('pdfexport')) gridRef.current?.pdfExport();
  };

  const nameTemplate = (row: Supplier) => (
    <Link href={`/suppliers/${row.id}`} className="text-blue-800 font-bold hover:underline">
      {row.companyName}
    </Link>
  );

  return (
    <AppShell tabTitle="Proveedores — Sistema Ordenes">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-slate-600">Proveedores</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Listado de Proveedores</h1>
          <p className="text-sm text-slate-500 mt-1">Gestión integral de socios comerciales y suministro de catálogo.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-all shadow-sm">
          + Añadir Proveedor
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        <GridComponent
          ref={gridRef}
          dataSource={suppliers}
          allowPaging
          allowSorting
          allowFiltering
          allowExcelExport
          allowPdfExport
          toolbar={['Search', 'ExcelExport', 'PdfExport'] as ToolbarItems[]}
          toolbarClick={toolbarClick}
          pageSettings={{ pageSize: 12 }}
          filterSettings={{ type: 'Excel' }}
          height="auto"
        >
          <ColumnsDirective>
            <ColumnDirective
              field="id"
              headerText="ID"
              width="80"
              textAlign="Center"
            />
            <ColumnDirective
              field="companyName"
              headerText="Empresa / Proveedor"
              width="240"
              template={nameTemplate}
            />
            <ColumnDirective
              field="contactName"
              headerText="Contacto Principal"
              width="200"
            />
            <ColumnDirective
              field="contactTitle"
              headerText="Cargo"
              width="180"
              visible={false}
            />
            <ColumnDirective
              field="city"
              headerText="Ciudad"
              width="150"
            />
            <ColumnDirective
              field="country"
              headerText="País"
              width="150"
            />
            <ColumnDirective
              field="phone"
              headerText="Teléfono"
              width="150"
            />
          </ColumnsDirective>
          <Inject services={[Page, Sort, Filter, Group, Search, Toolbar, ExcelExport, PdfExport]} />
        </GridComponent>
      </div>
    </AppShell>
  );
}
