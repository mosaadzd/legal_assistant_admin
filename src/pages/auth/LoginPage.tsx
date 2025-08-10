import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function LoginPage() {
  const { login } = useAuth();
  const { push: pushToast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null); setLoading(true);
    const ok = await login(email.trim(), password);
  if (!ok) { setError('Invalid credentials or insufficient privileges'); setLoading(false); pushToast({ type: 'error', message: 'Login failed'}); return; }
  pushToast({ type: 'success', message: 'Welcome back' });
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-white to-brand-100/30 p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent">Admin Console</h1>
          <p className="text-sm text-gray-500">Sign in with an administrator account to manage the platform.</p>
        </div>
        <form onSubmit={submit} className="relative bg-white/80 backdrop-blur shadow-xl rounded-2xl border border-gray-100 p-8 space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold tracking-wide text-gray-600">Email</label>
            <input
              value={email}
              onChange={e=>setEmail(e.target.value)}
              type="email"
              autoComplete="username"
              className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold tracking-wide text-gray-600">Password</label>
              {/* Placeholder for future forgot password */}
            </div>
            <div className="relative">
              <input
                value={password}
                onChange={e=>setPassword(e.target.value)}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="w-full h-11 rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition"
                required
              />
              <button
                type="button"
                onClick={()=>setShowPassword(s=>!s)}
                className="absolute inset-y-0 right-0 px-3 text-xs text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >{showPassword ? 'Hide' : 'Show'}</button>
            </div>
          </div>
          {error && <div className="text-xs rounded-md bg-red-50 border border-red-200 text-red-600 px-3 py-2">{error}</div>}
          <button
            disabled={loading}
            className="group w-full h-12 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 text-white text-sm font-medium tracking-wide shadow hover:from-brand-500 hover:to-brand-400 focus:ring-4 focus:ring-brand-200 disabled:opacity-60 disabled:cursor-not-allowed transition"
          >
            <span className="inline-flex items-center gap-2">
              {loading && <span className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin"/>}
              {loading ? 'Signing in...' : 'Sign In'}
            </span>
          </button>
          <div className="pt-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-gray-400">© {new Date().getFullYear()} Legal Assistant</p>
          </div>
        </form>
      </div>
    </div>
  );
}
