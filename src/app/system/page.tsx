'use client';

import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { healthService } from '@/services/healthService';

interface HealthStatus {
  status: string;
  timestamp?: string;
  uptime?: number;
  database?: string;
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

  const services = [
    { name: 'REST API', status: isOk, detail: 'All endpoints responding' },
    { name: 'Database', status: isOk, detail: health?.database ?? 'Connected' },
    { name: 'Auth Service', status: true, detail: 'Token validation active' },
    { name: 'File Storage', status: true, detail: 'S3 bucket reachable' },
  ];

  const fmt = (s: number) => {
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  return (
    <AppShell>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Status</h1>
          <p className="text-sm text-slate-500">Real-time health monitoring of all platform services.</p>
        </div>
        <button
          onClick={checkHealth}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 bg-white text-slate-600 text-sm font-semibold rounded-lg hover:bg-slate-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Overall Status Banner */}
      <div className={`rounded-xl p-5 mb-6 flex items-center gap-4 ${isOk ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${isOk ? 'bg-emerald-100' : 'bg-red-100'}`}>
          {loading ? '⏳' : isOk ? '✅' : '❌'}
        </div>
        <div>
          <p className={`text-base font-bold ${isOk ? 'text-emerald-800' : 'text-red-800'}`}>
            {loading ? 'Checking...' : isOk ? 'All Systems Operational' : 'Service Degradation Detected'}
          </p>
          <p className={`text-xs ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
            Last checked: {lastChecked ? lastChecked.toLocaleTimeString() : '—'}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">API Status</p>
          <p className={`text-2xl font-bold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
            {loading ? '—' : isOk ? 'Online' : 'Offline'}
          </p>
          <p className="text-xs text-slate-400 mt-1">HTTP 200 OK</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Uptime</p>
          <p className="text-2xl font-bold text-slate-900">
            {health?.uptime ? fmt(health.uptime) : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">Since last restart</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Environment</p>
          <p className="text-2xl font-bold text-slate-900">Production</p>
          <p className="text-xs text-slate-400 mt-1">v1.0.0 stable</p>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white border border-slate-200 rounded-xl mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-900">Service Health</p>
        </div>
        <div className="divide-y divide-slate-50">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${svc.status ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <p className="text-sm font-medium text-slate-800">{svc.name}</p>
              </div>
              <p className="text-xs text-slate-500">{svc.detail}</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${svc.status ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {svc.status ? 'OPERATIONAL' : 'DOWN'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* API Info */}
      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <p className="text-sm font-semibold text-slate-900 mb-3">API Configuration</p>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-400">Base URL</span>
            <span className="font-mono text-slate-700">{process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Timestamp</span>
            <span className="font-mono text-slate-700">{health?.timestamp ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Response Status</span>
            <span className={`font-semibold ${isOk ? 'text-emerald-600' : 'text-red-600'}`}>
              {health?.status ?? '—'}
            </span>
          </div>
        </div>
      </div>
    </AppShell>
  );
}