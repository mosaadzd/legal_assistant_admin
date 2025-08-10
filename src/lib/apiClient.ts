import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE,
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('admin_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r=>r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('admin_token');
    if (!location.pathname.startsWith('/login')) {
      location.href = '/login';
    }
  }
  return Promise.reject(err);
});

export interface PaginatedUsersParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export const adminApi = {
  async login(email: string, password: string) {
    // FastAPI Users JWT login expects form data
    const form = new FormData();
    form.append('username', email);
    form.append('password', password);
    const { data } = await api.post('/auth/jwt/login', form);
    return data;
  },
  async me() {
    const { data } = await api.get('/users/me');
    return data;
  },
  async listUsers(params: PaginatedUsersParams) {
    // Backend enforces limit <= 200; clamp to avoid 422
    const safe = { ...params } as any;
    if (safe.limit && safe.limit > 200) safe.limit = 200;
    try {
      const { data } = await api.get('/admin/users', { params: safe });
      return data as any[];
    } catch (e: any) {
      if (e.response?.status === 422) {
        console.warn('Adjusting user list params due to validation error', safe);
        return [];
      }
      throw e;
    }
  },
  async userDetail(id: string) {
    const { data } = await api.get(`/admin/users/${id}`);
    return data;
  },
  async userUsageSummary(id: string, days: number) {
    const { data } = await api.get(`/admin/users/${id}/usage/summary`, { params: { days } });
    return data;
  },
  async userUsageLogs(id: string, params: { days?: number; service?: string; limit?: number }) {
    const { data } = await api.get(`/admin/users/${id}/usage/logs`, { params });
    return data;
  },
  async plans() {
    const { data } = await api.get('/admin/plans');
    return data as Record<string, any>;
  },
  async createPlan(payload: any) {
    const { data } = await api.post('/admin/plans', payload);
    return data;
  },
  async updatePlan(key: string, payload: any) {
    const { data } = await api.patch(`/admin/plans/${key}`, payload);
    return data;
  },
  async deletePlan(key: string) {
    const { data } = await api.delete(`/admin/plans/${key}`);
    return data;
  },
  async updateUserPlan(id: string, plan: string) {
    const { data } = await api.patch(`/admin/users/${id}/plan`, { plan });
    return data;
  },
  async updateUserFeatures(id: string, features: Record<string, boolean>) {
    const { data } = await api.patch(`/admin/users/${id}/features`, features);
    return data;
  },
  async updateUserRoles(id: string, roles: string[]) {
    const { data } = await api.patch(`/admin/users/${id}/roles`, { roles });
    return data;
  },
  async userChatSessions(id: string, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/admin/users/${id}/chat/sessions`, { params });
    return data as any[];
  },
  async userChatMessages(id: string, sessionId: string, params: { limit?: number }) {
    const { data } = await api.get(`/admin/users/${id}/chat/sessions/${sessionId}/messages`, { params });
    return data as any[];
  },
  async userAnalyses(id: string, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/admin/users/${id}/analysis`, { params });
    return data as any[];
  },
  async userCases(id: string, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/admin/users/${id}/cases`, { params });
    return data as any[];
  },
  async userDocuments(id: string, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/admin/users/${id}/documents`, { params });
    return data as any[];
  },
  async userForms(id: string, params: { limit?: number; offset?: number }) {
    const { data } = await api.get(`/admin/users/${id}/forms`, { params });
    return data as any[];
  },
  async globalUsageByService(days: number) {
    const { data } = await api.get('/admin/usage/by-service', { params: { days } });
    return data;
  },
  async globalUsageDaily(days: number) {
    const { data } = await api.get('/admin/usage/daily', { params: { days } });
    return data;
  },
  async auditLogs(params: { limit?: number; offset?: number; actor?: string; action?: string; q?: string; days?: number }) {
    try {
      const { data } = await api.get('/admin/audit/logs', { params });
      return data as any[];
    } catch (e: any) {
      // Graceful fallback if backend not implemented yet
      if (e.response?.status === 404) return [];
      throw e;
    }
  },
  async metricsSummary() {
    try {
      const { data } = await api.get('/admin/metrics/summary');
      return data as { total_users: number; active_24h: number; plan_counts: Record<string, number>; tokens_24h: number; calls_24h: number };
    } catch (e: any) {
      if (e.response?.status === 404) {
        return { total_users: 0, active_24h: 0, plan_counts: {}, tokens_24h: 0, calls_24h: 0 };
      }
      throw e;
    }
  }
};
