import { useState, useEffect, useCallback } from 'react';
import { Trade, DashboardStats, TradeFormData } from '../types';
import { tradesApi } from '../services/api';

export const useTrades = (params?: {
  status?: string;
  symbol?: string;
  startDate?: string;
  endDate?: string;
}) => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tradesApi.getAll(params);
      setTrades(data);
    } catch (err) {
      setError('Failed to fetch trades');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [params?.status, params?.symbol, params?.startDate, params?.endDate]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return { trades, loading, error, refetch: fetchTrades };
};

export const useTrade = (id: string | undefined) => {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrade = useCallback(async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await tradesApi.getById(id);
      setTrade(data);
    } catch (err) {
      setError('Failed to fetch trade');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  return { trade, loading, error, refetch: fetchTrade, setTrade };
};

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tradesApi.getStats();
      setStats(data);
    } catch (err) {
      setError('Failed to fetch stats');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

export const useTradeActions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrade = async (data: TradeFormData): Promise<Trade | null> => {
    try {
      setLoading(true);
      setError(null);
      const trade = await tradesApi.create(data);
      return trade;
    } catch (err) {
      setError('Failed to create trade');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTrade = async (id: string, data: Partial<TradeFormData>): Promise<Trade | null> => {
    try {
      setLoading(true);
      setError(null);
      const trade = await tradesApi.update(id, data);
      return trade;
    } catch (err) {
      setError('Failed to update trade');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrade = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await tradesApi.delete(id);
      return true;
    } catch (err) {
      setError('Failed to delete trade');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadScreenshots = async (id: string, files: FileList): Promise<Trade | null> => {
    try {
      setLoading(true);
      setError(null);
      const trade = await tradesApi.uploadScreenshots(id, files);
      return trade;
    } catch (err) {
      setError('Failed to upload screenshots');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteScreenshot = async (id: string, path: string): Promise<Trade | null> => {
    try {
      setLoading(true);
      setError(null);
      const trade = await tradesApi.deleteScreenshot(id, path);
      return trade;
    } catch (err) {
      setError('Failed to delete screenshot');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    createTrade,
    updateTrade,
    deleteTrade,
    uploadScreenshots,
    deleteScreenshot,
  };
};
