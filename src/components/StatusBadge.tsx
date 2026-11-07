import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
  dot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', dot = true }) => {
  const normalized = status?.toLowerCase() || '';

  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-400';

  if (['active', 'approved', 'verified', 'present', 'resolved', 'closed'].includes(normalized)) {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
    dotColor = 'bg-emerald-500';
  } else if (['pending', 'pending verification', 'investigating', 'repair in progress', 'half day', 'low'].includes(normalized)) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    dotColor = 'bg-amber-500';
  } else if (['late', 'medium', 'on leave'].includes(normalized)) {
    colorClasses = 'bg-sky-50 text-sky-700 border-sky-200';
    dotColor = 'bg-sky-500';
  } else if (['high'].includes(normalized)) {
    colorClasses = 'bg-orange-50 text-orange-700 border-orange-200';
    dotColor = 'bg-orange-500';
  } else if (['critical', 'rejected', 'terminated', 'suspended', 'absent', 'expired'].includes(normalized)) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    dotColor = 'bg-rose-500 animate-pulse';
  } else if (['detected'].includes(normalized)) {
    colorClasses = 'bg-purple-50 text-purple-700 border-purple-200';
    dotColor = 'bg-purple-500';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {status}
    </span>
  );
};

export default StatusBadge;
