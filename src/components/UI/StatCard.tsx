import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

const StatCard = ({ label, value, icon: Icon, trend, className = '' }: StatCardProps) => {
  const trendColors = {
    up: 'text-emerald-500',
    down: 'text-red-500',
    neutral: 'text-slate-500 dark:text-slate-400',
  };

  return (
    <div className={`stat-card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="stat-label">{label}</p>
          <p className={`stat-value ${trend ? trendColors[trend] : 'text-slate-900 dark:text-white'}`}>
            {value}
          </p>
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
            <Icon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
