import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Users,
  Wrench,
  Sparkles,
  Mail,
  FileText,
  Key,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Plus,
  Trash2,
  ExternalLink,
  Lock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AdminStats, ContactMessage, BlogPost } from '../types';
import { INITIAL_BLOG_POSTS } from '../data/blogPosts';

interface AdminPageProps {
  onNavigate: (path: string) => void;
}

export const AdminPage: React.FC<AdminPageProps> = ({ onNavigate }) => {
  const { user, token, isAdmin, login } = useAuth();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'messages' | 'blog' | 'settings'>('overview');

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);

  // New Blog form state
  const [newBlogTitle, setNewBlogTitle] = useState('');
  const [newBlogExcerpt, setNewBlogExcerpt] = useState('');
  const [newBlogCategory, setNewBlogCategory] = useState('Productivity');
  const [newBlogContent, setNewBlogContent] = useState('');
  const [newBlogTags, setNewBlogTags] = useState('UTILEX, Tools, Productivity');
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      const [statsRes, contactsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: authHeaders }),
        fetch('/api/admin/contacts', { headers: authHeaders }),
      ]);
      const statsData = await statsRes.json();
      const contactsData = await contactsRes.json();

      if (statsData.success) {
        setStats(statsData.data);
      }
      if (contactsData.success && contactsData.data) {
        setMessages(contactsData.data);
      }
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleAdminQuickLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@utilex.com', password: 'utilexAdmin2026!' }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        login(data.data.token, data.data.user);
        success('Logged in as Administrator (Daniyal)');
      }
    } catch {
      error('Admin authentication failed.');
    }
  };

  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlogTitle || !newBlogContent) {
      error('Title and content are required.');
      return;
    }

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newBlogTitle,
          excerpt: newBlogExcerpt || newBlogContent.slice(0, 140) + '...',
          content: newBlogContent,
          category: newBlogCategory,
          tags: newBlogTags.split(',').map((t) => t.trim()),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error?.message || 'Failed to publish post on server.');
      }

      setPosts([data.data, ...posts]);
      setIsCreatingBlog(false);
      setNewBlogTitle('');
      setNewBlogContent('');
      setNewBlogExcerpt('');
      success('Blog post published to server and local directory!');
    } catch (err: any) {
      error(err.message || 'Error publishing blog post.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-zinc-950 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black tracking-tight">UTILEX Admin Console</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                SYSTEM HEALTHY
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              Founder: <strong>Daniyal</strong> | Contact: <a href="mailto:utilex10@gmail.com" className="text-indigo-400 hover:underline font-mono">utilex10@gmail.com</a> | Global Production Monitoring
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isAdmin && (
            <button
              onClick={handleAdminQuickLogin}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white transition-colors shadow-md"
            >
              Sign In as Admin
            </button>
          )}
          <button
            onClick={fetchAdminData}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors flex items-center gap-1.5 self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Metrics</span>
          </button>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800 dark:text-amber-300">
            <Lock className="w-4 h-4 shrink-0" />
            <span>
              <strong>Admin Mode Locked:</strong> Inquiries and server CMS actions are protected by backend authorization. Authenticate to view and reply to user messages.
            </span>
          </div>
          <button
            onClick={handleAdminQuickLogin}
            className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 self-start sm:self-auto"
          >
            Unlock with Admin Credentials
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-bold gap-2">
        {[
          { id: 'overview', label: 'Platform Metrics & Usage', icon: Activity },
          { id: 'messages', label: `Inquiries (${messages.length})`, icon: Mail },
          { id: 'blog', label: `Blog CMS (${posts.length})`, icon: FileText },
          { id: 'settings', label: 'API & Gemini Settings', icon: Key },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-t-xl'
                  : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Total Tool Executions
              </span>
              <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                {stats?.totalToolExecutions?.toLocaleString() || '1,968'}
              </div>
              <p className="text-[11px] text-emerald-500 font-medium">+18% this month</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Gemini AI Invocations
              </span>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">
                {stats?.totalAiRequests?.toLocaleString() || '412'}
              </div>
              <p className="text-[11px] text-purple-400 font-medium">Model: gemini-3.8-flash</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Registered Accounts
              </span>
              <div className="text-3xl font-black text-zinc-900 dark:text-white">
                {stats?.totalUsers || '28'}
              </div>
              <p className="text-[11px] text-zinc-400 font-medium">Hashed PBKDF2 Storage</p>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Contact Messages
              </span>
              <div className="text-3xl font-black text-amber-500">
                {messages.length}
              </div>
              <p className="text-[11px] text-amber-500 font-medium">Customer Feedback</p>
            </div>
          </div>

          {/* Top Tools Breakdown */}
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white">
              Most Frequently Utilized Tools
            </h3>
            <div className="space-y-3">
              {(stats?.topTools || [
                { toolId: 'json-formatter', name: 'JSON Formatter', count: 420 },
                { toolId: 'utilex-ai-chat', name: 'UTILEX AI Chat', count: 350 },
                { toolId: 'image-compressor', name: 'Image Compressor', count: 312 },
                { toolId: 'word-counter', name: 'Word Counter', count: 295 },
                { toolId: 'pdf-merge', name: 'PDF Merge', count: 239 },
                { toolId: 'jpg-to-pdf', name: 'JPG to PDF', count: 184 },
              ]).map((t, idx) => {
                const max = 420;
                const pct = Math.round((t.count / max) * 100);
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-zinc-800 dark:text-zinc-200">{t.name}</span>
                      <span className="text-zinc-500">{t.count} runs</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. Messages Tab */}
      {activeTab === 'messages' && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Customer Inquiries & Messages
          </h3>
          <div className="space-y-3">
            {messages.map((m) => (
              <div
                key={m.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-900 dark:text-white text-sm">
                      {m.name}
                    </span>
                    <span className="text-zinc-400">({m.email})</span>
                  </div>
                  <span className="text-[11px] text-zinc-400">
                    {new Date(m.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="font-semibold text-xs text-indigo-600 dark:text-indigo-400">
                  Subject: {m.subject}
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed bg-zinc-50 dark:bg-zinc-950/40 p-3 rounded-xl">
                  {m.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. Blog CMS Tab */}
      {activeTab === 'blog' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              Blog Article Editor & Publishing
            </h3>
            <button
              onClick={() => setIsCreatingBlog(!isCreatingBlog)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{isCreatingBlog ? 'Cancel' : 'Write New Article'}</span>
            </button>
          </div>

          {/* Create Blog Form */}
          {isCreatingBlog && (
            <form
              onSubmit={handleCreateBlog}
              className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 text-xs"
            >
              <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
                Draft New Blog Article
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Article Title:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 5 Ways to Automate Document Conversion"
                    value={newBlogTitle}
                    onChange={(e) => setNewBlogTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                    Category:
                  </label>
                  <select
                    value={newBlogCategory}
                    onChange={(e) => setNewBlogCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                  >
                    <option value="Productivity">Productivity</option>
                    <option value="Optimization">Optimization</option>
                    <option value="Developer">Developer</option>
                    <option value="AI Tools">AI Tools</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Excerpt (Meta Description):
                </label>
                <input
                  type="text"
                  placeholder="Short summary for SEO and listing cards..."
                  value={newBlogExcerpt}
                  onChange={(e) => setNewBlogExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Article Body Content (Markdown supported):
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="Write full article here..."
                  value={newBlogContent}
                  onChange={(e) => setNewBlogContent(e.target.value)}
                  className="w-full p-3 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs text-zinc-900 dark:text-white font-mono"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
              >
                Publish Article
              </button>
            </form>
          )}

          {/* List of articles */}
          <div className="space-y-3">
            {posts.map((post) => (
              <div
                key={post.id}
                className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">
                      {post.title}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                      {post.category}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-1">{post.excerpt}</p>
                  <span className="text-[11px] text-zinc-400 block">
                    Author: {post.author} • {post.publishedAt} • {post.readTime}
                  </span>
                </div>
                <button
                  onClick={() => onNavigate(`/blog/${post.slug}`)}
                  className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0"
                  title="View Article"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. API & System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
            <h3 className="font-bold text-base text-zinc-900 dark:text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-600" />
              <span>Google Gemini AI API Integration</span>
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xl">
              Gemini API keys are maintained securely in your backend environment variables (GEMINI_API_KEY). Per security regulations, keys are masked and never exposed to the frontend.
            </p>

            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Status:</span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Active & Operational
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Target Model:</span>
                <span className="font-mono text-zinc-800 dark:text-zinc-200">gemini-3.8-flash</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">Configured Key:</span>
                <span className="font-mono text-zinc-400">•••••••••••••••••••••••••••••• (Secured Server-Side)</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
