import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../lib/apiClient';
import { ShieldCheck, KeyRound, RefreshCcw } from 'lucide-react';

export default function PaymobConfigPage() {
  const qc = useQueryClient();
  const cfgQ = useQuery({ queryKey: ['paymob-config'], queryFn: () => adminApi.getPaymobConfig() });
  const [form, setForm] = useState({ api_key: '', integration_id: '', iframe_id: '', hmac_secret: '' });

  // Reset form when config changes (do not pre-fill secrets)
  useEffect(() => {
    if (cfgQ.data) {
      setForm(f => ({ ...f, integration_id: cfgQ.data.integration_id || '', iframe_id: cfgQ.data.iframe_id || '' }));
    }
  }, [cfgQ.data]);

  const mut = useMutation({
    mutationFn: (p: any) => adminApi.updatePaymobConfig(p),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['paymob-config'] }); },
  });

  const cfg = cfgQ.data;
  const loading = cfgQ.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">PayMob Configuration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">Manage encrypted PayMob payment gateway credentials. Secrets are stored encrypted at rest; leaving a secret field blank preserves the currently stored value.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-5 space-y-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-md flex items-center justify-center ${cfg?.configured ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-300' : 'bg-red-100 text-red-600 dark:bg-red-600/20 dark:text-red-300'}`}> <ShieldCheck className="h-5 w-5" /> </div>
            <div>
              <div className="text-sm font-medium">Status: <span className={cfg?.configured ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>{cfg?.configured ? 'Configured' : 'Not Configured'}</span></div>
              <div className="text-[11px] text-gray-500 dark:text-gray-400">Latest credentials snapshot</div>
            </div>
          </div>
          <ul className="text-xs font-mono bg-gray-50 dark:bg-gray-800/50 rounded p-3 space-y-1 border border-gray-200 dark:border-gray-700">
            <li>API Key: {cfg?.api_key ? '•••' : '—'}</li>
            <li>Integration ID: {cfg?.integration_id || '—'}</li>
            <li>Iframe ID: {cfg?.iframe_id || '—'}</li>
            <li>HMAC Secret: {cfg?.hmac_secret ? '•••' : '—'}</li>
            <li>Encryption: {cfg?.encryption ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active</span> : <span className="text-amber-600 dark:text-amber-400">Disabled</span>}</li>
            {cfg?.legacy_keys !== undefined && <li>Legacy Keys: {cfg.legacy_keys}</li>}
            <li>Updated At: {cfg?.updated_at ? new Date(cfg.updated_at).toLocaleString() : '—'}</li>
            <li>Updated By: {cfg?.updated_by || '—'}</li>
          </ul>
          <button onClick={() => qc.invalidateQueries({ queryKey: ['paymob-config'] })} disabled={cfgQ.isFetching} className="inline-flex items-center gap-2 h-8 px-3 rounded-md text-[11px] font-medium border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-brand-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 disabled:opacity-40">
            <RefreshCcw className="h-3.5 w-3.5" /> Refresh
          </button>
        </div>

        <form onSubmit={e => { e.preventDefault(); mut.mutate(form); }} className="rounded-lg border border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/70 backdrop-blur p-6 space-y-6 shadow-sm">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-semibold">Update Credentials</h2>
          </div>
          {loading && <div className="text-xs text-gray-500">Loading current config...</div>}
          <div className="grid sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">API Key</label>
              <input type="text" value={form.api_key} onChange={e=>setForm(f=>({...f, api_key:e.target.value}))} placeholder="Leave blank to keep existing" className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Integration ID</label>
              <input type="text" value={form.integration_id} onChange={e=>setForm(f=>({...f, integration_id:e.target.value}))} className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">Iframe ID</label>
              <input type="text" value={form.iframe_id} onChange={e=>setForm(f=>({...f, iframe_id:e.target.value}))} className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-wide text-gray-500 dark:text-gray-400">HMAC Secret</label>
              <input type="text" value={form.hmac_secret} onChange={e=>setForm(f=>({...f, hmac_secret:e.target.value}))} placeholder="Leave blank to keep existing" className="h-9 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white/70 dark:bg-gray-800 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={mut.isPending} className="h-9 px-5 rounded-md bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white text-sm font-medium shadow">
              {mut.isPending ? 'Saving…' : 'Save / Update'}
            </button>
            {mut.isSuccess && <span className="text-xs text-emerald-600 dark:text-emerald-400">Saved</span>}
            {mut.isError && <span className="text-xs text-red-600 dark:text-red-400">Error saving</span>}
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">Security: Secrets are encrypted before storage when an encryption key is configured. To rotate a secret, paste the new value and save. To leave it unchanged, keep the field blank.</p>
        </form>
      </div>
    </div>
  );
}
