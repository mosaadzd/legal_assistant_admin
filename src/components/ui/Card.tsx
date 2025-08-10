import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}

export function Card({ title, subtitle, actions, children, className = '', padded = true }: CardProps) {
  return (
    <div className={`group relative rounded-xl border border-gray-200 bg-white/80 backdrop-blur shadow-sm hover:shadow transition ${className}`}>
      {(title || actions) && (
        <div className={`flex items-start justify-between gap-4 ${padded? 'px-4 pt-4':'px-4 pt-3'}`}>
          <div>
            {title && <h3 className="text-sm font-semibold text-gray-800 tracking-tight">{title}</h3>}
            {subtitle && <p className="text-[11px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={`${padded? 'p-4 pt-3':'p-3'} space-y-3`}>{children}</div>
    </div>
  );
}

export function StatGrid({ items }: { items: { label: string; value: string | number; hint?: string }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
      {items.map(i => (
        <div key={i.label} className="rounded-lg border border-gray-200 bg-gray-50/60 px-3 py-2">
          <div className="text-[10px] uppercase tracking-wide text-gray-500 font-medium">{i.label}</div>
          <div className="text-sm font-semibold text-gray-800">{i.value}</div>
          {i.hint && <div className="text-[10px] text-gray-400 mt-0.5">{i.hint}</div>}
        </div>
      ))}
    </div>
  );
}
