import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';

interface PendingItem {
  id: string;
  user_id: string;
  user_email?: string;
  user_name?: string;
  plan_key: string;
  amount_cents: number;
  currency: string;
  order_id?: number;
  status: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  transaction_id?: number;
  card_pan?: string;
  payment_method?: string;
  failure_reason?: string;
}

export default function PendingPaymentsPage() {
  const qc = useQueryClient();
  const checkAll = useMutation({
    mutationFn: (limit: number) => adminApi.checkAllPending(limit),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-payments'] }); }
  });
  const checkOne = useMutation({
    mutationFn: (order_id: number) => adminApi.checkPendingOrder(order_id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['pending-payments'] }); }
  });
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const query = useQuery({
    queryKey: ['pending-payments', status, search],
    queryFn: () => adminApi.pendingPayments({ status: status || undefined, user_search: search || undefined })
  });
  const data = (query.data as any) || { items: [], total: 0 };
  const failedCount = data.items.filter((p: PendingItem)=>p.status==='failed').length;
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Pending / Recent Payments</h2>
          <p className="text-[12px] text-gray-500">Track PayMob checkout attempts and statuses.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <Link to="/payments/revenue" className="inline-flex items-center h-8 px-3 rounded-md bg-blue-600 text-white text-xs font-medium shadow hover:bg-blue-700 transition" title="View revenue analytics & aggregates">Revenue Analytics →</Link>
          {query.isFetching && <span>Refreshing...</span>}
          {failedCount>0 && <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-100 text-red-700 font-medium">Failed: {failedCount}</span>}
          <button onClick={()=>checkAll.mutate(50)} disabled={checkAll.status==='pending'} className="h-8 px-3 rounded-md bg-emerald-600 text-white text-xs font-medium shadow hover:bg-emerald-700 transition disabled:opacity-50" title="Run inquiry on pending payments">{checkAll.status==='pending'? 'Checking…':'Check All Pending'}</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="h-9 border rounded px-2 text-sm">
            <option value=''>All</option>
            <option value='pending'>Pending</option>
            <option value='paid'>Paid</option>
            <option value='failed'>Failed</option>
            <option value='canceled'>Canceled</option>
            <option value='expired'>Expired</option>
          </select>
        </div>
        <div className="flex flex-col">
          <label className="text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">User Email</label>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="user@domain" className="h-9 border rounded px-2 text-sm" />
        </div>
        <button onClick={()=>setStatus('failed')} className="h-9 px-3 rounded bg-red-600 text-white text-xs font-medium shadow hover:bg-red-700 transition" title="Show only failed payments">Failed</button>
        <button onClick={()=>setStatus('pending')} className="h-9 px-3 rounded bg-amber-500 text-white text-xs font-medium shadow hover:bg-amber-600 transition" title="Show only pending payments">Pending</button>
        <button onClick={()=>setStatus('')} className="h-9 px-3 rounded bg-gray-200 text-gray-800 text-xs font-medium shadow hover:bg-gray-300 transition" title="Reset filters">All</button>
      </div>
      <div className="overflow-auto border rounded-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-wide text-gray-500">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Plan</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">Actions</th>
              <th className="p-2 text-left">Order</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-left">Created</th>
              <th className="p-2 text-left">Paid At</th>
              <th className="p-2 text-left">Txn</th>
              <th className="p-2 text-left">Method</th>
              <th className="p-2 text-left">Card</th>
              <th className="p-2 text-left">Failure</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((p: PendingItem) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-2 font-mono text-[11px]">{p.user_id}</td>
                <td className="p-2">{p.plan_key}</td>
                <td className="p-2">{(p.amount_cents/100).toFixed(2)} {p.currency}</td>
                  <td className="p-2 text-[11px]">
                    <div className="flex flex-col">
                      <span className="font-medium text-gray-700 text-[11px]">{p.user_name || '—'}</span>
                      <span className="text-[10px] text-gray-500">{p.user_email || p.user_id}</span>
                    </div>
                  </td>
                <td className="p-2">{p.order_id || '—'}</td>
                <td className="p-2"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${p.status==='paid'?'bg-green-100 text-green-700': p.status==='failed'? 'bg-red-200 border border-red-400 text-red-800': p.status==='pending' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'}`}>{p.status}</span></td>
                <td className="p-2 text-[11px]">{new Date(p.created_at).toLocaleString()}</td>
                <td className="p-2 text-[11px]">{p.paid_at? new Date(p.paid_at).toLocaleString(): '—'}</td>
                <td className="p-2 text-[11px]">{p.transaction_id || '—'}</td>
                <td className="p-2 text-[11px]">{p.payment_method || '—'}</td>
                <td className="p-2 text-[11px]">{p.card_pan || '—'}</td>
                <td className="p-2 text-[10px] max-w-[160px] truncate" title={p.failure_reason || ''}>{p.failure_reason || '—'}</td>
                  <td className="p-2 text-[10px] space-x-1">
                    {p.order_id && p.status==='pending' && (
                      <button onClick={()=>checkOne.mutate(p.order_id!)} disabled={checkOne.status==='pending'} className="px-2 py-1 rounded bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50">{checkOne.status==='pending'? '...':'Check'}</button>
                    )}
                    <Link to={`/payments/pending/${p.id}`} className="px-2 py-1 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 inline-block">View</Link>
                  </td>
              </tr>
            ))}
            {data.items.length === 0 && !query.isLoading && (
              <tr><td colSpan={13} className="p-6 text-center text-xs text-gray-500">No records found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
