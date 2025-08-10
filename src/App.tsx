import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/layout/DashboardLayout';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import UsersPage from './pages/users/UsersPage';
import UserDetailPage from './pages/users/UserDetailPage';
import PlansPage from './pages/plans/PlansPage';
import UsageAnalyticsPage from './pages/analytics/UsageAnalyticsPage';
import RolesPage from './pages/roles/RolesPage';
import AuditLogsPage from './pages/audit/AuditLogsPage';

function Protected({ children }: { children: JSX.Element }) {
  const { loading, authenticated } = useAuth();
  if (loading) return <div className="p-8 text-sm text-gray-500">Loading...</div>;
  if (!authenticated) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Protected><DashboardLayout /></Protected>}>        
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<UsageAnalyticsPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="plans" element={<PlansPage />} />
        <Route path="roles" element={<RolesPage />} />
        <Route path="audit" element={<AuditLogsPage />} />
      </Route>
    </Routes>
  );
}
