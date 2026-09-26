export type ToolCategory =
  | 'pdf'
  | 'image'
  | 'text'
  | 'developer'
  | 'ai'
  | 'calculators'
  | 'converters'
  | 'productivity'
  | 'seo'
  | 'files';

export interface CategoryInfo {
  id: ToolCategory;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  badgeCount?: number;
  gradient: string;
}

export interface ToolDefinition {
  id: string;
  slug: string;
  name: string;
  category: ToolCategory;
  categoryName: string;
  shortDescription: string;
  fullDescription: string;
  icon: string;
  keywords: string[];
  popular?: boolean;
  isNew?: boolean;
  requiresBackend?: boolean;
  requiresAI?: boolean;
  howToUse: string[];
  features: string[];
  supportedFormats?: string[];
  faqs: { question: string; answer: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: string;
  readTime: string;
  publishedAt: string;
  seoTitle?: string;
  seoDescription?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalToolExecutions: number;
  totalAiRequests: number;
  totalContactMessages: number;
  topTools: { toolId: string; name: string; category: string; count: number; lastUsed: string }[];
  allToolsUsage: { toolId: string; name: string; category: string; count: number; lastUsed: string }[];
  geminiConfigured: boolean;
  recentMessages: ContactMessage[];
}
