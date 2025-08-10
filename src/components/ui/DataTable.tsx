import { ReactNode, useMemo, useState } from 'react';

interface DataTableProps {
  columns: { key: string; header: string; className?: string; render?: (row: any) => ReactNode; sortable?: boolean }[];
  rows: any[];
  loading?: boolean;
  emptyMessage?: string;
  dense?: boolean;
  footer?: ReactNode;
  className?: string;
  striped?: boolean;
  skeletonRows?: number;
}
export function DataTable({ columns, rows, loading, emptyMessage='No records', footer, dense=false, className='', striped=true, skeletonRows=5 }: DataTableProps) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc'|'desc'} | null>(null);
  const sortedRows = useMemo(()=> {
    if (!sort) return rows;
    const copy = [...rows];
    copy.sort((a,b)=> {
      const av = (a as any)[sort.key];
      const bv = (b as any)[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return sort.dir==='asc'? -1:1;
      if (bv == null) return sort.dir==='asc'? 1:-1;
      if (typeof av === 'number' && typeof bv === 'number') return sort.dir==='asc'? av-bv : bv-av;
      return String(av).localeCompare(String(bv)) * (sort.dir==='asc'?1:-1);
    });
    return copy;
  }, [rows, sort]);

  function toggleSort(col: any) {
    if (!col.sortable) return;
    setSort(cur => {
      if (!cur || cur.key !== col.key) return { key: col.key, dir: 'asc'};
      if (cur.dir === 'asc') return { key: col.key, dir: 'desc'};
      return null; // third click resets
    });
  }

  return (
    <div className={`relative border rounded-lg overflow-hidden bg-white/70 backdrop-blur ${className}`}>
      <table className={`min-w-full ${dense? 'text-[11px]':'text-xs'}`}>
        <thead className="bg-gray-100/70 text-gray-600 sticky top-0 backdrop-blur z-10">
          <tr className="text-left">
            {columns.map(c => {
              const isSorted = sort?.key === c.key;
              const dir = isSorted? sort?.dir: undefined;
              return (
                <th
                  key={c.key}
                  className={`px-3 py-2 font-semibold ${c.className||''} ${c.sortable? 'cursor-pointer select-none hover:bg-gray-200/60':''}`}
                  onClick={()=>toggleSort(c)}
                >
                  <span className="inline-flex items-center gap-1">
                    {c.header}
                    {c.sortable && (
                      <span className="text-[10px] text-gray-500">
                        {isSorted? (dir==='asc'? '▲':'▼') : '↕'}
                      </span>
                    )}
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {loading && Array.from({length: skeletonRows}).map((_,i)=>(
            <tr key={i} className="animate-pulse">
              {columns.map(c => (
                <td key={c.key} className="px-3 py-2">
                  <div className="h-3 rounded bg-gray-200 w-5/6" />
                </td>
              ))}
            </tr>
          ))}
          {!loading && sortedRows.length === 0 && (
            <tr><td colSpan={columns.length} className="px-4 py-10 text-center text-gray-400">{emptyMessage}</td></tr>
          )}
          {!loading && sortedRows.map((r,i) => (
            <tr key={r.id || i} className={`${striped? 'odd:bg-white even:bg-gray-50/40':'bg-white'} hover:bg-brand-50/40 transition`}>
              {columns.map(c => (
                <td key={c.key} className={`px-3 py-1.5 align-top ${c.className||''}`}>{c.render? c.render(r) : (r as any)[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && <tfoot><tr><td colSpan={columns.length}>{footer}</td></tr></tfoot>}
      </table>
    </div>
  );
}
