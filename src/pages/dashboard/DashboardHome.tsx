import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { Link } from 'react-router-dom';

export default function DashboardHome() {
  const metricsQ = useQuery({ queryKey: ['metrics-summary'], queryFn: () => adminApi.metricsSummary(), retry: false, refetchInterval: 60_000 });
  const m = metricsQ.data;
  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold tracking-tight">Dashboard</h2>
        <div className="flex gap-2 text-[11px] text-gray-500">{metricsQ.isFetching && 'Refreshing...'}</div>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[{
          k:'total_users', label:'Total Users', value: m?.total_users
        },{
          k:'active_24h', label:'Active (24h)', value: m?.active_24h
        },{
          k:'tokens_24h', label:'Tokens (24h)', value: m?.tokens_24h
        },{
          k:'calls_24h', label:'API Calls (24h)', value: m?.calls_24h
        }].map(card => (
          <div key={card.k} className="relative rounded-xl border bg-white/70 backdrop-blur p-4 flex flex-col shadow-sm">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">{card.label}</div>
            <div className="mt-2 text-3xl font-bold text-gray-800">{metricsQ.isLoading? <span className="animate-pulse text-gray-300">•••</span>: (card.value ?? 0).toLocaleString()}</div>
          </div>
        ))}
        <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex flex-col col-span-2 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Plans</div>
            <Link to="/plans" className="text-[10px] text-brand-600 hover:underline">Manage</Link>
          </div>
          <div className="mt-1 space-y-1 text-xs">
            {metricsQ.isLoading && <div className="animate-pulse h-3 rounded bg-gray-200 w-1/2" />}
            {!metricsQ.isLoading && m && Object.entries(m.plan_counts).map(([plan,c]) => {
              const count = c as number;
              return <div key={plan} className="flex items-center justify-between"><span className="font-medium text-gray-700">{plan}</span><span className="text-gray-500">{count}</span></div>;
            })}
          </div>
        </div>
      </div>
      <div className="flex">
        <Link to="/dashboard/usage" className="text-xs px-3 py-2 rounded border bg-white hover:bg-brand-50 transition">View detailed usage analytics →</Link>
      </div>
    </div>
  );
}
