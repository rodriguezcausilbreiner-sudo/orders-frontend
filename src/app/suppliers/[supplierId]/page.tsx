'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { suppliersService } from '@/services/suppliersService';
import { Supplier, Product } from '@/types';
import { TabComponent, TabItemDirective, TabItemsDirective } from '@syncfusion/ej2-react-navigations';
import { GridComponent, ColumnsDirective, ColumnDirective, Page, Sort, Filter, Inject, Toolbar, ToolbarItems } from '@syncfusion/ej2-react-grids';

export default function SupplierDetailPage() {
  const { supplierId } = useParams();
  const router = useRouter();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [s, p] = await Promise.all([
          suppliersService.getSupplierById(Number(supplierId)),
          suppliersService.getSupplierProducts(Number(supplierId)),
        ]);
        setSupplier(s);
        setProducts(p);
      } catch {
        router.push('/suppliers');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [supplierId]);

  if (loading) return <AppShell><LoadingSpinner size="lg" /></AppShell>;
  if (!supplier) return null;

  const headerContent = (
    <div className="flex items-center gap-4 mb-6">
      <Link href="/suppliers" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
        <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </Link>
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{supplier.companyName}</h1>
        <p className="text-sm text-slate-500">Proveedor ID: #{supplier.id} — {supplier.country}</p>
      </div>
    </div>
  );

  const infoTab = (
    <div className="p-6 grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Información de Contacto</h3>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Persona de Contacto</p>
              <p className="text-sm font-semibold text-slate-800">{supplier.contactName}</p>
              <p className="text-xs text-slate-500">{supplier.contactTitle}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Teléfono</p>
              <p className="text-sm font-semibold text-slate-800">{supplier.phone}</p>
            </div>
            {supplier.fax && (
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Fax</p>
                <p className="text-sm font-semibold text-slate-800">{supplier.fax}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Ubicación y Dirección</h3>
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">Dirección</p>
              <p className="text-sm text-slate-800">{supplier.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Ciudad</p>
                <p className="text-sm text-slate-800">{supplier.city}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Código Postal</p>
                <p className="text-sm text-slate-800">{supplier.postalCode}</p>
              </div>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase">País / Región</p>
              <p className="text-sm text-slate-800">{supplier.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const productsTab = (
    <div className="p-4">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Catálogo de Productos ({products.length})</h3>
        <p className="text-xs text-slate-500">Lista completa de productos suministrados por este proveedor.</p>
      </div>
      <GridComponent
        dataSource={products}
        allowPaging
        allowSorting
        pageSettings={{ pageSize: 8 }}
        toolbar={['Search'] as ToolbarItems[]}
      >
        <ColumnsDirective>
          <ColumnDirective field="id" headerText="ID" width="80" textAlign="Center" />
          <ColumnDirective field="productName" headerText="Nombre del Producto" width="250" />
          <ColumnDirective field="quantityPerUnit" headerText="Presentación" width="200" />
          <ColumnDirective field="unitPrice" headerText="Precio Unit." width="150" format="C2" textAlign="Right" />
          <ColumnDirective field="unitsInStock" headerText="Stock" width="120" textAlign="Right" />
          <ColumnDirective 
            field="isDiscontinued" 
            headerText="Estado" 
            width="130" 
            textAlign="Center"
            template={(row: Product) => (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${row.isDiscontinued ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                {row.isDiscontinued ? 'Discontinuo' : 'Activo'}
              </span>
            )}
          />
        </ColumnsDirective>
        <Inject services={[Page, Sort, Filter, Toolbar]} />
      </GridComponent>
    </div>
  );

  return (
    <AppShell tabTitle={`${supplier.companyName} — Detalle`}>
      {headerContent}

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <TabComponent id="supplier-tabs" height="auto">
          <TabItemsDirective>
            <TabItemDirective
              header={{ text: 'Información General' }}
              content={() => infoTab}
            />
            <TabItemDirective
              header={{ text: `Catálogo de Productos (${products.length})` }}
              content={() => productsTab}
            />
          </TabItemsDirective>
        </TabComponent>
      </div>
    </AppShell>
  );
}
