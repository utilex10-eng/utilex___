import React from 'react';
import { Heart, ArrowRight } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import { TOOLS } from '../data/toolsRegistry';
import { ToolCard } from '../components/common/ToolCard';
import { ToolDefinition } from '../types';

interface FavoritesPageProps {
  onNavigate: (path: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onNavigate, onSelectTool }) => {
  const { favorites } = useFavorites();
  const favoriteToolsList = TOOLS.filter((t) => favorites.includes(t.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
            Favorite Utilities
          </h1>
        </div>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Quickly access your pinned everyday tools. Click the heart icon on any tool card to add or remove it from this shelf.
        </p>
      </div>

      {favoriteToolsList.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {favoriteToolsList.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      ) : (
        <div className="p-16 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center space-y-3">
          <Heart className="w-12 h-12 mx-auto text-zinc-300 dark:text-zinc-700" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            No favorite tools saved yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Browse our catalog and bookmark tools you frequently use for instant one-click access.
          </p>
          <button
            onClick={() => onNavigate('/tools')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors inline-flex items-center gap-1.5 mt-2"
          >
            <span>Explore All Tools</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
