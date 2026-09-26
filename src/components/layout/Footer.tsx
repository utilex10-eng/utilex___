import React from 'react';
import { ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full bg-zinc-950 text-zinc-400 border-t border-zinc-800/80 pt-16 pb-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-zinc-800/80">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => onNavigate('/')}
              className="flex items-center gap-2.5 cursor-pointer inline-flex"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-400 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <span className="font-black text-lg text-white">U</span>
                </div>
              </div>
              <span className="font-black tracking-tight text-xl text-white">UTILEX</span>
            </div>

            <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
              Smart Tools. Simple Solutions. UTILEX is the all-in-one digital utility platform delivering 60+ lightning-fast, privacy-first tools for files, images, code, AI, and everyday productivity.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                100% Client-Side Privacy
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Gemini 3.8 Flash Engine
              </span>
            </div>
          </div>

          {/* Tools column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Tools Suite
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('/category/pdf-tools')}
                  className="hover:text-white transition-colors"
                >
                  PDF Tools (10)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/image-tools')}
                  className="hover:text-white transition-colors"
                >
                  Image Tools (10)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/text-tools')}
                  className="hover:text-white transition-colors"
                >
                  Text Tools (10)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/developer-tools')}
                  className="hover:text-white transition-colors"
                >
                  Developer Tools (10)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/ai-tools')}
                  className="hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>AI Tools (10)</span>
                  <span className="text-[10px] px-1 rounded bg-purple-500/20 text-purple-400 font-semibold">
                    Gemini
                  </span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('/category/calculators')}
                  className="hover:text-white transition-colors"
                >
                  Calculators & Converters
                </button>
              </li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About UTILEX
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact & Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/blog')} className="hover:text-white transition-colors">
                  Technical Blog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/dashboard')} className="hover:text-white transition-colors">
                  User Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin')} className="hover:text-white transition-colors">
                  Admin Console
                </button>
              </li>
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-200 mb-4">
              Legal & Policy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button onClick={() => onNavigate('/privacy-policy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/cookie-policy')} className="hover:text-white transition-colors">
                  Cookie Policy
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/disclaimer')} className="hover:text-white transition-colors">
                  Disclaimer
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/copyright')} className="hover:text-white transition-colors">
                  Copyright Notice
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar with exact founder and contact identity */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} UTILEX. All rights reserved. Created by Founder <strong className="text-zinc-300">Daniyal</strong> (Contact: <a href="mailto:utilex10@gmail.com" className="text-indigo-400 hover:text-indigo-300 font-mono underline underline-offset-2">utilex10@gmail.com</a>).</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built for speed, simplicity & privacy
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
