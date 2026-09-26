import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { SearchModal } from './components/layout/SearchModal';
import { AuthModal } from './components/layout/AuthModal';
import { CookieConsent } from './components/layout/CookieConsent';

import { HomePage } from './pages/HomePage';
import { ToolsPage } from './pages/ToolsPage';
import { CategoryPage } from './pages/CategoryPage';
import { CategoriesListPage } from './pages/CategoriesListPage';
import { ToolDetailPage } from './pages/ToolDetailPage';
import { AiChatPage } from './pages/AiChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { BlogPage } from './pages/BlogPage';
import { BlogPostPage } from './pages/BlogPostPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';

import { TOOLS, CATEGORIES } from './data/toolsRegistry';
import { INITIAL_BLOG_POSTS } from './data/blogPosts';
import { ToolDefinition, BlogPost } from './types';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname || '/';
    }
    return '/';
  });

  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/tool/')) {
        const slug = path.replace('/tool/', '');
        return TOOLS.find((t) => t.slug === slug || t.id === slug) || TOOLS[0];
      }
    }
    return null;
  });

  const [selectedBlogPost, setSelectedBlogPost] = useState<BlogPost | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        return INITIAL_BLOG_POSTS.find((p) => p.slug === slug) || INITIAL_BLOG_POSTS[0];
      }
    }
    return null;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Sync with browser history
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path);

      if (path.startsWith('/tool/')) {
        const slug = path.replace('/tool/', '');
        const found = TOOLS.find((t) => t.slug === slug || t.id === slug);
        if (found) setSelectedTool(found);
      } else if (path.startsWith('/blog/')) {
        const slug = path.replace('/blog/', '');
        const found = INITIAL_BLOG_POSTS.find((p) => p.slug === slug);
        if (found) setSelectedBlogPost(found);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (path.startsWith('/tool/')) {
      const slug = path.replace('/tool/', '');
      const found = TOOLS.find((t) => t.slug === slug || t.id === slug);
      if (found) setSelectedTool(found);
    } else if (path.startsWith('/blog/')) {
      const slug = path.replace('/blog/', '');
      const found = INITIAL_BLOG_POSTS.find((p) => p.slug === slug);
      if (found) setSelectedBlogPost(found);
    }
  };

  const handleSelectTool = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    navigate(`/tool/${tool.slug}`);
  };

  const handleSelectBlogPost = (post: BlogPost) => {
    setSelectedBlogPost(post);
    navigate(`/blog/${post.slug}`);
  };

  // Render active page component based on currentPath
  const renderContent = () => {
    if (currentPath === '/') {
      return (
        <HomePage
          onNavigate={navigate}
          onSelectTool={handleSelectTool}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      );
    }
    if (currentPath === '/tools') {
      return <ToolsPage onSelectTool={handleSelectTool} initialCategory="all" />;
    }
    if (currentPath === '/ai-tools') {
      return <ToolsPage onSelectTool={handleSelectTool} initialCategory="ai" />;
    }
    if (currentPath === '/categories') {
      return <CategoriesListPage onNavigate={navigate} />;
    }
    if (currentPath.startsWith('/category/')) {
      const slug = currentPath.replace('/category/', '');
      return (
        <CategoryPage
          categorySlug={slug}
          onNavigate={navigate}
          onSelectTool={handleSelectTool}
        />
      );
    }
    if (currentPath.startsWith('/tool/')) {
      if (selectedTool) {
        return (
          <ToolDetailPage
            tool={selectedTool}
            onNavigate={navigate}
            onSelectTool={handleSelectTool}
          />
        );
      }
      // If direct access with slug in URL
      const slug = currentPath.replace('/tool/', '');
      const tool = TOOLS.find((t) => t.slug === slug || t.id === slug);
      if (tool) {
        return (
          <ToolDetailPage
            tool={tool}
            onNavigate={navigate}
            onSelectTool={handleSelectTool}
          />
        );
      }
      return <NotFoundPage onNavigate={navigate} />;
    }
    if (currentPath === '/ai-chat') {
      return <AiChatPage />;
    }
    if (currentPath === '/dashboard') {
      return (
        <DashboardPage
          onNavigate={navigate}
          onSelectTool={handleSelectTool}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      );
    }
    if (currentPath === '/admin') {
      return <AdminPage onNavigate={navigate} />;
    }
    if (currentPath === '/blog') {
      return <BlogPage onNavigate={navigate} onSelectPost={handleSelectBlogPost} />;
    }
    if (currentPath.startsWith('/blog/')) {
      if (selectedBlogPost) {
        return <BlogPostPage post={selectedBlogPost} onNavigate={navigate} />;
      }
      const slug = currentPath.replace('/blog/', '');
      const post = INITIAL_BLOG_POSTS.find((p) => p.slug === slug);
      if (post) {
        return <BlogPostPage post={post} onNavigate={navigate} />;
      }
      return <NotFoundPage onNavigate={navigate} />;
    }
    if (currentPath === '/about') {
      return <AboutPage onNavigate={navigate} />;
    }
    if (currentPath === '/contact') {
      return <ContactPage />;
    }
    if (currentPath === '/favorites') {
      return <FavoritesPage onNavigate={navigate} onSelectTool={handleSelectTool} />;
    }
    if (currentPath === '/privacy-policy') {
      return <LegalPage type="privacy" onNavigate={navigate} />;
    }
    if (currentPath === '/terms') {
      return <LegalPage type="terms" onNavigate={navigate} />;
    }
    if (currentPath === '/cookie-policy') {
      return <LegalPage type="cookies" onNavigate={navigate} />;
    }
    if (currentPath === '/disclaimer') {
      return <LegalPage type="disclaimer" onNavigate={navigate} />;
    }
    if (currentPath === '/copyright') {
      return <LegalPage type="copyright" onNavigate={navigate} />;
    }

    return <NotFoundPage onNavigate={navigate} />;
  };

  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <FavoritesProvider>
            <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
              {/* Global Navigation Bar */}
              <Navbar
                currentPath={currentPath}
                onNavigate={navigate}
                onOpenSearch={() => setIsSearchOpen(true)}
                onOpenAuth={() => setIsAuthOpen(true)}
              />

              {/* Main Content Area */}
              <main className="flex-1">{renderContent()}</main>

              {/* Footer */}
              <Footer onNavigate={navigate} />

              {/* Modals & Overlays */}
              <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSelectTool={handleSelectTool}
              />

              <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
              />

              <CookieConsent />
            </div>
          </FavoritesProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
