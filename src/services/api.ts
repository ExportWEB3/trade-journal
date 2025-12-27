import axios from 'axios';
import { Trade, TradeFormData, DashboardStats } from '../types';

// Base URL: prefer VITE_API_URL from env (production), fallback to relative '/api' for dev
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
const API_BASE = rawApiUrl ? `${rawApiUrl.replace(/\/$/, '')}/api` : '/api';

export const resolveUploadUrl = (uploadPath: string) => {
  if (!uploadPath) return uploadPath;
  // If it's already absolute, return as-is
  if (/^https?:\/\//i.test(uploadPath)) return uploadPath;

  // If we have a configured raw API origin, prefix it
  if (rawApiUrl) return `${rawApiUrl.replace(/\/$/, '')}${uploadPath.startsWith('/') ? uploadPath : `/${uploadPath}`}`;

  // Fallback: assume same origin (will work if backend is proxied or same host)
  // Dev fallback: if running in dev on localhost, try backend on port 5000
  try {
    const isDev = import.meta.env.DEV;
    const host = typeof window !== 'undefined' ? window.location.hostname : null;
    if (isDev && host && (host === 'localhost' || host === '127.0.0.1')) {
      const port = 5000;
      return `${window.location.protocol}//${host}:${port}${uploadPath.startsWith('/') ? uploadPath : `/${uploadPath}`}`;
    }
  } catch (e) {
    // ignore and fallthrough
  }

  return uploadPath;
};

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Trades API
export const tradesApi = {
  getAll: async (params?: {
    status?: string;
    symbol?: string;
    startDate?: string;
    endDate?: string;
    sort?: string;
  }): Promise<Trade[]> => {
    const { data } = await api.get('/trades', { params });
    return data;
  },

  getById: async (id: string): Promise<Trade> => {
    const { data } = await api.get(`/trades/${id}`);
    return data;
  },

  create: async (trade: TradeFormData): Promise<Trade> => {
    const { data } = await api.post('/trades', trade);
    return data;
  },

  update: async (id: string, trade: Partial<TradeFormData>): Promise<Trade> => {
    const { data } = await api.put(`/trades/${id}`, trade);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/trades/${id}`);
  },

  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get('/trades/stats');
    return data;
  },

  uploadScreenshots: async (id: string, files: FileList): Promise<Trade> => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('screenshots', file);
    });
    const { data } = await api.post(`/trades/${id}/screenshots`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  deleteScreenshot: async (id: string, screenshotPath: string): Promise<Trade> => {
    const { data } = await api.delete(
      `/trades/${id}/screenshots/${encodeURIComponent(screenshotPath)}`
    );
    return data;
  },
};

export default api;
