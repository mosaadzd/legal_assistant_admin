import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { exportToCsv } from '../../lib/exportUtils';

export default function UsersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const initialSearch = params.get('search') || '';
  const [search, setSearch] = useState(initialSearch);
  const [page, setPage] = useState(0);
  const limit = 50; // within backend allowed range (<=200)
  useEffect(()=> { setSearch(initialSearch); setPage(0); }, [initialSearch]);
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users', search, page, limit],
    queryFn: () => adminApi.listUsers({ search: search || undefined, limit, offset: page * limit })
  });

  function doSearch() {
    const qs = new URLSearchParams();
    if (search.trim()) qs.set('search', search.trim());
    navigate({ pathname: '/users', search: qs.toString() });
    refetch();
  }

  const [sort, setSort] = useState<{ key: string; dir:'asc'|'desc'}|null>(null);
  const sorted = useMemo(()=> {
    if (!data) return [] as any[];
    if (!sort) return data;
    const copy = [...data];
    copy.sort((a,b)=> {
      const av = (a as any)[sort.key];
      const bv = (b as any)[sort.key];
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir==='asc'? av-bv: bv-av;
      return String(av).localeCompare(String(bv)) * (sort.dir==='asc'?1:-1);
    });
    return copy;
  }, [data, sort]);

  function toggleSort(key: string) {
    setSort(cur => {
      if (!cur || cur.key !== key) return { key, dir:'asc'};
      if (cur.dir === 'asc') return { key, dir:'desc'};
      return null;
    });
  }

  function exportCsv() {
    if (!data?.length) return;
    exportToCsv(sorted, [
      { key: 'email' },
      { key: 'subscription_plan', header: 'plan' },
      { key: 'api_calls_used', header: 'api_calls' },
      { key: 'tokens_used', header: 'tokens' },
      { key: 'created_at', header: 'created' },
    ], 'users');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex items-center gap-2">
            <input
              placeholder="Search email or id..."
              value={search}
              onChange={e=>{ setPage(0); setSearch(e.target.value); }}
              onKeyDown={e=> { if (e.key==='Enter') doSearch(); }}
              className="h-9 w-64 border border-gray-300 rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500"
            />
            <button onClick={doSearch} className="h-9 px-3 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Search</button>
        </div>
      </div>
      <div className="flex justify-end -mb-1">
        <button onClick={exportCsv} disabled={!data?.length} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Export CSV</button>
      </div>
      <div className="relative border rounded-lg bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              {['email','subscription_plan','api_calls_used','tokens_used','created_at'].map(h => {
                const labelMap: any = { email:'Email', subscription_plan:'Plan', api_calls_used:'API Used', tokens_used:'Tokens Used', created_at:'Created' };
                const active = sort?.key === h;
                const dir = active? sort?.dir: undefined;
                return (
                  <th key={h} onClick={()=>toggleSort(h)} className="px-3 py-2 font-medium cursor-pointer select-none hover:bg-gray-100">
                    <span className="inline-flex items-center gap-1">{labelMap[h]} <span className="text-[10px] text-gray-500">{active? (dir==='asc'? '▲':'▼'):'↕'}</span></span>
                  </th>
                );
              })}
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && Array.from({length:8}).map((_,i)=>(
              <tr key={i} className="animate-pulse">
                {Array.from({length:6}).map((__,j)=>(<td key={j} className="px-3 py-2"><div className="h-3 rounded bg-gray-200 w-5/6" /></td>))}
              </tr>
            ))}
            {!isLoading && sorted.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No users found{search? ' for query "'+search+'"':''}</td></tr>
            )}
            {sorted.map(u => (
              <tr key={u.id} className="border-t hover:bg-brand-50/40">
                <td className="px-3 py-2 font-medium text-gray-800 truncate max-w-[220px]">{u.email}</td>
                <td className="px-3 py-2">{u.subscription_plan}</td>
                <td className="px-3 py-2">{u.api_calls_used}</td>
                <td className="px-3 py-2">{u.tokens_used}</td>
                <td className="px-3 py-2 text-xs text-gray-500">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ''}</td>
                <td className="px-3 py-2">
                  <Link to={`/users/${u.id}`} className="text-brand-600 hover:underline">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isFetching && !isLoading && <div className="absolute top-0 right-0 m-2 text-[10px] px-2 py-1 bg-brand-600 text-white rounded">Refreshing...</div>}
      </div>
  <div className="flex items-center gap-2 justify-end">
        <button disabled={page===0} onClick={()=>setPage(p=>Math.max(0,p-1))} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Prev</button>
  <div className="text-xs text-gray-600">Page {page+1}</div>
        <button disabled={!data || data.length < limit} onClick={()=>setPage(p=>p+1)} className="h-8 px-3 rounded border text-xs disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}
