'use client';

import { useEffect, useState, useRef } from 'react';
import AppShell from '@/components/layout/AppShell';
import Link from 'next/link';
import { productsService } from '@/services/productsService';
import { Product, ProductFilters } from '@/types';
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

export default function ProductsPage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const gridRef = useRef<GridComponent>(null);

  const fetchProducts = async (filters?: ProductFilters) => {
    setLoading(true);
    try {
      const res = await productsService.getProducts(filters);
      setProducts(res.data);
      setTotal(res.meta.total);
    } catch (e) {
      console.error(e);
      setProducts([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const toolbarClick = (args: any) => {
    if (args.item.id?.includes('excelexport')) gridRef.current?.excelExport();
    if (args.item.id?.includes('pdfexport')) gridRef.current?.pdfExport();
  };

  const nameTemplate = (row: Product) => (
    <Link href={`/products/${row.id}`} className="text-blue-800 font-bold hover:underline">
      {row.productName}
    </Link>
  );

  const statusTemplate = (row: Product) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.isDiscontinued ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
      {row.isDiscontinued ? 'Discontinuo' : 'Activo'}
    </span>
  );

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productsService.deleteProduct(id);
      showToast('Producto Eliminado', 'El producto ha sido removido exitosamente', 'Success');
      fetchProducts();
    } catch (e) {
      showToast('Error', 'No se pudo eliminar el producto', 'Error');
    }
  };

  const handleToggleDiscontinued = async (id: number) => {
    try {
      await productsService.toggleDiscontinued(id);
      showToast('Estado Actualizado', 'El estado del producto ha sido modificado', 'Success');
      fetchProducts();
    } catch (e) {
      showToast('Error', 'No se pudo actualizar el estado', 'Error');
    }
  };

  const actionTemplate = (row: Product) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleToggleDiscontinued(row.id)}
        className={`p-1.5 rounded-md transition-colors ${row.isDiscontinued ? 'text-emerald-600 hover:bg-emerald-50' : 'text-amber-600 hover:bg-amber-50'}`}
        title={row.isDiscontinued ? 'Reactivar' : 'Descontinuar'}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </button>
      <Link href={`/products/${row.id}`} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors">
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
    <AppShell tabTitle="Catálogo de Productos — Sistema Ordenes">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">
            <Link href="/" className="hover:text-blue-600 transition-colors">Inicio</Link>
            <span>/</span>
            <span className="text-slate-600">Catálogo de Productos</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Gestión de Inventario</h1>
          <p className="text-sm text-slate-500 mt-1">Supervise stock, precios y estado de productos en tiempo real.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-800 text-white text-sm font-semibold rounded-lg hover:bg-blue-900 transition-all shadow-sm">
          + Nuevo Producto
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        <GridComponent
          ref={gridRef}
          dataSource={products}
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
              field="productName"
              headerText="Producto"
              width="240"
              template={nameTemplate}
            />
            <ColumnDirective
              field="quantityPerUnit"
              headerText="Empaque"
              width="180"
            />
            <ColumnDirective
              field="unitPrice"
              headerText="Precio Unit."
              width="140"
              format="C2"
              textAlign="Right"
            />
            <ColumnDirective
              field="unitsInStock"
              headerText="Stock"
              width="120"
              textAlign="Right"
              template={(row: Product) => (
                <span className={`font-bold ${row.unitsInStock < 10 ? 'text-red-600' : 'text-slate-700'}`}>
                  {row.unitsInStock}
                </span>
              )}
            />
            <ColumnDirective
              headerText="Estado"
              width="140"
              textAlign="Center"
              template={statusTemplate}
            />
            <ColumnDirective
              headerText="Acciones"
              width="150"
              textAlign="Center"
              template={actionTemplate}
            />
          </ColumnsDirective>
          <Inject services={[Page, Sort, Filter, Group, Search, Toolbar, ExcelExport, PdfExport]} />
        </GridComponent>
      </div>
    </AppShell>
  );
}