import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend } from 'recharts';

export default function RevenueAnalyticsPage() {
  const [days, setDays] = useState(30);
  const summaryDayQ = useQuery({ queryKey: ['rev-summary-day', days], queryFn: () => adminApi.revenueSummary(days, 'day') });
  const summaryPlanQ = useQuery({ queryKey: ['rev-summary-plan', days], queryFn: () => adminApi.revenueSummary(days, 'plan') });
  const avgQ = useQuery({ queryKey: ['rev-avg', days], queryFn: () => adminApi.revenueAverage(days) });
  const cumulativeQ = useQuery({ queryKey: ['rev-cumulative', days], queryFn: () => adminApi.revenueCumulative(days) });

  const dayRows = summaryDayQ.data?.rows || [];
  const planRows = summaryPlanQ.data?.rows || [];
  const cumSeries = cumulativeQ.data?.series || [];
  const avg = avgQ.data?.average_amount_cents_per_user || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-xl font-semibold">Revenue Analytics</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-gray-600">Window:</label>
          <select value={days} onChange={e=>setDays(parseInt(e.target.value))} className="h-9 border rounded-md px-2">
            <option value={7}>7d</option>
            <option value={14}>14d</option>
            <option value={30}>30d</option>
            <option value={60}>60d</option>
            <option value={90}>90d</option>
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Daily Revenue</h3>
            {summaryDayQ.isFetching && <span className="text-[10px] text-gray-400">Refreshing...</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v:any)=>[(v/100).toFixed(2)+' EGP','Amount']} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                <Bar dataKey="amount_cents" fill="#0c6cf4" name="Amount (cents)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Revenue by Plan</h3>
            {summaryPlanQ.isFetching && <span className="text-[10px] text-gray-400">Refreshing...</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={planRows}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="plan_key" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v:any)=>[(v/100).toFixed(2)+' EGP','Amount']} />
                <Legend />
                <Bar dataKey="amount_cents" fill="#2b8cff" name="Amount (cents)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Average Revenue / User</h3>
            {avgQ.isFetching && <span className="text-[10px] text-gray-400">Refreshing...</span>}
          </div>
          <div className="text-4xl font-semibold tracking-tight">{(avg/100).toFixed(2)} <span className="text-lg font-normal ml-1">EGP</span></div>
          <p className="text-[12px] text-gray-500 mt-2">Across {(avgQ.data?.distinct_users||0)} paying users in last {days} days.</p>
        </div>
        <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium text-sm">Cumulative Revenue</h3>
            {cumulativeQ.isFetching && <span className="text-[10px] text-gray-400">Refreshing...</span>}
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumSeries}>
                <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip formatter={(v:any)=>[(v/100).toFixed(2)+' EGP','Cumulative']} />
                <Line type="monotone" dataKey="cumulative_amount_cents" stroke="#0656d1" strokeWidth={2} dot={false} name="Cumulative (cents)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
