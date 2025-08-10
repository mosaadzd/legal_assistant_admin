export interface ExportColumn<T = any> {
  key: string;              // object property key (no deep path yet)
  header?: string;          // column header
  map?: (row: T) => any;    // custom value extractor
}

export function exportToCsv<T>(rows: T[], cols: ExportColumn<T>[], filename: string) {
  if (!rows.length) return;
  const headers = cols.map(c => escapeCsv(c.header || c.key));
  const lines = [headers.join(',')];
  for (const row of rows) {
    const vals = cols.map(c => {
      const raw = c.map ? c.map(row) : (row as any)[c.key];
      return escapeCsv(raw);
    });
    lines.push(vals.join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  triggerDownload(blob, ensureExt(filename, 'csv'));
}

export function exportToJson(data: any, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  triggerDownload(blob, ensureExt(filename, 'json'));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function ensureExt(name: string, ext: string) {
  return name.endsWith('.' + ext) ? name : name + '.' + ext;
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val);
  if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
  return s;
}
