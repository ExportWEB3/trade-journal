import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, PlusCircle, List, X } from 'lucide-react';
import { useTrades } from '../../hooks/useTrades';
import { LoadingSpinner, EmptyState, Button } from '../UI';
import TradeCard from './TradeCard';

const SYMBOLS = ['All', 'GBPUSD', 'EURUSD', 'USDCAD', 'XAUUSD', 'BTCUSD'];
const STATUSES = ['All', 'Open', 'Closed'];

const TradeList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const { trades, loading, error } = useTrades({
    symbol: selectedSymbol !== 'All' ? selectedSymbol : undefined,
    status: selectedStatus !== 'All' ? selectedStatus.toLowerCase() : undefined,
  });

  const filteredTrades = trades.filter((trade) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      trade.symbol.toLowerCase().includes(query) ||
      trade.entryReason.toLowerCase().includes(query) ||
      trade.notes.toLowerCase().includes(query) ||
      trade.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  const clearFilters = () => {
    setSelectedSymbol('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  const hasActiveFilters =
    selectedSymbol !== 'All' || selectedStatus !== 'All' || searchQuery;

  if (loading) {
    return <LoadingSpinner text="Loading trades..." />;
  }

  if (error) {
    return (
      <EmptyState
        title="Error loading trades"
        description={error}
        icon={<List className="w-8 h-8 text-red-500" />}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Trades
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            {trades.length} total trades
          </p>
        </div>
        <Button onClick={() => navigate('/add')} className="gap-2">
          <PlusCircle className="w-5 h-5" />
          Add Trade
        </Button>
      </div>

      {/* Search & Filter Bar */}
      <div className="card p-4 space-y-4">
        <div className="flex gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-12"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            )}
          </div>
          
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 transition-colors ${
              showFilters || hasActiveFilters
                ? 'accent-bg text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            <Filter className="w-5 h-5" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-white" />
            )}
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            {/* Symbol Filter */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Symbol
              </label>
              <div className="flex flex-wrap gap-2">
                {SYMBOLS.map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => setSelectedSymbol(symbol)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedSymbol === symbol
                        ? 'accent-bg text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
                Status
              </label>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      selectedStatus === status
                        ? 'accent-bg text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm accent-text hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Trades List */}
      {filteredTrades.length > 0 ? (
        <div className="space-y-3">
          {filteredTrades.map((trade) => (
            <TradeCard key={trade._id} trade={trade} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={hasActiveFilters ? 'No trades found' : 'No trades yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters'
              : 'Start tracking your trades to see them here'
          }
          action={
            hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button onClick={() => navigate('/add')} className="gap-2">
                <PlusCircle className="w-5 h-5" />
                Add your first trade
              </Button>
            )
          }
          icon={<List className="w-8 h-8 text-slate-400" />}
        />
      )}
    </div>
  );
};

export default TradeList;
