import { useParams } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { useToast } from '../../context/ToastContext';
import { exportToCsv, exportToJson } from '../../lib/exportUtils';

const tabs = [
  { key: 'profile', label: 'Profile' },
  { key: 'usage', label: 'Usage' },
  { key: 'logs', label: 'Token Logs' },
  { key: 'chat', label: 'Chat History' },
  { key: 'analysis', label: 'Analyses' },
  { key: 'cases', label: 'Cases' },
  { key: 'documents', label: 'Documents' },
  { key: 'forms', label: 'Forms' },
  { key: 'plan', label: 'Plan & Features' },
  { key: 'roles', label: 'Roles' },
];

export default function UserDetailPage() {
  const { id } = useParams();
  const { push: pushToast } = useToast();
  const [tab, setTab] = useState('profile');
  const qc = useQueryClient();
  const [logsDays, setLogsDays] = useState(7);
  const [logsService, setLogsService] = useState<string>('');
  const [logsLimit, setLogsLimit] = useState(100);
  const [planEdit, setPlanEdit] = useState('');
  const [featureDraft, setFeatureDraft] = useState<Record<string, boolean>>({});
  const [rolesDraft, setRolesDraft] = useState<string>('');
  const [chatSessionExpanded, setChatSessionExpanded] = useState<string | null>(null);
  const [chatMsgLimit, setChatMsgLimit] = useState(50);
  const [listLimit, setListLimit] = useState(25);
  const [listOffset, setListOffset] = useState(0);

  interface UserDetail {
    subscription_plan: string;
    roles: string[];
    features: Record<string, boolean>;
    email: string;
    created_at?: string;
    trial_expiry?: string;
    billing_cycle_start?: string;
    api_calls_used: number;
    tokens_used: number;
    prompt_tokens_used: number; output_tokens_used: number; thoughts_tokens_used: number; cached_tokens_used: number; last_model_used?: string;
  }
  const detailQ = useQuery<UserDetail>({ enabled: !!id, queryKey: ['user-detail', id], queryFn: () => adminApi.userDetail(id!) });
  useEffect(()=>{
    const d = detailQ.data;
    if (d) {
      setPlanEdit(d.subscription_plan);
      setRolesDraft((d.roles||[]).join(','));
      setFeatureDraft(d.features||{});
    }
  }, [detailQ.data]);
  const summaryQ = useQuery<any>({ enabled: !!id && tab==='usage', queryKey: ['user-usage-summary', id], queryFn: () => adminApi.userUsageSummary(id!, 30) });
  const logsQ = useQuery<any[]>({ enabled: !!id && tab==='logs', queryKey: ['user-logs', id, logsDays, logsService, logsLimit], queryFn: () => adminApi.userUsageLogs(id!, { days: logsDays, service: logsService || undefined, limit: logsLimit }) });
  const plansQ = useQuery<Record<string, any>>({ enabled: !!id && tab==='plan', queryKey: ['plans'], queryFn: () => adminApi.plans() });
  const chatSessionsQ = useQuery<any[]>({ enabled: !!id && tab==='chat', queryKey: ['chat-sessions', id, listLimit, listOffset], queryFn: () => adminApi.userChatSessions(id!, { limit: listLimit, offset: listOffset }) });
  const chatMessagesQ = useQuery<any[]>({ enabled: !!id && tab==='chat' && !!chatSessionExpanded, queryKey: ['chat-messages', id, chatSessionExpanded, chatMsgLimit], queryFn: () => adminApi.userChatMessages(id!, chatSessionExpanded!, { limit: chatMsgLimit }) });
  const analysesQ = useQuery<any[]>({ enabled: !!id && tab==='analysis', queryKey: ['analyses', id, listLimit, listOffset], queryFn: () => adminApi.userAnalyses(id!, { limit: listLimit, offset: listOffset }) });
  const casesQ = useQuery<any[]>({ enabled: !!id && tab==='cases', queryKey: ['cases', id, listLimit, listOffset], queryFn: () => adminApi.userCases(id!, { limit: listLimit, offset: listOffset }) });
  const documentsQ = useQuery<any[]>({ enabled: !!id && tab==='documents', queryKey: ['documents', id, listLimit, listOffset], queryFn: () => adminApi.userDocuments(id!, { limit: listLimit, offset: listOffset }) });
  const formsQ = useQuery<any[]>({ enabled: !!id && tab==='forms', queryKey: ['forms', id, listLimit, listOffset], queryFn: () => adminApi.userForms(id!, { limit: listLimit, offset: listOffset }) });

  const updatePlanMut = useMutation({
    mutationFn: () => adminApi.updateUserPlan(id!, planEdit),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-detail', id]}); pushToast({ type: 'success', message: 'Plan updated'}); },
    onError: () => pushToast({ type: 'error', message: 'Failed to update plan'})
  });
  const updateFeaturesMut = useMutation({
    mutationFn: () => adminApi.updateUserFeatures(id!, featureDraft),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-detail', id]}); pushToast({ type: 'success', message: 'Features saved'}); },
    onError: () => pushToast({ type: 'error', message: 'Failed to save features'})
  });
  const updateRolesMut = useMutation({
    mutationFn: () => adminApi.updateUserRoles(id!, rolesDraft.split(',').map(r=>r.trim()).filter(Boolean)),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['user-detail', id]}); pushToast({ type: 'success', message: 'Roles saved'}); },
    onError: () => pushToast({ type: 'error', message: 'Failed to save roles'})
  });

  const planFeatureKeys = useMemo(()=>{ if (!plansQ.data) return []; const pk = planEdit?.toLowerCase(); const planCfg = (plansQ.data as any)[pk] || {}; return Object.keys(planCfg.features||{}); }, [plansQ.data, planEdit]);

  if (!id) return <div className="text-sm text-gray-500">Missing user id</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">User Detail</h2>
        <div className="text-xs text-gray-500">ID: {id}</div>
      </div>
      <div className="flex gap-2 flex-wrap border-b pb-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={()=>setTab(t.key)}
            className={`px-3 py-1.5 rounded-t-md text-xs font-medium border transition ${tab===t.key ? 'bg-white border-gray-300 border-b-white text-brand-700 shadow-sm' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-transparent'}`}
          >{t.label}</button>
        ))}
      </div>
      <div>
        {tab === 'profile' && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white border rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm text-gray-700">Account</h3>
              {detailQ.isLoading && <div className="h-16 mb-2 rounded bg-gray-100 animate-pulse" />}
              {detailQ.isLoading && <div className="text-xs text-gray-500">Loading...</div>}
              {detailQ.data && (
                <ul className="text-xs space-y-1">
                  <li><span className="font-semibold">Email:</span> {detailQ.data.email}</li>
                  <li><span className="font-semibold">Plan:</span> {detailQ.data.subscription_plan}</li>
                  <li><span className="font-semibold">Created:</span> {detailQ.data.created_at ? new Date(detailQ.data.created_at).toLocaleString(): ''}</li>
                  <li><span className="font-semibold">Trial Expiry:</span> {detailQ.data.trial_expiry ? new Date(detailQ.data.trial_expiry).toLocaleDateString(): '—'}</li>
                  <li><span className="font-semibold">Billing Cycle Start:</span> {detailQ.data.billing_cycle_start ? new Date(detailQ.data.billing_cycle_start).toLocaleDateString(): ''}</li>
                  <li><span className="font-semibold">API Calls Used:</span> {detailQ.data.api_calls_used}</li>
                  <li><span className="font-semibold">Tokens Used:</span> {detailQ.data.tokens_used}</li>
                </ul>
              )}
            </div>
            <div className="bg-white border rounded-lg p-4 space-y-2">
              <h3 className="font-medium text-sm text-gray-700">Token Breakdown</h3>
              {detailQ.data && (
                <ul className="text-xs space-y-1">
                  <li><span className="font-semibold">Prompt:</span> {detailQ.data.prompt_tokens_used}</li>
                  <li><span className="font-semibold">Output:</span> {detailQ.data.output_tokens_used}</li>
                  <li><span className="font-semibold">Thoughts:</span> {detailQ.data.thoughts_tokens_used}</li>
                  <li><span className="font-semibold">Cached:</span> {detailQ.data.cached_tokens_used}</li>
                  <li><span className="font-semibold">Last Model:</span> {detailQ.data.last_model_used || '—'}</li>
                </ul>
              )}
            </div>
          </div>
        )}
        {tab === 'usage' && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-medium text-sm mb-4">Usage Summary (30d)</h3>
            {summaryQ.isLoading && <div className="text-xs text-gray-500">Loading...</div>}
            {summaryQ.data && (
              <>
                <div className="flex items-center justify-end gap-2 mb-2">
                  <button onClick={()=> exportToCsv(summaryQ.data.by_service, [
                    { key: 'service', header: 'Service' },
                    { key: 'prompt_tokens', header: 'Prompt' },
                    { key: 'output_tokens', header: 'Output' },
                    { key: 'thoughts_tokens', header: 'Thoughts' },
                    { key: 'cached_tokens', header: 'Cached' },
                    { key: 'total_tokens', header: 'Total Tokens' },
                    { key: 'calls', header: 'Calls' }
                  ], `user-${id}-usage-summary`)} className="h-7 px-3 rounded border text-[11px]">CSV</button>
                  <button onClick={()=> exportToJson(summaryQ.data, `user-${id}-usage-summary`)} className="h-7 px-3 rounded border text-[11px]">JSON</button>
                </div>
                <div className="overflow-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="text-left bg-gray-50">
                      <th className="px-2 py-1 font-semibold">Service</th>
                      <th className="px-2 py-1 font-semibold">Prompt</th>
                      <th className="px-2 py-1 font-semibold">Output</th>
                      <th className="px-2 py-1 font-semibold">Thoughts</th>
                      <th className="px-2 py-1 font-semibold">Cached</th>
                      <th className="px-2 py-1 font-semibold">Total</th>
                      <th className="px-2 py-1 font-semibold">Calls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryQ.data.by_service.map((row: any) => (
                      <tr key={row.service} className="border-t">
                        <td className="px-2 py-1 font-medium">{row.service}</td>
                        <td className="px-2 py-1">{row.prompt_tokens}</td>
                        <td className="px-2 py-1">{row.output_tokens}</td>
                        <td className="px-2 py-1">{row.thoughts_tokens}</td>
                        <td className="px-2 py-1">{row.cached_tokens}</td>
                        <td className="px-2 py-1">{row.total_tokens}</td>
                        <td className="px-2 py-1">{row.calls}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-100 font-semibold">
                      <td className="px-2 py-1">Totals</td>
                      <td className="px-2 py-1">{summaryQ.data.totals.prompt_tokens}</td>
                      <td className="px-2 py-1">{summaryQ.data.totals.output_tokens}</td>
                      <td className="px-2 py-1">{summaryQ.data.totals.thoughts_tokens}</td>
                      <td className="px-2 py-1">{summaryQ.data.totals.cached_tokens}</td>
                      <td className="px-2 py-1">{summaryQ.data.totals.total_tokens}</td>
                      <td className="px-2 py-1">{summaryQ.data.totals.calls}</td>
                    </tr>
                  </tfoot>
                </table>
                </div>
              </>
            )}
          </div>
        )}
        {tab === 'logs' && (
          <div className="bg-white border rounded-lg p-4 space-y-3">
            <div className="flex flex-wrap gap-2 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500">Days</label>
                <input type="number" value={logsDays} onChange={e=>setLogsDays(Number(e.target.value))} className="h-8 w-20 border rounded px-2 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500">Service</label>
                <input value={logsService} onChange={e=>setLogsService(e.target.value)} placeholder="Filter service" className="h-8 w-40 border rounded px-2 text-xs" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
                <input type="number" value={logsLimit} onChange={e=>setLogsLimit(Number(e.target.value))} className="h-8 w-24 border rounded px-2 text-xs" />
              </div>
              <button onClick={()=>logsQ.refetch()} className="h-8 px-3 rounded bg-brand-600 text-white text-xs font-medium">Reload</button>
              <button disabled={!logsQ.data?.length} onClick={()=> logsQ.data && exportToCsv(logsQ.data, [
                { key: 'created_at', header: 'Time' },
                { key: 'service' },
                { key: 'model' },
                { key: 'prompt_tokens', header: 'Prompt' },
                { key: 'output_tokens', header: 'Output' },
                { key: 'thoughts_tokens', header: 'Thoughts' },
                { key: 'cached_tokens', header: 'Cached' },
                { key: 'total_tokens', header: 'Total' },
              ], `user-${id}-token-logs`)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">CSV</button>
              <button disabled={!logsQ.data?.length} onClick={()=> logsQ.data && exportToJson(logsQ.data, `user-${id}-token-logs`)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">JSON</button>
              {logsQ.isFetching && <div className="text-[10px] text-gray-500">Loading...</div>}
            </div>
            <div className="overflow-auto max-h-[480px] border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 py-1">Time</th>
                    <th className="px-2 py-1">Service</th>
                    <th className="px-2 py-1">Model</th>
                    <th className="px-2 py-1">Prompt</th>
                    <th className="px-2 py-1">Output</th>
                    <th className="px-2 py-1">Thoughts</th>
                    <th className="px-2 py-1">Cached</th>
                    <th className="px-2 py-1">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {logsQ.isLoading && <tr><td colSpan={8} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
                  {!logsQ.isLoading && logsQ.data?.length === 0 && <tr><td colSpan={8} className="px-4 py-6 text-center text-gray-400">No logs</td></tr>}
                  {logsQ.data?.map((l:any,i:number)=>(
                    <tr key={i} className="border-t hover:bg-brand-50/40">
                      <td className="px-2 py-1 whitespace-nowrap text-[10px] text-gray-500">{l.created_at ? new Date(l.created_at).toLocaleString(): ''}</td>
                      <td className="px-2 py-1 font-medium">{l.service}</td>
                      <td className="px-2 py-1">{l.model}</td>
                      <td className="px-2 py-1">{l.prompt_tokens}</td>
                      <td className="px-2 py-1">{l.output_tokens}</td>
                      <td className="px-2 py-1">{l.thoughts_tokens}</td>
                      <td className="px-2 py-1">{l.cached_tokens}</td>
                      <td className="px-2 py-1 font-semibold">{l.total_tokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {tab === 'plan' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500">Plan</label>
                <select value={planEdit} onChange={e=>setPlanEdit(e.target.value)} className="h-9 border rounded px-2 text-sm min-w-[160px]">
                  {plansQ.data && Object.keys(plansQ.data).map(k=> <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
              <button disabled={updatePlanMut.isPending} onClick={()=>updatePlanMut.mutate()} className="h-9 px-4 rounded bg-brand-600 text-white text-xs font-medium disabled:opacity-50">{updatePlanMut.isPending?'Saving...':'Update Plan'}</button>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2">Feature Overrides</h4>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {planFeatureKeys.map(k => (
                  <label key={k} className="flex items-center gap-2 text-xs bg-gray-50 border rounded px-2 py-1">
                    <input type="checkbox" checked={featureDraft[k] ?? false} onChange={e=> setFeatureDraft(fd=>({...fd, [k]: e.target.checked}))} />
                    <span>{k}</span>
                  </label>
                ))}
              </div>
              <div className="mt-3 flex gap-2 items-center">
                <button disabled={updateFeaturesMut.isPending} onClick={()=>updateFeaturesMut.mutate()} className="h-8 px-3 rounded bg-brand-600 text-white text-xs disabled:opacity-50">{updateFeaturesMut.isPending? 'Saving...' : 'Save Features'}</button>
              </div>
            </div>
            {plansQ.isLoading && <div className="text-xs text-gray-500">Loading plan catalog...</div>}
          </div>
        )}
    {tab === 'roles' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wide text-gray-500">Roles (comma separated)</label>
              <input value={rolesDraft} onChange={e=>setRolesDraft(e.target.value)} className="h-9 w-full border rounded px-3 text-sm" placeholder="admin, analyst" />
              <p className="mt-1 text-[10px] text-gray-500">Include 'admin' to grant dashboard access.</p>
            </div>
            <div className="flex gap-2 items-center">
      <button disabled={updateRolesMut.isPending} onClick={()=>updateRolesMut.mutate()} className="h-9 px-4 rounded bg-brand-600 text-white text-xs disabled:opacity-50">{updateRolesMut.isPending? 'Saving...' : 'Save Roles'}</button>
            </div>
            {detailQ.data && (
              <div className="text-[11px] text-gray-600">Current: {(detailQ.data.roles||[]).join(', ') || '—'}</div>
            )}
          </div>
        )}
  {tab === 'chat' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
              <div>
                <label className="block text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
                <input type="number" value={listLimit} onChange={e=>{setListOffset(0); setListLimit(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
              </div>
              {chatSessionsQ.isFetching && <div className="text-[10px] text-gray-500">Loading...</div>}
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 py-1">Session</th>
                    <th className="px-2 py-1">Messages</th>
                    <th className="px-2 py-1">Searches</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Last Activity</th>
                    <th className="px-2 py-1">Expand</th>
                  </tr>
                </thead>
                <tbody>
                  {chatSessionsQ.isLoading && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
                  {!chatSessionsQ.isLoading && chatSessionsQ.data?.length===0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No sessions</td></tr>}
                  {chatSessionsQ.data?.map(s => (
                    <>
                      <tr key={s.session_id} className="border-t hover:bg-brand-50/40">
                        <td className="px-2 py-1 font-medium">{s.session_id}</td>
                        <td className="px-2 py-1">{s.message_count}</td>
                        <td className="px-2 py-1">{s.search_count}</td>
                        <td className="px-2 py-1"><span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] uppercase tracking-wide">{s.status}</span></td>
                        <td className="px-2 py-1 text-[10px] text-gray-500">{s.last_activity ? new Date(s.last_activity).toLocaleString(): ''}</td>
                        <td className="px-2 py-1"><button className="text-brand-600 text-[11px] underline" onClick={()=> setChatSessionExpanded(prev => prev===s.session_id? null : s.session_id)}>{chatSessionExpanded===s.session_id? 'Hide':'View'}</button></td>
                      </tr>
                      {chatSessionExpanded===s.session_id && (
                        <tr className="bg-brand-50/30">
                          <td colSpan={6} className="px-2 py-2">
                            <div className="flex items-center gap-3 mb-2">
                              <div>
                                <label className="block text-[10px] uppercase tracking-wide text-gray-500">Messages Limit</label>
                                <input type="number" value={chatMsgLimit} onChange={e=>setChatMsgLimit(Number(e.target.value))} className="h-8 w-28 border rounded px-2 text-xs" />
                              </div>
                              {chatMessagesQ.isFetching && <div className="text-[10px] text-gray-500">Loading...</div>}
                            </div>
                            <div className="max-h-60 overflow-auto border rounded bg-white">
                              <table className="min-w-full text-[11px]">
                                <thead className="bg-gray-100 sticky top-0">
                                  <tr className="text-left">
                                    <th className="px-2 py-1 w-16">Role</th>
                                    <th className="px-2 py-1">Content</th>
                                    <th className="px-2 py-1 w-40">Time</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {chatMessagesQ.isLoading && <tr><td colSpan={3} className="px-4 py-6 text-center text-gray-500">Loading...</td></tr>}
                                  {chatMessagesQ.data?.map((m,i)=>(
                                    <tr key={i} className="border-t align-top">
                                      <td className="px-2 py-1 font-medium">{m.role}</td>
                                      <td className="px-2 py-1 whitespace-pre-wrap text-[11px] leading-tight">{m.content}</td>
                                      <td className="px-2 py-1 text-[10px] text-gray-500">{m.timestamp ? new Date(m.timestamp).toLocaleString(): ''}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button disabled={listOffset===0} onClick={()=>setListOffset(o=> Math.max(0, o - listLimit))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
              <span className="text-[10px] text-gray-500">Offset {listOffset}</span>
              <button disabled={!chatSessionsQ.data || chatSessionsQ.data.length < listLimit} onClick={()=>setListOffset(o=> o + listLimit)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
              <button disabled={!chatSessionsQ.data?.length} onClick={()=> chatSessionsQ.data && exportToCsv(chatSessionsQ.data, [
                { key: 'session_id', header: 'Session' },
                { key: 'message_count', header: 'Messages' },
                { key: 'search_count', header: 'Searches' },
                { key: 'status', header: 'Status' },
                { key: 'last_activity', header: 'Last Activity' }
              ], `user-${id}-chat-sessions`)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">CSV</button>
              <button disabled={!chatSessionsQ.data?.length} onClick={()=> chatSessionsQ.data && exportToJson(chatSessionsQ.data, `user-${id}-chat-sessions`)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">JSON</button>
            </div>
          </div>
        )}
  {tab === 'analysis' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
              <input type="number" value={listLimit} onChange={e=>{setListOffset(0); setListLimit(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Case</th>
                    <th className="px-2 py-1">Created</th>
                    <th className="px-2 py-1">Snippet</th>
                  </tr>
                </thead>
                <tbody>
                  {analysesQ.isLoading && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
                  {!analysesQ.isLoading && analysesQ.data?.length===0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">No analyses</td></tr>}
                  {analysesQ.data?.map(a => (
                    <tr key={a.id} className="border-t hover:bg-brand-50/40">
                      <td className="px-2 py-1 font-medium">{a.id}</td>
                      <td className="px-2 py-1">{a.case_id}</td>
                      <td className="px-2 py-1 text-[10px] text-gray-500">{a.created_at? new Date(a.created_at).toLocaleString(): ''}</td>
                      <td className="px-2 py-1 text-[11px]">{a.snippet}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button disabled={listOffset===0} onClick={()=>setListOffset(o=> Math.max(0, o - listLimit))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
              <span className="text-[10px] text-gray-500">Offset {listOffset}</span>
              <button disabled={!analysesQ.data || analysesQ.data.length < listLimit} onClick={()=>setListOffset(o=> o + listLimit)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
  {tab === 'cases' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
              <input type="number" value={listLimit} onChange={e=>{setListOffset(0); setListLimit(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Title</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Status</th>
                    <th className="px-2 py-1">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {casesQ.isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
                  {!casesQ.isLoading && casesQ.data?.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No cases</td></tr>}
                  {casesQ.data?.map(c => (
                    <tr key={c.id} className="border-t hover:bg-brand-50/40">
                      <td className="px-2 py-1 font-medium">{c.id}</td>
                      <td className="px-2 py-1">{c.title}</td>
                      <td className="px-2 py-1">{c.case_type}</td>
                      <td className="px-2 py-1"><span className="px-2 py-0.5 rounded bg-gray-100 text-[10px] uppercase tracking-wide">{c.status}</span></td>
                      <td className="px-2 py-1 text-[10px] text-gray-500">{c.created_at? new Date(c.created_at).toLocaleString(): ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button disabled={listOffset===0} onClick={()=>setListOffset(o=> Math.max(0, o - listLimit))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
              <span className="text-[10px] text-gray-500">Offset {listOffset}</span>
              <button disabled={!casesQ.data || casesQ.data.length < listLimit} onClick={()=>setListOffset(o=> o + listLimit)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
  {tab === 'documents' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
              <input type="number" value={listLimit} onChange={e=>{setListOffset(0); setListLimit(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">File</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Size</th>
                    <th className="px-2 py-1">Uploaded</th>
                  </tr>
                </thead>
                <tbody>
                  {documentsQ.isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
                  {!documentsQ.isLoading && documentsQ.data?.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No documents</td></tr>}
                  {documentsQ.data?.map(d => (
                    <tr key={d.id} className="border-t hover:bg-brand-50/40">
                      <td className="px-2 py-1 font-medium">{d.id}</td>
                      <td className="px-2 py-1">{d.file_name}</td>
                      <td className="px-2 py-1">{d.file_type}</td>
                      <td className="px-2 py-1">{(d.file_size/1024).toFixed(1)} KB</td>
                      <td className="px-2 py-1 text-[10px] text-gray-500">{d.uploaded_at? new Date(d.uploaded_at).toLocaleString(): ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button disabled={listOffset===0} onClick={()=>setListOffset(o=> Math.max(0, o - listLimit))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
              <span className="text-[10px] text-gray-500">Offset {listOffset}</span>
              <button disabled={!documentsQ.data || documentsQ.data.length < listLimit} onClick={()=>setListOffset(o=> o + listLimit)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
  {tab === 'forms' && (
          <div className="bg-white border rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-3">
              <label className="text-[10px] uppercase tracking-wide text-gray-500">Limit</label>
              <input type="number" value={listLimit} onChange={e=>{setListOffset(0); setListLimit(Number(e.target.value));}} className="h-8 w-24 border rounded px-2 text-xs" />
            </div>
            <div className="overflow-auto border rounded">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-2 py-1">ID</th>
                    <th className="px-2 py-1">Title</th>
                    <th className="px-2 py-1">Type</th>
                    <th className="px-2 py-1">Case</th>
                    <th className="px-2 py-1">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {formsQ.isLoading && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>}
                  {!formsQ.isLoading && formsQ.data?.length===0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No forms</td></tr>}
                  {formsQ.data?.map(f => (
                    <tr key={f.id} className="border-t hover:bg-brand-50/40">
                      <td className="px-2 py-1 font-medium">{f.id}</td>
                      <td className="px-2 py-1">{f.title}</td>
                      <td className="px-2 py-1">{f.form_type}</td>
                      <td className="px-2 py-1">{f.case_id}</td>
                      <td className="px-2 py-1 text-[10px] text-gray-500">{f.created_at? new Date(f.created_at).toLocaleString(): ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button disabled={listOffset===0} onClick={()=>setListOffset(o=> Math.max(0, o - listLimit))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
              <span className="text-[10px] text-gray-500">Offset {listOffset}</span>
              <button disabled={!formsQ.data || formsQ.data.length < listLimit} onClick={()=>setListOffset(o=> o + listLimit)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
