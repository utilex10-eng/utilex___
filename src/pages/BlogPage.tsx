import React, { useState } from 'react';
import { ArrowRight, Clock, User as UserIcon, Tag, Search } from 'lucide-react';
import { INITIAL_BLOG_POSTS } from '../data/blogPosts';
import { BlogPost } from '../types';

interface BlogPageProps {
  onNavigate: (path: string) => void;
  onSelectPost: (post: BlogPost) => void;
}

export const BlogPage: React.FC<BlogPageProps> = ({ onNavigate, onSelectPost }) => {
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const filteredPosts = INITIAL_BLOG_POSTS.filter((post) => {
    const matchSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchTag = selectedTag === 'all' || post.tags.includes(selectedTag);
    return matchSearch && matchTag;
  });

  const featuredPost = INITIAL_BLOG_POSTS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Blog Header */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          UTILEX Engineering & Guides
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 dark:text-white tracking-tight">
          The UTILEX Publication
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Deep-dives into web performance, cryptographic privacy, client-side document processing, and artificial intelligence productivity.
        </p>
      </div>

      {/* Featured Post Card */}
      {featuredPost && (
        <div
          onClick={() => {
            onSelectPost(featuredPost);
            onNavigate(`/blog/${featuredPost.slug}`);
          }}
          className="group relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-950 to-zinc-950 text-white shadow-xl cursor-pointer hover:shadow-2xl transition-all border border-indigo-800/40"
        >
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Featured Article
              </span>
              <span className="text-xs text-indigo-300 font-medium">
                {featuredPost.readTime}
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight group-hover:text-indigo-300 transition-colors">
              {featuredPost.title}
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed line-clamp-3">
              {featuredPost.excerpt}
            </p>
            <div className="flex items-center justify-between pt-4 border-t border-indigo-900/60 text-xs text-indigo-300">
              <span>By {featuredPost.author} • {featuredPost.publishedAt}</span>
              <span className="font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read Full Article</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
          {['all', 'PDF', 'Images', 'Developer Tools', 'AI'].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all shrink-0 ${
                selectedTag === tag
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Post Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <div
            key={post.id}
            onClick={() => {
              onSelectPost(post);
              onNavigate(`/blog/${post.slug}`);
            }}
            className="group p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-400 dark:hover:border-indigo-500 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {post.category}
                </span>
                <span>{post.readTime}</span>
              </div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {post.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            <div className="pt-4 mt-6 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
              <span>{post.author}</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                <span>Read More</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
