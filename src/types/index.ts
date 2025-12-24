export interface Trade {
  _id: string;
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  entryDate: string;
  exitDate?: string;
  pnl?: number;
  pnlPercent?: number;
  status: 'open' | 'closed';
  entryReason: string;
  notes: string;
  afterReview: string;
  screenshots: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TradeFormData {
  symbol: string;
  direction: 'long' | 'short';
  entryPrice: number;
  exitPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  lotSize: number;
  entryDate: string;
  exitDate?: string;
  pnl?: number;
  status: 'open' | 'closed';
  entryReason: string;
  notes: string;
  afterReview: string;
  tags: string[];
}

export interface DashboardStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  totalPnl: number;
  winRate: number;
  profitFactor: number | string;
  avgWin: number;
  avgLoss: number;
  openTradesCount: number;
  recentTrades: Trade[];
  dailyPnl: number;
  weeklyPnl: number;
  monthlyPnl: number;
}

export type Theme = 'light' | 'dark';
