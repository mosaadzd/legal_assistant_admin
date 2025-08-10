import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../lib/apiClient';
import { DataTable } from '../../components/ui/DataTable';

export default function RolesPage() {
  const [limit] = useState(500);
  const usersQ = useQuery({ queryKey: ['users-for-roles', limit], queryFn: () => adminApi.listUsers({ limit }) });
  const allRoles: Record<string, string[]> = {};
  (usersQ.data||[]).forEach((u: any) => {
    (u.roles||[]).forEach((r: string) => {
      if (!allRoles[r]) allRoles[r] = []; allRoles[r].push(u.email);
    });
  });
  const rows = Object.entries(allRoles).map(([role, emails]) => ({ id: role, role, count: emails.length, sample: emails.slice(0,5) }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Roles & Permissions</h2>
          <p className="text-[12px] text-gray-500">Inferred from first {limit} users. Edit roles per user in User Detail &gt; Roles tab.</p>
        </div>
        <div className="text-[11px] text-gray-500">{usersQ.isFetching && 'Refreshing...'}</div>
      </div>
      <DataTable
        loading={usersQ.isLoading}
        rows={rows}
        columns={[
          { key: 'role', header: 'Role', sortable: true, render: r => <span className="font-medium text-gray-800">{r.role}</span> },
          { key: 'count', header: 'Users', sortable: true },
          { key: 'sample', header: 'Sample Users', render: r => <div className="flex flex-wrap gap-1">{r.sample.map((e:string)=> <span key={e} className="px-1.5 py-0.5 rounded bg-gray-100 text-[10px]">{e}</span>)}</div> }
        ]}
        emptyMessage="No roles discovered"
        skeletonRows={6}
      />
    </div>
  );
}
