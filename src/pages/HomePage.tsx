import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  CheckCircle2,
  FileText,
  Image as ImageIcon,
  Type,
  Code2,
  Calculator,
  Search,
  Cpu,
  Layers
} from 'lucide-react';
import { CATEGORIES, TOOLS } from '../data/toolsRegistry';
import { ToolCard } from '../components/common/ToolCard';
import { ToolDefinition } from '../types';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectTool: (tool: ToolDefinition) => void;
  onOpenSearch: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectTool,
  onOpenSearch,
}) => {
  const popularTools = TOOLS.filter((t) => t.popular).slice(0, 8);

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Soft Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-indigo-500/15 via-purple-500/10 to-sky-500/15 blur-3xl -z-10 rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/80 text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>UTILEX 2.0 • 60+ High-Performance Online Utilities</span>
          </div>

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-zinc-950 dark:text-white tracking-tight leading-[1.08]">
            Powerful Tools. <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500 bg-clip-text text-transparent">
              One Simple Platform.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-zinc-600 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            UTILEX gives you professional, lightning-fast utilities for files, PDFs, images, text, developer code, AI, and productivity. 100% private in-browser execution with zero subscription walls.
          </p>

          {/* CTA Group */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
            <button
              onClick={() => onNavigate('/tools')}
              className="px-7 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>Explore All 60+ Tools</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('/ai-chat')}
              className="px-6 py-3.5 rounded-2xl bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-sm transition-all shadow-sm hover:-translate-y-0.5 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>Try UTILEX AI</span>
            </button>
          </div>

          {/* Quick Search Bar directly in Hero */}
          <div className="pt-6 max-w-xl mx-auto">
            <div
              onClick={onOpenSearch}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shadow-lg shadow-zinc-500/5 hover:border-indigo-500 cursor-pointer transition-all"
            >
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <span className="text-xs sm:text-sm text-zinc-400 flex-1 text-left">
                Search tools (e.g., "pdf merge", "image compressor", "uuid")...
              </span>
              <kbd className="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-mono text-xs border border-zinc-200 dark:border-zinc-700">
                ⌘K
              </kbd>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy Pill Strip */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-zinc-900 dark:text-white">100% Privacy</h5>
              <p className="text-[11px] text-zinc-500">Processed locally in browser</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-zinc-900 dark:text-white">Zero Wait Time</h5>
              <p className="text-[11px] text-zinc-500">Instant hardware acceleration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-zinc-900 dark:text-white">Gemini 3.8 AI</h5>
              <p className="text-[11px] text-zinc-500">Deep reasoning & summaries</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h5 className="font-bold text-xs text-zinc-900 dark:text-white">No Watermarks</h5>
              <p className="text-[11px] text-zinc-500">Clean, unlimited exports</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Explore By Category
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
              Organized for Fast Discovery
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/categories')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {CATEGORIES.map((cat) => {
            const count = TOOLS.filter((t) => t.category === cat.id).length;
            return (
              <div
                key={cat.id}
                onClick={() => onNavigate(`/category/${cat.slug}`)}
                className="group relative p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500/70 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${cat.gradient} text-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}
                    >
                      <Layers className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                      {count} Tools
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
                  <span>Browse Category</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Popular Tools Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Community Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight mt-1">
              Most Frequently Used Utilities
            </h2>
          </div>
          <button
            onClick={() => onNavigate('/tools')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
          >
            <span>See all 60+ tools</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {popularTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} onSelect={onSelectTool} />
          ))}
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 space-y-6 pt-10">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
            Everything You Need to Know About UTILEX
          </h2>
        </div>

        <div className="space-y-3 pt-4">
          {[
            {
              q: 'Is UTILEX really 100% free with no watermarks?',
              a: 'Yes! All client-side tools (PDF merge, split, compression, image tools, code formatters, and calculators) execute directly on your device with no watermarks and no subscription paywalls.',
            },
            {
              q: 'Are my uploaded files and PDFs kept private?',
              a: 'Yes! Unlike legacy tool sites that upload confidential contracts and pictures to remote third-party servers, UTILEX processes your files in-memory right inside your browser window. Zero bytes are permanently stored.',
            },
            {
              q: 'What model powers the AI tools and chat?',
              a: 'UTILEX AI is powered by Google Gemini 3.8 Flash through a secured backend proxy, providing high-speed reasoning, document summarization, and multi-language translation without exposing API keys to the browser.',
            },
            {
              q: 'Who founded UTILEX?',
              a: 'UTILEX was created and architected by Daniyal (primary contact: utilex10@gmail.com) to make everyday digital tasks simpler, faster, and universally accessible.',
            },
          ].map((faq, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5"
            >
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">{faq.q}</h4>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
