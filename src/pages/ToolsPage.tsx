import React, { useState, useMemo } from 'react';
import { Search, Filter, Sparkles, X } from 'lucide-react';
import { CATEGORIES, TOOLS } from '../data/toolsRegistry';
import { ToolCard } from '../components/common/ToolCard';
import { ToolDefinition } from '../types';

interface ToolsPageProps {
  onSelectTool: (tool: ToolDefinition) => void;
  initialCategory?: string;
}

export const ToolsPage: React.FC<ToolsPageProps> = ({
  onSelectTool,
  initialCategory = 'all',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredTools = useMemo(() => {
    return TOOLS.filter((t) => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const cleanQ = searchQuery.toLowerCase().trim();
      if (!cleanQ) return matchCat;

      const matchName = t.name.toLowerCase().includes(cleanQ);
      const matchDesc = t.shortDescription.toLowerCase().includes(cleanQ);
      const matchKw = t.keywords.some((kw) => kw.toLowerCase().includes(cleanQ));
      return matchCat && (matchName || matchDesc || matchKw);
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Header */}
      <div className="space-y-3">
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
          All Online Utilities
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Browse our complete catalog of {TOOLS.length} specialized tools for files, graphics, formatting, security, calculations, and artificial intelligence.
        </p>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-4">
        {/* Search Bar */}
        <div className="relative max-w-lg">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search tools by title, format, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            All Tools ({TOOLS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = TOOLS.filter((t) => t.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  selectedCategory === cat.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Tools Grid */}
      {filteredTools.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="p-16 text-center rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <Search className="w-10 h-10 mx-auto text-zinc-400 opacity-60" />
          <h3 className="font-bold text-base text-zinc-900 dark:text-white">
            No tools matched your criteria
          </h3>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search terms or switch categories to explore other available utilities.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs transition-colors mt-2"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
