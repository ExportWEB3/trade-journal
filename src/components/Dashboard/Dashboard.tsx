import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  TrendingUp,
  TrendingDown,
  Percent,
  DollarSign,
  BarChart3,
  PlusCircle,
  Target,
  Activity,
  Calendar,
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useTrades';
import { StatCard, LoadingSpinner, EmptyState, Button, Card } from '../UI';
import TradeCard from '../TradeList/TradeCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const { stats, loading, error } = useDashboardStats();

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading dashboard"
        description={error}
        icon={<BarChart3 className="w-8 h-8 text-red-500" />}
      />
    );
  }

  if (!stats) {
    return null;
  }

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+$' : '-$';
    return `${prefix}${Math.abs(value).toFixed(2)}`;
  };

  const getTrend = (value: number): 'up' | 'down' | 'neutral' => {
    if (value > 0) return 'up';
    if (value < 0) return 'down';
    return 'neutral';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <Button onClick={() => navigate('/add')} className="gap-2">
          <PlusCircle className="w-5 h-5" />
          Add Trade
        </Button>
      </div>

      {/* P&L Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's P&L"
          value={formatCurrency(stats.dailyPnl)}
          icon={Calendar}
          trend={getTrend(stats.dailyPnl)}
        />
        <StatCard
          label="Weekly P&L"
          value={formatCurrency(stats.weeklyPnl)}
          icon={Activity}
          trend={getTrend(stats.weeklyPnl)}
        />
        <StatCard
          label="Monthly P&L"
          value={formatCurrency(stats.monthlyPnl)}
          icon={BarChart3}
          trend={getTrend(stats.monthlyPnl)}
        />
        <StatCard
          label="Total P&L"
          value={formatCurrency(stats.totalPnl)}
          icon={DollarSign}
          trend={getTrend(stats.totalPnl)}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-3">
            <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalTrades}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Total Trades</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.winningTrades}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Winners</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.losingTrades}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Losers</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 dark:bg-violet-900/30 flex items-center justify-center mb-3">
            <Percent className="w-6 h-6 text-amber-600 dark:text-violet-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.winRate}%
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Win Rate</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${stats.avgWin}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Avg Win</p>
        </Card>

        <Card className="text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <DollarSign className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <p className="text-2xl font-bold text-red-600 dark:text-red-400">
            ${stats.avgLoss}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Avg Loss</p>
        </Card>
      </div>

      {/* Open Trades & Profit Factor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Open Trades
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.openTradesCount}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Profit Factor
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.profitFactor}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-violet-900/30 flex items-center justify-center">
              <BarChart3 className="w-7 h-7 text-amber-600 dark:text-violet-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Trades */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Recent Trades
          </h2>
          <button
            onClick={() => navigate('/trades')}
            className="text-sm accent-text hover:underline"
          >
            View all
          </button>
        </div>

        {stats.recentTrades.length > 0 ? (
          <div className="space-y-3">
            {stats.recentTrades.map((trade) => (
              <TradeCard key={trade._id} trade={trade} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No trades yet"
            description="Start tracking your trades to see them here"
            action={
              <Button onClick={() => navigate('/add')} className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Add your first trade
              </Button>
            }
            icon={<BarChart3 className="w-8 h-8 text-slate-400" />}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
