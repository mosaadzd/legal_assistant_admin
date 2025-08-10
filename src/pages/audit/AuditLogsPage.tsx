import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { DataTable } from '../../components/ui/DataTable';
import { exportToCsv, exportToJson } from '../../lib/exportUtils';

export default function AuditLogsPage() {
  const [limit, setLimit] = useState(100);
  const [offset, setOffset] = useState(0);
  const [actor, setActor] = useState('');
  const [action, setAction] = useState('');
  const [days, setDays] = useState(30);

  const logsQ = useQuery({ queryKey: ['audit-logs', limit, offset, actor, action, days], queryFn: () => adminApi.auditLogs({ limit, offset, actor: actor||undefined, action: action||undefined, days }) });
  const rows = logsQ.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Audit Logs</h2>
          <p className="text-[12px] text-gray-500">Security-relevant actions (read-only). If empty, backend may not yet implement /admin/audit/logs.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">{logsQ.isFetching && 'Refreshing...'}</div>
      </div>
      <div className="flex flex-wrap gap-3 items-end bg-white/70 backdrop-blur border rounded-lg p-3">
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-gray-500">Actor</label>
          <input value={actor} onChange={e=>{setOffset(0); setActor(e.target.value);}} className="h-8 w-40 border rounded px-2 text-xs" placeholder="email or id" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-gray-500">Action</label>
          <input value={action} onChange={e=>{setOffset(0); setAction(e.target.value);}} className="h-8 w-40 border rounded px-2 text-xs" placeholder="e.g. login" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-gray-500">Days</label>
          <input type="number" value={days} onChange={e=>{setOffset(0); setDays(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
        </div>
        <div>
          <label className="block text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
          <input type="number" value={limit} onChange={e=>{setOffset(0); setLimit(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
        </div>
        <div className="flex gap-2 items-center ml-auto">
          <button disabled={!rows.length} onClick={()=> exportToCsv(rows, [
            { key: 'created_at', header: 'Time' },
            { key: 'actor' },
            { key: 'action' },
            { key: 'resource' },
            { key: 'ip' },
          ], 'audit-logs')} className="h-8 px-3 rounded border text-xs disabled:opacity-40">CSV</button>
          <button disabled={!rows.length} onClick={()=> exportToJson(rows, 'audit-logs')} className="h-8 px-3 rounded border text-xs disabled:opacity-40">JSON</button>
        </div>
      </div>
      <DataTable
        loading={logsQ.isLoading}
        rows={rows}
        columns={[
          { key: 'created_at', header: 'Time', sortable: true, render: r => <span className="whitespace-nowrap text-[10px] text-gray-500">{r.created_at? new Date(r.created_at).toLocaleString(): ''}</span> },
          { key: 'actor', header: 'Actor', sortable: true, render: r => <span className="font-medium text-gray-700">{r.actor}</span> },
          { key: 'action', header: 'Action', sortable: true, render: r => <span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] uppercase tracking-wide">{r.action}</span> },
          { key: 'resource', header: 'Resource', sortable: true },
          { key: 'ip', header: 'IP', sortable: true }
        ]}
        emptyMessage="No audit events found"
        footer={
          <div className="flex items-center justify-end gap-2 p-2 bg-gray-50/70">
            <button disabled={offset===0} onClick={()=>setOffset(o=> Math.max(0,o-limit))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
            <span className="text-[10px] text-gray-500">Offset {offset}</span>
            <button disabled={rows.length < limit} onClick={()=>setOffset(o=> o+limit)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
          </div>
        }
        skeletonRows={10}
      />
    </div>
  );
}
