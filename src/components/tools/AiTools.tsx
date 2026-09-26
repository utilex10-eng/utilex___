import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Bot,
  User as UserIcon,
  AlertCircle,
  HelpCircle,
  Globe,
  Settings
} from 'lucide-react';
import { ToolDefinition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AiToolsProps {
  tool: ToolDefinition;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const AiTools: React.FC<AiToolsProps> = ({ tool }) => {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'model',
      content:
        'Hello! I am **UTILEX AI**, powered by Google Gemini 3.8 Flash. How can I assist you with code, document analysis, writing, or calculations today?',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Specialized AI tools state
  const [utilityInput, setUtilityInput] = useState(
    'UTILEX provides an all-in-one suite of 60+ online tools for PDF editing, image conversion, text processing, developer utilities, and AI assistance. Created by Daniyal (utilex10), it prioritizes user privacy, zero server file retention, and instant in-browser performance.'
  );
  const [utilityResult, setUtilityResult] = useState<string | null>(null);

  // Tool specific options
  const [summaryStyle, setSummaryStyle] = useState('bullet points');
  const [paraphraseTone, setParaphraseTone] = useState('professional');
  const [emailPurpose, setEmailPurpose] = useState('professional follow-up');
  const [targetLanguage, setTargetLanguage] = useState('Spanish');

  const copyText = (txt: string, idx = 0) => {
    navigator.clipboard.writeText(txt);
    setCopiedIndex(idx);
    success('Copied AI response to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Chat submit
  const sendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: chatInput.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Gemini AI is not configured or failed to respond.');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          content: data.data.reply,
        },
      ]);
    } catch (err: any) {
      error(err.message || 'Error communicating with Gemini AI.');
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          content: `⚠️ ${err.message || 'Unable to connect to Gemini AI. Please ensure GEMINI_API_KEY is configured in your project secrets.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Utility AI submit
  const runAiUtility = async () => {
    if (!utilityInput.trim() || loading) return;
    setLoading(true);
    setUtilityResult(null);

    let toolType = 'summarizer';
    if (tool.id === 'ai-paraphraser') toolType = 'paraphraser';
    if (tool.id === 'ai-text-improver') toolType = 'improver';
    if (tool.id === 'ai-email-writer') toolType = 'email-writer';
    if (tool.id === 'ai-title-generator') toolType = 'title-generator';
    if (tool.id === 'ai-meta-description-generator') toolType = 'meta-description';
    if (tool.id === 'ai-faq-generator') toolType = 'faq-generator';
    if (tool.id === 'ai-translator') toolType = 'translator';
    if (tool.id === 'ai-text-analyzer') toolType = 'text-analyzer';

    try {
      const res = await fetch('/api/ai/utility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolType,
          input: utilityInput.trim(),
          options: {
            style: summaryStyle,
            tone: paraphraseTone,
            purpose: emailPurpose,
            targetLanguage,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Gemini AI processing failed.');
      }

      setUtilityResult(data.data.result);
      success('AI Task Completed Successfully!');
    } catch (err: any) {
      error(err.message || 'Error running Gemini tool.');
      setUtilityResult(`⚠️ ${err.message || 'Gemini AI is not configured. Please verify your GEMINI_API_KEY secret.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-6">
      {/* 1. Dedicated Full AI Chat Assistant */}
      {tool.id === 'utilex-ai-chat' ? (
        <div className="flex flex-col h-[580px] rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50 dark:bg-zinc-950/40">
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                  <span>UTILEX AI Chat</span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                    Gemini 3.8 Flash
                  </span>
                </h4>
              </div>
            </div>
            <button
              onClick={() =>
                setMessages([
                  {
                    id: 'm1',
                    role: 'model',
                    content: 'Hello! I am UTILEX AI. How can I assist you today?',
                  },
                ])
              }
              className="text-xs text-zinc-400 hover:text-rose-500 flex items-center gap-1 p-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>

          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map((m, idx) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Sparkles className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                      : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                  {m.role === 'model' && (
                    <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                      <button
                        onClick={() => copyText(m.content, idx)}
                        className="text-[11px] text-zinc-400 hover:text-indigo-500 flex items-center gap-1"
                      >
                        {copiedIndex === idx ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedIndex === idx ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-zinc-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>UTILEX AI is reasoning...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <form
            onSubmit={sendChatMessage}
            className="p-3 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything or request document analysis (Enter to send)..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-colors disabled:opacity-50 flex items-center gap-1.5 shrink-0 shadow-md shadow-purple-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      ) : (
        /* 2. Specialized Utility AI Task Interface (Summarizer, Paraphraser, Email Writer, etc.) */
        <div className="space-y-5">
          {/* Options Row */}
          {tool.id === 'ai-text-summarizer' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Format:</span>
              {['bullet points', 'executive summary', 'TL;DR snippet'].map((style) => (
                <button
                  key={style}
                  onClick={() => setSummaryStyle(style)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    summaryStyle === style
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          )}

          {tool.id === 'ai-paraphraser' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Tone:</span>
              {['professional', 'creative', 'academic', 'casual', 'concise'].map((tone) => (
                <button
                  key={tone}
                  onClick={() => setParaphraseTone(tone)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    paraphraseTone === tone
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {tone}
                </button>
              ))}
            </div>
          )}

          {tool.id === 'ai-email-writer' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Email Purpose:</span>
              {['professional follow-up', 'sales pitch', 'meeting request', 'inquiry response'].map((p) => (
                <button
                  key={p}
                  onClick={() => setEmailPurpose(p)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    emailPurpose === p
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          {tool.id === 'ai-translator' && (
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Target Language:</span>
              {['Spanish', 'French', 'German', 'Japanese', 'Arabic', 'Portuguese'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setTargetLanguage(lang)}
                  className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                    targetLanguage === lang
                      ? 'bg-purple-600 text-white'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          {/* Input text */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
              Input Document / Notes / Prompt:
            </label>
            <textarea
              rows={6}
              value={utilityInput}
              onChange={(e) => setUtilityInput(e.target.value)}
              placeholder="Paste content here..."
              className="w-full p-4 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-900 dark:text-white text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-purple-500 leading-relaxed"
            />
          </div>

          {/* Action button */}
          <button
            onClick={runAiUtility}
            disabled={!utilityInput.trim() || loading}
            className="w-full py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all shadow-md shadow-purple-600/25 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Processing with Gemini 3.8 Flash...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate with UTILEX AI</span>
              </>
            )}
          </button>

          {/* Result view */}
          {utilityResult && (
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-purple-200 dark:border-purple-900/60 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  AI Generated Result
                </span>
                <button
                  onClick={() => copyText(utilityResult, 999)}
                  className="hover:underline flex items-center gap-1 text-zinc-600 dark:text-zinc-400"
                >
                  {copiedIndex === 999 ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedIndex === 999 ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {utilityResult}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
