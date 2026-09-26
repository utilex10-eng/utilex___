import React from 'react';
import {
  LayoutDashboard,
  Heart,
  Clock,
  Trash2,
  Sparkles,
  ArrowRight,
  Shield,
  User as UserIcon,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import { TOOLS } from '../data/toolsRegistry';
import { ToolCard } from '../components/common/ToolCard';
import { ToolDefinition } from '../types';

interface DashboardPageProps {
  onNavigate: (path: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onOpenAuth: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onSelectTool,
  onOpenAuth,
}) => {
  const { user, isAdmin } = useAuth();
  const { favorites, recentTools, clearRecentTools } = useFavorites();
  const { isDark, toggleTheme } = useTheme();

  const favoriteToolsList = TOOLS.filter((t) => favorites.includes(t.id));
  const recentToolsList = recentTools
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter(Boolean) as ToolDefinition[];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Welcome Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-100">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UTILEX Member Workspace</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Welcome back{user ? `, ${user.name}` : ''}!
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Your centralized productivity hub. Access your favorite shortcuts, recent tool history, and AI assistance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <button
              onClick={() => onNavigate('/admin')}
              className="px-4 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs transition-colors hover:bg-indigo-50 shadow-md"
            >
              Open Admin Console
            </button>
          )}
          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-5 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs transition-colors hover:bg-indigo-50 shadow-md"
            >
              Sign In / Register
            </button>
          )}
          <button
            onClick={() => onNavigate('/ai-chat')}
            className="px-4 py-2.5 rounded-xl bg-indigo-950/60 border border-white/20 text-white font-bold text-xs hover:bg-indigo-950 transition-colors"
          >
            Launch AI Chat
          </button>
        </div>
      </div>

      {/* Overview Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Favorites Saved
          </span>
          <div className="text-2xl font-black text-rose-500 mt-1">{favorites.length}</div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Recently Used
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {recentTools.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Total Suite Tools
          </span>
          <div className="text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {TOOLS.length}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Account Status
          </span>
          <div className="text-base font-bold text-emerald-500 mt-1">
            {user ? 'Verified Pro' : 'Guest Member'}
          </div>
        </div>
      </div>

      {/* Recent Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              Recently Used Tools
            </h2>
          </div>
          {recentTools.length > 0 && (
            <button
              onClick={clearRecentTools}
              className="text-xs text-rose-500 hover:underline flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>

        {recentToolsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {recentToolsList.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-xs">
            No recently used tools recorded yet. Launch any tool to see it appear here.
          </div>
        )}
      </div>

      {/* Favorite Tools Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500/20" />
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
              My Favorite Tools
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/tools')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Explore More
          </button>
        </div>

        {favoriteToolsList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {favoriteToolsList.map((tool) => (
              <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
            ))}
          </div>
        ) : (
          <div className="p-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center text-zinc-500 text-xs">
            You haven't bookmarked any favorites yet. Click the heart icon on any tool card!
          </div>
        )}
      </div>

      {/* Preferences & Theme section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
            Display & Appearance Settings
          </h3>
          <p className="text-xs text-zinc-500">
            Currently using {isDark ? 'Dark Mode' : 'Light Mode'}. Preference is stored locally.
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-semibold text-zinc-800 dark:text-zinc-200 flex items-center gap-2 transition-colors w-fit"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          <span>Switch to {isDark ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>
    </div>
  );
};
