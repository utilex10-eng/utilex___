import React from 'react';
import { ShieldCheck, FileText, ChevronRight } from 'lucide-react';

interface LegalPageProps {
  type: 'privacy' | 'terms' | 'cookies' | 'disclaimer' | 'copyright';
  onNavigate: (path: string) => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ type, onNavigate }) => {
  const titles = {
    privacy: 'Privacy Policy',
    terms: 'Terms of Service',
    cookies: 'Cookie & Local Storage Policy',
    disclaimer: 'Platform Disclaimer',
    copyright: 'Copyright & Intellectual Property Notice',
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
        <button onClick={() => onNavigate('/')} className="hover:text-indigo-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-white font-bold">{titles[type]}</span>
      </nav>

      {/* Header */}
      <div className="space-y-2 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Legal & Compliance
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
          {titles[type]}
        </h1>
        <p className="text-xs text-zinc-400">
          Last Updated: March 2026 • Platform: UTILEX (Founder: Daniyal, Contact: <a href="mailto:utilex10@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-mono underline">utilex10@gmail.com</a>)
        </p>
      </div>

      {/* Legal Text Content */}
      <div className="prose dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed space-y-6">
        {type === 'privacy' && (
          <>
            <p>
              At <strong>UTILEX</strong>, safeguarding the privacy of our users is fundamental to our architecture. This Privacy Policy details our data practices across our suite of online tools.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">1. Client-Side Document & Image Processing</h3>
            <p>
              Unlike conventional online conversion websites that upload confidential PDF documents, images, and text to external servers, UTILEX executes document processing operations (including PDF merging, splitting, compression, rotating, image resampling, EXIF stripping, and cryptographic hashing) <strong>locally within your web browser memory</strong>. No copies of your uploaded files are transmitted to or stored on our servers.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">2. Artificial Intelligence Requests</h3>
            <p>
              When utilizing AI utilities powered by Google Gemini, your input prompts are transmitted via encrypted HTTPS server proxy routes solely to generate the requested output. We do not store or sell user conversation transcripts or training data.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">3. Local Storage</h3>
            <p>
              We utilize browser localStorage strictly to preserve your visual theme preference (Light/Dark mode) and your pinned tool bookmarks.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">4. Contact & Inquiries</h3>
            <p>
              For privacy-related inquiries or technical issues, reach out directly to founder Daniyal at <a href="mailto:utilex10@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-mono underline">utilex10@gmail.com</a>.
            </p>
          </>
        )}

        {type === 'terms' && (
          <>
            <p>
              Welcome to UTILEX. By accessing or using our platform and utilities, you agree to comply with and be bound by these Terms of Service.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">1. Permitted Use</h3>
            <p>
              UTILEX provides digital utilities for lawful personal, professional, and educational purposes. You agree not to use the service to process unlawful materials, distribute malicious software, or attempt to disrupt the platform infrastructure.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">2. Intellectual Property of Your Content</h3>
            <p>
              You retain 100% full ownership, copyright, and title to all documents, images, files, and text processed through UTILEX. We claim zero ownership or rights to your processed files.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">3. Limitation of Liability</h3>
            <p>
              The platform and utilities are provided "as is" and "as available" without warranties of any kind. UTILEX is not liable for any data loss resulting from local browser interruptions or improper use of tools.
            </p>
          </>
        )}

        {type === 'cookies' && (
          <>
            <p>
              UTILEX operates under a strict minimal-data philosophy. We do not use intrusive cross-site tracking cookies.
            </p>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Essential Local Storage</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>utilex_theme</strong>: Stores your preferred color scheme (Dark, Light, or System).</li>
              <li><strong>utilex_favorites</strong>: Stores your pinned tool identifiers.</li>
              <li><strong>utilex_recents</strong>: Stores IDs of your recently opened tools on this device.</li>
            </ul>
            <p>You can clear this data at any time through your browser settings or our dashboard interface.</p>
          </>
        )}

        {type === 'disclaimer' && (
          <>
            <p>
              The calculators, converters, and utilities provided on UTILEX are intended for general information and productivity purposes. While calculations are engineered to strict mathematical and standard specifications, users should independently verify critical financial or legal calculations.
            </p>
          </>
        )}

        {type === 'copyright' && (
          <>
            <p>
              © {new Date().getFullYear()} UTILEX. All rights reserved. Founded by Daniyal (<a href="mailto:utilex10@gmail.com" className="text-indigo-600 dark:text-indigo-400 font-mono underline">utilex10@gmail.com</a>).
            </p>
            <p>
              The UTILEX brand, logo design, user interface architecture, tool registry system, and original blog publications are protected by applicable intellectual property and copyright laws.
            </p>
          </>
        )}
      </div>
    </div>
  );
};
