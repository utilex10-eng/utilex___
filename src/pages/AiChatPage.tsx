import React, { useState } from 'react';
import { Bot, Send, Trash2, Copy, Check, Sparkles, RefreshCw, User as UserIcon } from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export const AiChatPage: React.FC = () => {
  const { success, error } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      role: 'model',
      content:
        '👋 Welcome to **UTILEX AI**, powered by Google Gemini 3.8 Flash! I can help you with writing code, drafting professional emails, summarizing complex documents, testing regular expressions, and solving math or logic problems. What are you working on today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const quickPrompts = [
    'Explain how to safely compress PNG images without quality loss',
    'Write a concise professional follow-up email after an interview',
    'Generate a regular expression for validating international phone numbers',
    'Summarize the core benefits of client-side PDF document manipulation',
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: query.trim(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
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
      error(err.message || 'Gemini error');
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'model',
          content: `⚠️ ${err.message || 'Unable to connect to Gemini AI. Ensure GEMINI_API_KEY is active in secrets.'}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const copyResponse = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    success('Copied response to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between p-6 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-700 to-indigo-900 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-purple-300" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">UTILEX AI Assistant</h1>
            <p className="text-xs text-purple-200">
              Powered by Google Gemini 3.8 Flash • Enterprise Reasoning & Analysis
            </p>
          </div>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: 'm1',
                role: 'model',
                content: 'Chat history reset. How can I assist you?',
              },
            ])
          }
          className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="flex flex-col h-[560px] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'model' && (
                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-zinc-800 dark:text-zinc-200'
                }`}
              >
                <div className="whitespace-pre-wrap font-sans">{m.content}</div>
                {m.role === 'model' && (
                  <div className="mt-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-700/60 flex justify-end">
                    <button
                      onClick={() => copyResponse(m.content, m.id)}
                      className="text-[11px] text-zinc-400 hover:text-indigo-500 flex items-center gap-1"
                    >
                      {copiedId === m.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      <span>{copiedId === m.id ? 'Copied' : 'Copy Response'}</span>
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
              <span>UTILEX AI is analyzing and composing answer...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Strip */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-950/40 border-t border-zinc-100 dark:border-zinc-800 flex gap-2 overflow-x-auto scrollbar-none text-xs">
          {quickPrompts.map((qp, i) => (
            <button
              key={i}
              onClick={() => handleSend(qp)}
              className="px-3 py-1 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-purple-400 shrink-0 transition-colors"
            >
              {qp}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3"
        >
          <input
            type="text"
            placeholder="Type your message or prompt here... (Shift+Enter for newline)"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 px-4 py-3 rounded-2xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-6 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm transition-all disabled:opacity-50 flex items-center gap-2 shadow-md shadow-purple-600/20"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
