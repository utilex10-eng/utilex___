import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, RefreshCw, Copy, Check, ExternalLink, ShieldCheck, Clock } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const { success, error } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  const PRIMARY_EMAIL = 'utilex10@gmail.com';

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PRIMARY_EMAIL);
    setCopiedEmail(true);
    success(`Copied ${PRIMARY_EMAIL} to clipboard!`);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      error('Please complete all required fields.');
      return;
    }
    if (message.length < 10) {
      error('Please write a message with at least 10 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to submit message.');
      }

      setSubmitted(true);
      success(`Message sent! Routed directly to Daniyal (${PRIMARY_EMAIL}).`);
    } catch (err: any) {
      error(err.message || 'Error sending message. Please try again or email us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Get in Touch
        </span>
        <h1 className="text-4xl font-black text-zinc-950 dark:text-white tracking-tight">
          Contact UTILEX
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
          Questions, bug reports, feature suggestions, or problem reports? Send a message directly to founder <strong>Daniyal</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Contact Info Card */}
        <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-5">
          <div className="space-y-1">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
              Direct Contact
            </h3>
            <p className="text-xs text-zinc-500">
              Founder: <strong>Daniyal</strong>
            </p>
          </div>

          <div className="space-y-3 text-xs">
            {/* Primary Email Box */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-800/80 border border-indigo-100 dark:border-indigo-900/40 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium block text-[11px]">Primary Contact Email</span>
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold">
                  Official
                </span>
              </div>
              <a
                href={`mailto:${PRIMARY_EMAIL}?subject=UTILEX%20User%20Inquiry%20or%20Problem%20Report`}
                className="text-indigo-600 dark:text-indigo-400 font-mono font-bold text-sm hover:underline block break-all"
              >
                {PRIMARY_EMAIL}
              </a>
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-700 dark:hover:bg-zinc-600 text-zinc-700 dark:text-zinc-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Email</span>
                    </>
                  )}
                </button>
                <a
                  href={`mailto:${PRIMARY_EMAIL}?subject=UTILEX%20Problem%20Report%20/%20Inquiry`}
                  className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 transition-colors flex items-center justify-center"
                  title="Open mail client"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-400 block mb-0.5">Response Time</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                  Within 24-48 business hours
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-zinc-400 block mb-0.5">Privacy Notice</span>
                <span className="text-zinc-800 dark:text-zinc-200 font-medium">
                  Your email is strictly private and never shared.
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Prefer direct messaging? Click the link above to open Gmail or your preferred email application.
          </div>
        </div>

        {/* Contact Form */}
        <div className="md:col-span-2">
          {submitted ? (
            <div className="p-10 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center space-y-5 animate-in fade-in">
              <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                Message Sent Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 max-w-md mx-auto leading-relaxed">
                Thank you for reaching out to UTILEX. Your message has been received and routed directly to Founder <strong>Daniyal</strong> (<span className="font-mono">{PRIMARY_EMAIL}</span>).
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setMessage('');
                    setSubject('');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  Send Another Message
                </button>
                <a
                  href={`mailto:${PRIMARY_EMAIL}?subject=Follow-up:%20${encodeURIComponent(subject || 'UTILEX Inquiry')}`}
                  className="px-5 py-2.5 rounded-xl bg-white dark:bg-zinc-900 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 font-bold text-xs hover:bg-emerald-50 transition-colors inline-flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Email Directly ({PRIMARY_EMAIL})</span>
                </a>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  Send Message
                </span>
                <span className="text-xs text-zinc-400">
                  Direct dispatch to <strong className="text-indigo-600 dark:text-indigo-400 font-mono">{PRIMARY_EMAIL}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Your Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="your-email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  placeholder="e.g. Issue with PDF Merge or Feature Suggestion"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Message or Problem Description *
                </label>
                <textarea
                  rows={5}
                  required
                  placeholder="Describe your question, problem, or feature request in detail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              <div className="space-y-3 pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Sending to Daniyal ({PRIMARY_EMAIL})...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send to Daniyal ({PRIMARY_EMAIL})</span>
                    </>
                  )}
                </button>

                <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                  Or email directly via your mail client to{' '}
                  <a
                    href={`mailto:${PRIMARY_EMAIL}?subject=${encodeURIComponent(subject || 'UTILEX User Problem Report')}&body=${encodeURIComponent(message || '')}`}
                    className="text-indigo-600 dark:text-indigo-400 font-mono font-medium hover:underline"
                  >
                    {PRIMARY_EMAIL}
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
