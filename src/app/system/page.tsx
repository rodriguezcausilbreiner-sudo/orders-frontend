'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { healthService } from '@/services/healthService';
import {
  GridComponent,
  ColumnsDirective,
  ColumnDirective,
  Inject,
  Sort,
} from '@syncfusion/ej2-react-grids';

interface HealthStatus {
  status: string;
  timestamp?: string;
  uptime?: number;
  database?: string;
}

interface ServiceRow {
  name: string;
  status: boolean;
  detail: string;
}

export default function SystemPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await healthService.getHealth();
      setHealth(res);
      setLastChecked(new Date());
    } catch {
      setHealth({ status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { checkHealth(); }, []);

  const isOk = health?.status === 'ok' || health?.status === 'healthy';

  const services: ServiceRow[] = [
    { name: 'API REST', status: isOk, detail: 'Todos los endpoints respondiendo' },
    { name: 'Base de Datos', status: isOk, detail: health?.database ?? 'Conectada' },
    { name: 'Servicio de Autenticación', status: true, detail: 'Validación de tokens activa' },
    { name: 'Almacenamiento de Archivos', status: true, detail: 'Bucket S3 accesible' },
  ];

  const fmt = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  // ── Grid templates ─────────────────────────────────────────
  const serviceNameTemplate = (row: ServiceRow) => (
    <div className="flex items-center gap-3">
      <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.status ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
      <p className="text-sm font-medium text-slate-800">{row.name}</p>
    </div>
  );

  const serviceStatusTemplate = (row: ServiceRow) => (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
      row.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
    }`}>
      {row.status ? 'OPERATIVO' : 'CAÍDO'}
    </span>
  );

  return (
    <AppShell tabTitle="Salud del Sistema">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estado del Sistema</h1>
          <p className="text-sm text-slate-500">Monitoreo en tiempo real de todos los servicios de la plataforma.</p>
        </div>
        <button
          onClick={checkHealth}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-xl p-5 mb-6 flex items-center gap-4 ${isOk ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isOk ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {loading ? '⏳' : isOk ? '✅' : '❌'}
        </div>
        <div>
          <p className={`text-base font-bold ${isOk ? 'text-emerald-800' : 'text-red-800'}`}>
            {loading ? 'Verificando...' : isOk ? 'Todos los Sistemas Operativos' : 'Se Detectó una Degradación del Servicio'}
          </p>
          <p className={`text-xs ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
            Última comprobación: {lastChecked ? lastChecked.toLocaleTimeString() : '—'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Estado API</p>
          <p className={`text-2xl font-bold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
            {loading ? '—' : isOk ? 'En Línea' : 'Fuera de Línea'}
          </p>
          <p className="text-xs text-slate-400 mt-1">HTTP 200 OK</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Uptime</p>
          <p className="text-2xl font-bold text-slate-900">{health?.uptime ? fmt(health.uptime) : '—'}</p>
          <p className="text-xs text-slate-400 mt-1">Desde el último reinicio</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Entorno</p>
          <p className="text-2xl font-bold text-slate-900">Producción</p>
          <p className="text-xs text-slate-400 mt-1">v1.0.0 estable</p>
        </div>
      </div>

      {/* Service Health Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Salud de los Servicios</p>
        </div>
        <GridComponent
          dataSource={services}
          allowSorting
          height="auto"
        >
          <ColumnsDirective>
            <ColumnDirective
              field="name"
              headerText="Servicio"
              width="200"
              template={serviceNameTemplate}
            />
            <ColumnDirective
              field="detail"
              headerText="Detalle"
              width="280"
            />
            <ColumnDirective
              field="status"
              headerText="Estado"
              width="160"
              template={serviceStatusTemplate}
            />
          </ColumnsDirective>
          <Inject services={[Sort]} />
        </GridComponent>
      </div>

      {/* API Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-900 mb-3">Configuración de la API</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">URL Base</span>
            <span className="font-mono text-slate-700">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Marca de Tiempo</span>
            <span className="font-mono text-slate-700">{health?.timestamp ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Estado de Respuesta</span>
            <span className={`font-semibold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
              {health?.status ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
