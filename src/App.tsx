import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import PlansPage from './pages/plans/PlansPage';
import UsageAnalyticsPage from './pages/analytics/UsageAnalyticsPage';
import DashboardHome from './pages/dashboard/DashboardHome';
import RolesPage from './pages/roles/RolesPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';

function Protected({ children }: { children: JSX.Element }) {
  const { loading, authenticated } = useAuth();
  if (loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}

function AdminOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  const roles: string[] = user?.roles || [];
  const isAdmin = !!user && (user.is_superuser || roles.includes('admin'));
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><DashboardLayout /></Protected>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardHome />} />
        <Route path="dashboard/usage" element={<AdminOnly><UsageAnalyticsPage /></AdminOnly>} />
        <Route path="users" element={<AdminOnly><UsersPage /></AdminOnly>} />
        <Route path="users/:id" element={<AdminOnly><UserDetailPage /></AdminOnly>} />
        <Route path="plans" element={<AdminOnly><PlansPage /></AdminOnly>} />
        <Route path="roles" element={<AdminOnly><RolesPage /></AdminOnly>} />
        <Route path="audit" element={<AdminOnly><AuditLogsPage /></AdminOnly>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
