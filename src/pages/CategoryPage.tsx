import React from 'react';
import { ArrowLeft, Layers, ShieldCheck } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../data/toolsRegistry';
import { ToolCard } from '../components/common/ToolCard';
import { ToolDefinition } from '../types';

interface CategoryPageProps {
  categorySlug: string;
  onNavigate: (path: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  onNavigate,
  onSelectTool,
}) => {
  const currentCategory = CATEGORIES.find((c) => c.slug === categorySlug) || CATEGORIES[0];
  const categoryTools = TOOLS.filter((t) => t.category === currentCategory.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <button
          onClick={() => onNavigate('/tools')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Tools</span>
        </button>
      </div>

      {/* Category Hero Banner */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentCategory.gradient} text-white flex items-center justify-center shadow-md`}
            >
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                Category Suite
              </span>
              <h1 className="text-3xl font-black text-zinc-950 dark:text-white tracking-tight">
                {currentCategory.name}
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {currentCategory.description}
          </p>
        </div>

        <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-zinc-200 dark:border-zinc-800 pt-4 md:pt-0 md:pl-8 shrink-0 text-right">
          <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {categoryTools.length}
          </span>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
            Available Tools
          </span>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          Included {currentCategory.name}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {categoryTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </div>
    </div>
  );
};
