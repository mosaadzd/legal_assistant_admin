import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#2b8cff', '#56acff', '#0c6cf4', '#0656d1', '#0846a6', '#0d3d82'];

export default function UsageAnalyticsPage() {
  const [days, setDays] = useState(30);
  const byServiceQ = useQuery({ queryKey: ['usage-by-service', days], queryFn: () => adminApi.globalUsageByService(days) });
  const dailyQ = useQuery({ queryKey: ['usage-daily', days], queryFn: () => adminApi.globalUsageDaily(days) });

  const serviceData = (byServiceQ.data?.by_service || []).map((s: any, idx: number) => ({
    service: s.service,
    total_tokens: s.total_tokens,
    prompt_tokens: s.prompt_tokens,
    output_tokens: s.output_tokens,
    calls: s.calls,
    fill: COLORS[idx % COLORS.length]
  }));

  const dailyData = dailyQ.data?.daily || [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Usage Analytics</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Window:</label>
            <select value={days} onChange={e=>setDays(parseInt(e.target.value))} className="h-9 border rounded-md px-2 focus:ring-brand-500 focus:border-brand-500">
              <option value={7}>7d</option>
              <option value={14}>14d</option>
              <option value={30}>30d</option>
              <option value={60}>60d</option>
              <option value={90}>90d</option>
            </select>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Tokens by Service</h3>
            {byServiceQ.isFetching && <span className="text-[10px] text-gray-400">Refreshing...</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceData}>
                <XAxis dataKey="service" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Legend />
                <Bar dataKey="total_tokens" fill="#2b8cff" name="Total Tokens" />
                <Bar dataKey="calls" fill="#56acff" name="Calls" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Service Share (Tokens)</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={serviceData} dataKey="total_tokens" nameKey="service" innerRadius={50} outerRadius={80} paddingAngle={4}>
                  {serviceData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm">Daily Tokens & Calls</h3>
          {dailyQ.isFetching && <span className="text-[10px] text-gray-400">Refreshing...</span>}
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Legend />
              <Bar dataKey="total_tokens" fill="#0c6cf4" name="Total Tokens" />
              <Bar dataKey="calls" fill="#56acff" name="Calls" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
