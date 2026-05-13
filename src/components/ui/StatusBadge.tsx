import { OrderStatus } from '@/types';

interface StatusBadgeProps {
  status: OrderStatus | string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  Delivered: {
    label: 'Entregado',
    className: 'bg-emerald-100 text-emerald-700',
  },
  Processing: {
    label: 'Procesando',
    className: 'bg-blue-100 text-blue-700',
  },
  Pending: {
    label: 'Pendiente',
    className: 'bg-amber-100 text-amber-700',
  },
  Cancelled: {
    label: 'Cancelado',
    className: 'bg-red-100 text-red-700',
  },
  Sent: {
    label: 'Enviado',
    className: 'bg-teal-100 text-teal-700',
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status] ?? {
    label: status,
    className: 'bg-slate-100 text-slate-600',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70" />
      {config.label}
    </span>
  );
}