import React, { useEffect } from 'react';
import {
  ArrowLeft,
  Heart,
  Share2,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Zap,
  Sparkles,
  Layers,
  ChevronRight
} from 'lucide-react';
import { ToolDefinition } from '../types';
import { ToolDispatcher } from '../components/tools/ToolDispatcher';
import { useFavorites } from '../context/FavoritesContext';
import { useToast } from '../context/ToastContext';
import { TOOLS } from '../data/toolsRegistry';
import { ToolCard } from '../components/common/ToolCard';

interface ToolDetailPageProps {
  tool: ToolDefinition;
  onNavigate: (path: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

export const ToolDetailPage: React.FC<ToolDetailPageProps> = ({
  tool,
  onNavigate,
  onSelectTool,
}) => {
  const { isFavorite, toggleFavorite, recordRecentTool } = useFavorites();
  const { success } = useToast();
  const favorited = isFavorite(tool.id);

  // Track recent tool
  useEffect(() => {
    recordRecentTool(tool.id);
  }, [tool.id, recordRecentTool]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${tool.name} - UTILEX`,
          text: tool.shortDescription,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      success('Link copied to clipboard!');
    }
  };

  // Related tools from same category
  const relatedTools = TOOLS.filter(
    (t) => t.category === tool.category && t.id !== tool.id
  ).slice(0, 4);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* 1. Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
        <button onClick={() => onNavigate('/')} className="hover:text-indigo-600 transition-colors">
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <button
          onClick={() => onNavigate(`/category/${tool.category}-tools`)}
          className="hover:text-indigo-600 transition-colors capitalize"
        >
          {tool.categoryName}
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-white font-bold">{tool.name}</span>
      </nav>

      {/* 2. Tool Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
                {tool.name}
              </h1>
              {tool.requiresAI && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Gemini AI
                </span>
              )}
            </div>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
              {tool.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleFavorite(tool.id)}
              className={`p-2.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-semibold ${
                favorited
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/50 text-rose-600 dark:text-rose-400'
                  : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:border-rose-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-500' : ''}`} />
              <span>{favorited ? 'Favorited' : 'Favorite'}</span>
            </button>

            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-xs font-semibold flex items-center gap-1.5"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Real Interactive Tool Interface */}
      <div>
        <ToolDispatcher tool={tool} />
      </div>

      {/* 4. How To Use Section */}
      <div className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-4">
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <span>How to Use {tool.name}</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {tool.howToUse.map((step, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex flex-col justify-between"
            >
              <span className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-3">
                {idx + 1}
              </span>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                {step}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Key Features & Supported Formats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Features list */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-500" />
            <span>Key Advantages</span>
          </h3>
          <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {tool.features.map((feat, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Security & Formats */}
        <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Privacy & File Compatibility</span>
          </h3>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            All file data and operations run locally within your web browser’s sandboxed environment. Nothing is stored on remote disks, ensuring maximum privacy compliance for personal and enterprise documents.
          </p>
          {tool.supportedFormats && tool.supportedFormats.length > 0 && (
            <div className="pt-2">
              <span className="text-xs font-semibold text-zinc-500 block mb-1.5">
                Supported Input Formats:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {tool.supportedFormats.map((fmt) => (
                  <span
                    key={fmt}
                    className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300"
                  >
                    {fmt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. FAQ Section */}
      {tool.faqs && tool.faqs.length > 0 && (
        <div className="space-y-4 pt-4">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <span>Frequently Asked Questions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tool.faqs.map((f, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
              >
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">
                  {f.question}
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {f.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Related Tools */}
      {relatedTools.length > 0 && (
        <div className="space-y-4 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
              Related {tool.categoryName}
            </h3>
            <button
              onClick={() => onNavigate(`/category/${tool.category}-tools`)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {relatedTools.map((rt) => (
              <ToolCard key={rt.id} tool={rt} onSelect={onSelectTool} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
