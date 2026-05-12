'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { productsService } from '@/services/productsService';
import { Product } from '@/types';
import { BreadcrumbComponent } from '@syncfusion/ej2-react-navigations';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const p = await productsService.getProductById(Number(productId));
        setProduct(p);
      } catch {
        router.push('/products');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [productId]);

  if (loading) return <AppShell><LoadingSpinner size="lg" /></AppShell>;
  if (!product) return null;

  const breadcrumbItems = [
    { text: 'Inicio', url: '/' },
    { text: 'Productos', url: '/products' },
    { text: product.productName, url: `/products/${productId}` }
  ];

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(v);

  return (
    <AppShell tabTitle={`${product.productName} — Detalle de Producto`}>
      <div className="mb-6">
        <BreadcrumbComponent items={breadcrumbItems} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left: Product Main Info */}
        <div className="col-span-2 space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
             <div className="flex items-start justify-between mb-8">
               <div className="flex gap-6">
                 <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 text-slate-400">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
                 </div>
                 <div>
                   <h1 className="text-3xl font-black text-slate-900 mb-1">{product.productName}</h1>
                   <p className="text-sm text-slate-500 font-medium">{product.category?.categoryName || 'Sin Categoría'}</p>
                   <div className="flex gap-2 mt-3">
                     <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${product.isDiscontinued ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                       {product.isDiscontinued ? 'Discontinuo' : 'En Catálogo'}
                     </span>
                     <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase">
                       SKU: PRD-{product.id}
                     </span>
                   </div>
                 </div>
               </div>
               <div className="text-right">
                 <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Precio Unitario</p>
                 <p className="text-3xl font-black text-blue-800">{formatCurrency(product.unitPrice)}</p>
               </div>
             </div>

             <div className="grid grid-cols-3 gap-8 py-8 border-t border-slate-100">
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Unidades en Stock</p>
                   <p className="text-xl font-bold text-slate-800">{product.unitsInStock}</p>
                   <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                      <div className={`h-full rounded-full ${product.unitsInStock < 10 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(100, (product.unitsInStock / 100) * 100)}%` }} />
                   </div>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Unidades Pedidas</p>
                   <p className="text-xl font-bold text-slate-800">{product.unitsOnOrder}</p>
                </div>
                <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Punto de Reorden</p>
                   <p className="text-xl font-bold text-slate-800">{product.reorderLevel}</p>
                </div>
             </div>

             <div className="pt-8 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Detalles de Suministro</h3>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Presentación</p>
                      <p className="text-sm font-semibold text-slate-700">{product.quantityPerUnit || 'No especificada'}</p>
                   </div>
                   <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Proveedor</p>
                      <Link href={`/suppliers/${product.supplierId}`} className="text-sm font-semibold text-blue-800 hover:underline">
                         {product.supplier?.companyName || `Proveedor #${product.supplierId}`}
                      </Link>
                   </div>
                </div>
             </div>
           </div>
        </div>

        {/* Right: Actions and Category Info */}
        <div className="space-y-6">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Acciones Críticas</h3>
              <div className="space-y-3">
                 <button className="w-full py-2.5 bg-blue-800 text-white text-sm font-bold rounded-xl hover:bg-blue-900 transition-colors shadow-sm">
                    Editar Producto
                 </button>
                 <button className="w-full py-2.5 border border-slate-200 text-slate-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                    Ajustar Stock
                 </button>
                 <button className="w-full py-2.5 border border-red-100 text-red-600 bg-red-50 text-sm font-bold rounded-xl hover:bg-red-100 transition-colors">
                    Eliminar Producto
                 </button>
              </div>
           </div>

           <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-6 text-white shadow-lg overflow-hidden relative">
              <div className="relative z-10">
                <h3 className="text-sm font-bold mb-4 opacity-80">Categoría: {product.category?.categoryName || 'General'}</h3>
                <p className="text-xs leading-relaxed opacity-90 italic">
                  "{product.category?.description || 'No hay descripción disponible para esta categoría de productos.'}"
                </p>
              </div>
              <svg className="absolute -bottom-4 -right-4 w-24 h-24 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
           </div>
        </div>
      </div>
    </AppShell>
  );
}
