import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { BarChart3, Users, Layers, ShieldCheck, FileText, Moon, Sun, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const baseNavItems = [
  { to: '/dashboard', label: 'Analytics', icon: BarChart3, match: (p: string) => p.startsWith('/dashboard'), roles: [] },
  { to: '/users', label: 'Users', icon: Users, match: (p: string) => p.startsWith('/users'), roles: ['admin'] },
  { to: '/plans', label: 'Plans & Pricing', icon: Layers, match: (p: string) => p.startsWith('/plans'), roles: ['admin'] },
  { to: '/roles', label: 'Roles', icon: ShieldCheck, match: (p: string) => p.startsWith('/roles'), roles: ['admin'] },
  { to: '/audit', label: 'Audit Logs', icon: FileText, match: (p: string) => p.startsWith('/audit'), roles: ['admin'] }
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState<boolean>(() => localStorage.getItem('admin_sidebar_collapsed') === '1');
  const [theme, setTheme] = useState<string>(() => localStorage.getItem('admin_theme') || 'light');
  const [search, setSearch] = useState('');

  // Persist collapsed
  useEffect(() => { localStorage.setItem('admin_sidebar_collapsed', collapsed ? '1' : '0'); }, [collapsed]);
  // Handle theme class on document
  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark'); else document.documentElement.classList.remove('dark');
    localStorage.setItem('admin_theme', theme);
  }, [theme]);

  function toggleTheme() { setTheme(t => t === 'dark' ? 'light' : 'dark'); }
  function onLogout() { logout(); }
  function onGlobalSearch(e: React.FormEvent) { e.preventDefault(); if (!search.trim()) return; navigate(`/users?search=${encodeURIComponent(search.trim())}`); }
  return (
    <div className="h-full flex bg-gradient-to-br from-gray-50 via-white to-brand-50/40 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <aside className={`relative ${collapsed ? 'w-16' : 'w-64'} transition-all border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white/70 dark:bg-gray-900/70 backdrop-blur`}>        
        <div className="h-16 px-3 flex items-center justify-between gap-2">
          <div className={`text-lg font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent ${collapsed && 'sr-only'}`}>Admin</div>
          <div className="flex items-center gap-1">
            <button aria-label="Toggle theme" onClick={toggleTheme} className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-700 transition">
              {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>
            <button aria-label="Collapse sidebar" onClick={()=>setCollapsed(c=>!c)} className="h-8 w-8 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-700 transition text-[10px]">{collapsed?'>':'<'}</button>
          </div>
        </div>
        <nav className="flex-1 px-2 space-y-1 overflow-y-auto pb-4">
          {(baseNavItems.filter(item => {
            if (!user) return false;
            if (user.is_superuser) return true;
            const roles: string[] = user.roles || [];
            return item.roles.length === 0 || item.roles.some(r => roles.includes(r));
          })).map(item => {
            const Icon = item.icon;
            const active = item.match(location.pathname);
            return (
              <NavLink key={item.to} to={item.to}
                className={`group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium ring-offset-1 focus:outline-none focus:ring-2 focus:ring-brand-400 transition ${active ? 'bg-gradient-to-r from-brand-100 to-brand-50 text-brand-700 dark:from-brand-600/20 dark:to-brand-500/10 dark:text-brand-300 shadow-inner' : 'text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-gray-800 hover:text-brand-700 dark:hover:text-brand-300'}`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={`${collapsed ? 'opacity-0 pointer-events-none absolute -left-96' : 'truncate'} transition-all`}>{item.label}</span>
                {active && !collapsed && <span className="ml-auto h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400 shadow shadow-brand-400/40" />}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 space-y-2">
          {!collapsed && user && (
            <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mb-2">
              <div className="font-medium text-gray-700 dark:text-gray-200">{user.email || 'Admin'}</div>
              <div className="truncate">{user.id}</div>
            </div>
          )}
          <button onClick={onLogout} className="w-full h-8 rounded-md text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-300 transition">Logout</button>
        </div>
      </aside>
      <main className="flex-1 h-full overflow-y-auto dark:bg-gray-950/40">
        <div className="h-16 border-b border-gray-200 dark:border-gray-800 flex items-center px-4 gap-4 sticky top-0 z-10 backdrop-blur bg-white/70 dark:bg-gray-900/70">
          <form onSubmit={onGlobalSearch} className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="h-4 w-4 absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Global search users..." className="w-full h-9 pl-8 pr-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800 text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400" />
            </div>
            <button type="submit" className="h-9 px-3 rounded-md border border-brand-300 dark:border-brand-500 bg-brand-500/90 dark:bg-brand-600 text-white text-xs font-medium hover:bg-brand-600 dark:hover:bg-brand-500 transition">Search</button>
          </form>
        </div>
        <div className="p-6 max-w-[1600px] mx-auto animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
