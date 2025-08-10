import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { Link } from 'react-router-dom';

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const limit = 20;
  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['users', search, page],
    queryFn: () => adminApi.listUsers({ search: search || undefined, limit, offset: page * limit })
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-semibold">Users</h2>
        <div className="flex items-center gap-2">
            <input
              placeholder="Search email or id..."
              value={search}
              onChange={e=>{ setPage(0); setSearch(e.target.value); }}
              className="h-9 w-64 border border-gray-300 rounded-md px-3 text-sm focus:ring-brand-500 focus:border-brand-500"
            />
            <button onClick={()=>refetch()} className="h-9 px-3 rounded-md bg-brand-600 text-white text-sm font-medium hover:bg-brand-700">Search</button>
        </div>
      </div>
      <div className="relative border rounded-lg bg-white shadow-sm overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr className="text-left">
              <th className="px-3 py-2 font-medium">Email</th>
              <th className="px-3 py-2 font-medium">Plan</th>
              <th className="px-3 py-2 font-medium">API Used</th>
              <th className="px-3 py-2 font-medium">Tokens Used</th>
              <th className="px-3 py-2 font-medium">Created</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
            )}
            {!isLoading && data && data.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No users found</td></tr>
            )}
            {data?.map(u => (
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
