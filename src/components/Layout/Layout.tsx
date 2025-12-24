import { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  List,
  Moon,
  Sun,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/add', icon: PlusCircle, label: 'Add Trade' },
    { path: '/trades', icon: List, label: 'Trades' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 safe-top bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-bg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                TradeJournal
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Track. Analyze. Improve.
              </p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5 text-violet-500" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-24 sm:pb-8">
        <div className="max-w-7xl mx-auto px-4 py-6">{children}</div>
      </main>

      {/* Bottom Navigation - Mobile */}
      <nav className="fixed bottom-4 left-4 right-4 z-50 sm:hidden bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-slate-700/50 shadow-lg shadow-black/10 dark:shadow-black/30">
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <item.icon className="w-6 h-6" />
                <span className="text-xs mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* Side Navigation - Desktop */}
      <nav className="hidden sm:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-2 bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg border border-slate-200 dark:border-slate-700">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'accent-bg text-white'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={item.label}
            >
              <item.icon className="w-5 h-5" />
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;
