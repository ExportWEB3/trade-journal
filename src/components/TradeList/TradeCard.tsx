import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { TrendingUp, TrendingDown, ChevronRight, Image } from 'lucide-react';
import { Trade } from '../../types';

interface TradeCardProps {
  trade: Trade;
}

const TradeCard = ({ trade }: TradeCardProps) => {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    const prefix = value >= 0 ? '+$' : '-$';
    return `${prefix}${Math.abs(value).toFixed(2)}`;
  };

  const isWin = (trade.pnl || 0) > 0;
  const isLoss = (trade.pnl || 0) < 0;

  return (
    <div
      onClick={() => navigate(`/trades/${trade._id}`)}
      className="card p-4 hover:shadow-md transition-all cursor-pointer active:scale-[0.99]"
    >
      <div className="flex items-center gap-4">
        {/* Direction Icon */}
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            trade.direction === 'long'
              ? 'bg-emerald-100 dark:bg-emerald-900/30'
              : 'bg-red-100 dark:bg-red-900/30'
          }`}
        >
          {trade.direction === 'long' ? (
            <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
          )}
        </div>

        {/* Trade Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-slate-900 dark:text-white">
              {trade.symbol}
            </span>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                trade.status === 'open'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
              }`}
            >
              {trade.status === 'open' ? 'Open' : 'Closed'}
            </span>
            {trade.screenshots.length > 0 && (
              <img
                src={trade.screenshots[0]}
                alt="screenshot"
                className="w-6 h-6 rounded-md object-cover border border-slate-200 dark:border-slate-700"
              />
            )}
          </div>
          <div className="flex md:flex-row flex-col bg-blak md:items-center md:gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{format(new Date(trade.entryDate), 'MMM d, yyyy')}</span>
            <span className="hidden md:flex">•</span>
            <span>{trade.lotSize} lots</span>
          </div>
          {trade.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {trade.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                >
                  {tag}
                </span>
              ))}
              {trade.tags.length > 3 && (
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400">
                  +{trade.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* P&L & Arrow */}
        <div className="flex items-center gap-3">
          {trade.status === 'closed' && trade.pnl !== undefined ? (
            <span
              className={`text-lg font-bold ${
                isWin
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : isLoss
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500'
              }`}
            >
              {formatCurrency(trade.pnl)}
            </span>
          ) : (
            <span className="text-sm text-slate-400">--</span>
          )}
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default TradeCard;
