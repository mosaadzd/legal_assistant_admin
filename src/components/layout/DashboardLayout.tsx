import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { BarChart3, Users, Layers, Settings, ShieldCheck, FileText } from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Analytics', icon: BarChart3 },
  { to: '/users', label: 'Users', icon: Users },
  { to: '/plans', label: 'Plans & Pricing', icon: Layers },
  { to: '/roles', label: 'Roles', icon: ShieldCheck },
  { to: '/audit', label: 'Audit Logs', icon: FileText }
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  return (
    <div className="h-full flex bg-white">
      <aside className="w-60 border-r border-gray-200 flex flex-col">
        <div className="h-16 px-4 flex items-center text-xl font-semibold text-brand-600">Admin</div>
        <nav className="flex-1 px-2 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink key={item.to} to={item.to}
                className={({ isActive }) => `flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium hover:bg-brand-50 hover:text-brand-700 ${isActive ? 'bg-brand-100 text-brand-700' : 'text-gray-700'}`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="p-4 border-t">
          <button onClick={() => navigate('/login')} className="text-xs text-gray-500 hover:text-gray-700">Logout</button>
        </div>
      </aside>
      <main className="flex-1 h-full overflow-y-auto bg-gray-50">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
