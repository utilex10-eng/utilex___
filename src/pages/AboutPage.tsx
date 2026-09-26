import React from 'react';
import { ShieldCheck, Zap, Heart, CheckCircle2, ArrowRight } from 'lucide-react';

interface AboutPageProps {
  onNavigate: (path: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Hero Header */}
      <div className="space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Our Philosophy
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">
          About UTILEX
        </h1>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
          UTILEX is an all-in-one online utility platform created to make everyday digital tasks simpler, faster, and universally accessible.
        </p>
      </div>

      {/* Founder & Contact Card */}
      <div className="p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
          The Origin of UTILEX
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          The project was conceived and founded by <strong>Daniyal</strong> (contact: <a href="mailto:utilex10@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-mono font-bold hover:underline">utilex10@gmail.com</a>) out of a real-world frustration with the current state of online utility websites: bloated with deceptive popups, aggressive paywalls, slow server queues, and unsafe document upload policies.
        </p>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
          UTILEX proves that utility software can be clean, transparent, respectful of user privacy, and blazingly fast.
        </p>

        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <span className="text-zinc-400 block">Founder & Architect</span>
            <strong className="text-zinc-900 dark:text-white text-sm">Daniyal</strong>
          </div>
          <div>
            <span className="text-zinc-400 block">Primary Contact Email</span>
            <a href="mailto:utilex10@gmail.com" className="text-indigo-600 dark:text-indigo-400 text-sm font-mono font-bold hover:underline">utilex10@gmail.com</a>
          </div>
          <div>
            <span className="text-zinc-400 block">Platform Architecture</span>
            <strong className="text-zinc-900 dark:text-white text-sm">React + Node + Gemini 3.8</strong>
          </div>
        </div>
      </div>

      {/* Core Principles Grid */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Our Four Non-Negotiable Standards
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">1. Strict Privacy First</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              We never upload personal PDFs, photos, or documents to remote server disks unless strictly required. Client-side browser synthesis keeps your data confidential.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">2. Genuine Functionality</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No mock animations or fake "Coming Soon" buttons. Every single tool in our 60+ suite executes its actual operation.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">3. Commercial Quality</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Crafted with clean typography, responsive design, dark/light modes, and intuitive micro-interactions that respect your focus.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-zinc-900 dark:text-white">4. Zero Dark Patterns</h4>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              No fake download buttons, misleading redirects, or forced subscriptions. Clean tools that get out of your way.
            </p>
          </div>
        </div>
      </div>

      {/* Contact CTA */}
      <div className="p-8 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
            Have a question or suggestion?
          </h4>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
            Daniyal and the UTILEX team welcome feature requests and technical inquiries.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/contact')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors shrink-0 shadow-md shadow-indigo-600/20"
        >
          Contact the Team
        </button>
      </div>
    </div>
  );
};
