import React from 'react';
import {
  Heart,
  ArrowRight,
  Sparkles,
  FileText,
  Image as ImageIcon,
  Type,
  Code2,
  Calculator,
  ArrowLeftRight,
  CheckCircle2,
  Search,
  FolderArchive,
  Layers,
  Scissors,
  Minimize2,
  RotateCw,
  Crop,
  QrCode,
  Key,
  Globe,
  Palette,
  Hash,
  Clock,
  Bot
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { useFavorites } from '../../context/FavoritesContext';

interface ToolCardProps {
  tool: ToolDefinition;
  onSelect: (tool: ToolDefinition) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect }) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(tool.id);

  // Render contextual icon
  const renderIcon = () => {
    switch (tool.category) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-amber-500" />;
      case 'text':
        return <Type className="w-5 h-5 text-emerald-500" />;
      case 'developer':
        return <Code2 className="w-5 h-5 text-blue-500" />;
      case 'ai':
        return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'calculators':
        return <Calculator className="w-5 h-5 text-lime-500" />;
      case 'converters':
        return <ArrowLeftRight className="w-5 h-5 text-violet-500" />;
      case 'productivity':
        return <CheckCircle2 className="w-5 h-5 text-sky-500" />;
      case 'files':
        return <FolderArchive className="w-5 h-5 text-zinc-500" />;
      default:
        return <FileText className="w-5 h-5 text-indigo-500" />;
    }
  };

  return (
    <div
      onClick={() => onSelect(tool)}
      className="group relative bg-white dark:bg-zinc-900 rounded-2xl p-5 border border-zinc-200/90 dark:border-zinc-800/90 hover:border-indigo-400 dark:hover:border-indigo-500/70 shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Top bar inside card */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-100 dark:border-zinc-700/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
            {renderIcon()}
          </div>

          <div className="flex items-center gap-1.5">
            {tool.requiresAI && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/60 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI
              </span>
            )}
            {tool.popular && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                Popular
              </span>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleFavorite(tool.id);
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title={favorited ? 'Remove from favorites' : 'Add to favorites'}
              aria-label="Toggle favorite"
            >
              <Heart
                className={`w-4 h-4 transition-all duration-200 ${
                  favorited ? 'text-rose-500 fill-rose-500 scale-110' : 'text-zinc-400'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Title & Category */}
        <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-1">
          {tool.name}
        </h3>

        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2 mb-4">
          {tool.shortDescription}
        </p>
      </div>

      {/* Footer row */}
      <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/70 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
          {tool.categoryName}
        </span>
        <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform">
          <span>Open Tool</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
