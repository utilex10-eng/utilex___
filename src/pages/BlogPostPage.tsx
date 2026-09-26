import React from 'react';
import { ArrowLeft, Clock, User, Share2, Tag, ChevronRight } from 'lucide-react';
import { BlogPost } from '../types';
import { useToast } from '../context/ToastContext';

interface BlogPostPageProps {
  post: BlogPost;
  onNavigate: (path: string) => void;
}

export const BlogPostPage: React.FC<BlogPostPageProps> = ({ post, onNavigate }) => {
  const { success } = useToast();

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    success('Article link copied to clipboard!');
  };

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs font-semibold text-zinc-500">
        <button onClick={() => onNavigate('/')} className="hover:text-indigo-600">Home</button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <button onClick={() => onNavigate('/blog')} className="hover:text-indigo-600">Blog</button>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-zinc-900 dark:text-white font-bold truncate max-w-xs">{post.title}</span>
      </nav>

      {/* Article Header */}
      <div className="space-y-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
            {post.category}
          </span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-500">{post.readTime}</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight leading-tight">
          {post.title}
        </h1>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400">
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center">
              D
            </div>
            <div>
              <span className="font-bold text-zinc-900 dark:text-white block">
                {post.author} (Founder of UTILEX)
              </span>
              <span>Published on {post.publishedAt}</span>
            </div>
          </div>

          <button
            onClick={handleShare}
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share Article</span>
          </button>
        </div>
      </div>

      {/* Article Content */}
      <div className="prose dark:prose-invert max-w-none text-zinc-800 dark:text-zinc-200 text-base leading-relaxed space-y-6">
        {post.content.split('\n\n').map((paragraph, idx) => {
          if (paragraph.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-2xl font-bold text-zinc-950 dark:text-white mt-8 mb-3">
                {paragraph.replace('### ', '')}
              </h3>
            );
          }
          if (paragraph.startsWith('1. ') || paragraph.startsWith('- ')) {
            return (
              <div key={idx} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 whitespace-pre-wrap font-sans text-sm">
                {paragraph}
              </div>
            );
          }
          return <p key={idx}>{paragraph}</p>;
        })}
      </div>

      {/* Tags & Return */}
      <div className="pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Tag className="w-3.5 h-3.5 text-zinc-400" />
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        <button
          onClick={() => onNavigate('/blog')}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Articles</span>
        </button>
      </div>
    </article>
  );
};
