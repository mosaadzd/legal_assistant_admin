import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { Card } from '../../components/ui/Card';
import { useToast } from '../../context/ToastContext';

interface PlanFormState {
  key: string;
  name: string;
  tagline?: string;
  name_en?: string;
  name_ar?: string;
  tagline_en?: string;
  tagline_ar?: string;
  price_monthly?: string;
  monthly_api_quota: number;
  monthly_tokens_quota: number;
  trial_days: number;
  description?: string;
  description_en?: string;
  description_ar?: string;
  features: Record<string, boolean>;
}

const emptyPlan = (): PlanFormState => ({ key: '', name: '', tagline: '', name_en: '', name_ar: '', tagline_en: '', tagline_ar: '', price_monthly: '', monthly_api_quota: 0, monthly_tokens_quota: 0, trial_days: 0, description: '', description_en: '', description_ar: '', features: {} });

export default function PlansPage() {
  const qc = useQueryClient();
  const { push } = useToast();
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<PlanFormState>(emptyPlan());
  // lock body scroll when modal open
  useEffect(() => {
    if (showForm) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [showForm]);
  const plansQ = useQuery({ queryKey: ['plans'], queryFn: () => adminApi.plans() });
  const plansEntries = Object.entries(plansQ.data || {});

  const createMut = useMutation({
    mutationFn: (p: any) => adminApi.createPlan(p),
    onSuccess: () => { push({ message:'Plan created', type:'success'}); qc.invalidateQueries({queryKey:['plans']}); setShowForm(false); setForm(emptyPlan()); },
    onError: () => push({ message:'Failed to create plan', type:'error'})
  });
  const updateMut = useMutation({
    mutationFn: ({ key, data }: any) => adminApi.updatePlan(key, data),
    onSuccess: () => { push({ message:'Plan updated', type:'success'}); qc.invalidateQueries({queryKey:['plans']}); setShowForm(false); setEditingKey(null); },
    onError: () => push({ message:'Failed to update', type:'error'})
  });
  const deleteMut = useMutation({
    mutationFn: (key: string) => adminApi.deletePlan(key),
    onSuccess: () => { push({ message:'Plan deleted', type:'success'}); qc.invalidateQueries({queryKey:['plans']}); },
    onError: () => push({ message:'Delete failed', type:'error'})
  });

  function openCreate() { setForm(emptyPlan()); setEditingKey(null); setShowForm(true); }
  function openEdit(key: string, cfg: any) { setEditingKey(key); setForm({ key, name: (cfg.name || key.charAt(0).toUpperCase()+key.slice(1)), tagline: cfg.tagline || '', name_en: cfg.name_en || '', name_ar: cfg.name_ar || '', tagline_en: cfg.tagline_en || '', tagline_ar: cfg.tagline_ar || '', price_monthly: cfg.price_monthly, monthly_api_quota: cfg.monthly_api_quota, monthly_tokens_quota: cfg.monthly_tokens_quota, trial_days: cfg.trial_days || 0, description: cfg.description || '', description_en: cfg.description_en || '', description_ar: cfg.description_ar || '', features: { ...cfg.features } }); setShowForm(true); }
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (editingKey) {
      const { key: _k, ...rest } = form;
  const data: any = { ...rest };
      if (data.price_monthly === '' || data.price_monthly === undefined) {
        delete data.price_monthly; // don't send empty string
      } else if (typeof data.price_monthly === 'string') {
        const num = Number(data.price_monthly);
        if (!isNaN(num)) data.price_monthly = num; else delete data.price_monthly;
      }
      updateMut.mutate({ key: editingKey, data });
    } else {
  const payload: any = { ...form, key: form.key.trim().toLowerCase() };
      if (payload.price_monthly === '' || payload.price_monthly === undefined) {
        delete payload.price_monthly;
      } else if (typeof payload.price_monthly === 'string') {
        const num = Number(payload.price_monthly); if (!isNaN(num)) payload.price_monthly = num; else delete payload.price_monthly;
      }
      createMut.mutate(payload);
    }
  }
  function toggleFeature(k: string) { setForm(f=> ({ ...f, features: { ...f.features, [k]: !f.features[k] } })); }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Plans & Pricing</h2>
          <p className="text-[12px] text-gray-500">Dynamic plans (persisted). Fallback to static catalog if none exist.</p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <button onClick={openCreate} className="h-8 px-3 rounded-md bg-brand-600 text-white text-xs font-medium hover:bg-brand-700">New Plan</button>
          {plansQ.isFetching && 'Refreshing...'}
        </div>
      </div>
      {plansQ.isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({length:4}).map((_,i)=>(<div key={i} className="animate-pulse h-56 rounded-xl bg-gray-100" />))}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {plansEntries.map(([name, cfg]: any) => {
          const feats = Object.entries(cfg.features||{}).slice(0, 6);
          const subtitle = (cfg.tagline ? cfg.tagline : null) || (cfg.description || '');
          return (
            <Card key={name} title={cfg.name || name} subtitle={subtitle} className="relative">
              <div className="text-2xl font-bold text-brand-600">{cfg.price_monthly ? '$'+cfg.price_monthly : 'Free'}</div>
              <div className="text-[11px] text-gray-500 mb-2">{cfg.price_monthly? '/month':''}</div>
              <ul className="space-y-1.5 mb-2">
                {feats.map(([k,v]) => (
                  <li key={k} className="flex items-center gap-2 text-[11px]">
                    <span className={`h-2 w-2 rounded-full ${v? 'bg-green-500':'bg-gray-300'}`}></span>
                    <span className="font-medium text-gray-700 truncate">{k}</span>
                  </li>
                ))}
              </ul>
              <div className="grid grid-cols-2 gap-2 text-[10px] mt-auto">
                <div className="px-2 py-1 rounded bg-gray-100 text-gray-600">Tokens: {cfg.monthly_tokens_quota ?? '—'}</div>
                <div className="px-2 py-1 rounded bg-gray-100 text-gray-600">Calls: {cfg.monthly_api_quota ?? '—'}</div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                <button onClick={()=>openEdit(name, cfg)} className="h-6 px-2 rounded bg-gray-100 text-[10px] hover:bg-brand-50">Edit</button>
                <button disabled={deleteMut.status==='pending'} onClick={()=>{ if (confirm('Delete plan '+name+'?')) deleteMut.mutate(name); }} className="h-6 px-2 rounded bg-gray-100 text-[10px] hover:bg-red-50 hover:text-red-600 disabled:opacity-40">Del</button>
              </div>
            </Card>
          );
        })}
        {!plansQ.isLoading && plansEntries.length === 0 && (
          <div className="text-sm text-gray-500">No plans defined. Create one.</div>
        )}
      </div>

      {showForm && createPortal(
        <div className="fixed inset-0 z-[200] flex items-start md:items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 flex flex-col max-h-[90vh] animate-scale-in">
            <div className="flex items-start justify-between gap-6 px-6 pt-6 pb-4 border-b">
              <div>
                <h3 className="text-xl font-semibold tracking-tight">{editingKey? 'Edit Plan':'Create Plan'}</h3>
                <p className="text-xs text-gray-500 mt-1">Configure quotas, pricing and feature flags for this plan.</p>
              </div>
              <button onClick={()=>{ setShowForm(false); setEditingKey(null); }} className="h-8 px-3 rounded-md text-xs font-medium border bg-gray-50 hover:bg-gray-100 text-gray-600">Close</button>
            </div>
            <form id="planForm" onSubmit={submit} className="flex-1 overflow-y-auto px-6 pb-6 pt-4">
              <div className="grid gap-8 md:grid-cols-5">
                <div className="md:col-span-3 space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    {!editingKey && (
                      <div>
                        <label className="flex items-center justify-between text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Plan Key<span className="text-red-500 ml-1">*</span></label>
                        <input required value={form.key} onChange={e=>setForm(f=>({...f,key:e.target.value}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="basic" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Name</label>
                      <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="Friendly display name" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Tagline</label>
                      <input value={form.tagline} onChange={e=>setForm(f=>({...f,tagline:e.target.value}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="Short marketing line" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Name (EN)</label>
                      <input value={form.name_en} onChange={e=>setForm(f=>({...f,name_en:e.target.value}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="English name" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Name (AR)</label>
                      <input value={form.name_ar} onChange={e=>setForm(f=>({...f,name_ar:e.target.value}))} dir="rtl" className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="الاسم" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Tagline (EN)</label>
                      <input value={form.tagline_en} onChange={e=>setForm(f=>({...f,tagline_en:e.target.value}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="Short line" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Tagline (AR)</label>
                      <input value={form.tagline_ar} onChange={e=>setForm(f=>({...f,tagline_ar:e.target.value}))} dir="rtl" className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="سطر تسويقي" />
                    </div>
                    {editingKey && (
                      <div>
                        <label className="flex items-center justify-between text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Plan Key</label>
                        <input value={editingKey} disabled className="w-full h-10 border rounded-md px-3 text-sm bg-gray-100 text-gray-500" />
                      </div>
                    )}
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Monthly API Quota</label>
                      <input min={0} type="number" value={form.monthly_api_quota} onChange={e=>setForm(f=>({...f,monthly_api_quota:Number(e.target.value)}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="100" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Monthly Tokens Quota</label>
                      <input min={0} type="number" value={form.monthly_tokens_quota} onChange={e=>setForm(f=>({...f,monthly_tokens_quota:Number(e.target.value)}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="50000" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Trial Days</label>
                      <input min={0} type="number" value={form.trial_days} onChange={e=>setForm(f=>({...f,trial_days:Number(e.target.value)}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="0" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Price Monthly (USD)</label>
                      <input value={form.price_monthly} onChange={e=>setForm(f=>({...f,price_monthly:e.target.value}))} className="w-full h-10 border rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500" placeholder="e.g. 9.99" />
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Description (Default)</label>
                      <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} className="w-full min-h-[110px] border rounded-md px-3 py-2 text-sm resize-y focus:ring-brand-500 focus:border-brand-500" placeholder="Short description" />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Description (EN)</label>
                      <textarea value={form.description_en} onChange={e=>setForm(f=>({...f,description_en:e.target.value}))} className="w-full min-h-[110px] border rounded-md px-3 py-2 text-sm resize-y focus:ring-brand-500 focus:border-brand-500" placeholder="English description" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[11px] font-medium text-gray-600 mb-1 uppercase tracking-wide">Description (AR)</label>
                      <textarea value={form.description_ar} onChange={e=>setForm(f=>({...f,description_ar:e.target.value}))} dir="rtl" className="w-full min-h-[110px] border rounded-md px-3 py-2 text-sm resize-y focus:ring-brand-500 focus:border-brand-500" placeholder="وصف" />
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-700">Features</h4>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Toggle</span>
                  </div>
                  <div className="border rounded-lg p-3 h-[320px] overflow-y-auto bg-gray-50/60">
                    <div className="grid gap-2">
                      {['chat','forms_generation','legal_analysis','advanced_search','document_parsing','priority_support'].map(feat => {
                        const enabled = !!form.features[feat];
                        return (
                          <label key={feat} className={`flex items-center justify-between gap-3 text-xs font-medium rounded-md px-3 py-2 bg-white border ${enabled? 'border-brand-300 shadow-sm':'border-gray-200'} hover:border-brand-400 transition`}>
                            <span className="truncate text-gray-700">{feat.replace(/_/g,' ')}</span>
                            <input type="checkbox" className="h-4 w-4" checked={enabled} onChange={()=>toggleFeature(feat)} />
                          </label>
                        );
                      })}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug">Feature flags control access to application capabilities. Users inherit these from the plan (can be overridden per user).</p>
                </div>
              </div>
            </form>
            <div className="sticky bottom-0 w-full bg-gradient-to-r from-gray-50 to-white border-t px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button type="button" onClick={()=>{ setShowForm(false); setEditingKey(null); }} className="h-10 px-5 rounded-md border text-sm font-medium bg-white hover:bg-gray-50">Cancel</button>
              <button form="planForm" disabled={createMut.status==='pending' || updateMut.status==='pending'} type="submit" className="h-10 px-6 rounded-md bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed">{editingKey? 'Save Changes':'Create Plan'}</button>
            </div>
          </div>
        </div>, document.body)
      }
    </div>
  );
}
