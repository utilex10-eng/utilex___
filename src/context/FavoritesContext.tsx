import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FavoritesContextType {
  favorites: string[];
  recentTools: string[];
  isFavorite: (toolId: string) => boolean;
  toggleFavorite: (toolId: string) => void;
  recordRecentTool: (toolId: string) => void;
  clearRecentTools: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('utilex_favorites');
      return saved ? JSON.parse(saved) : ['jpg-to-pdf', 'json-formatter', 'image-compressor', 'word-counter'];
    } catch {
      return ['jpg-to-pdf', 'json-formatter', 'image-compressor', 'word-counter'];
    }
  });

  const [recentTools, setRecentTools] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('utilex_recents');
      return saved ? JSON.parse(saved) : ['pdf-merge', 'json-formatter', 'qr-code-generator'];
    } catch {
      return ['pdf-merge', 'json-formatter', 'qr-code-generator'];
    }
  });

  useEffect(() => {
    localStorage.setItem('utilex_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('utilex_recents', JSON.stringify(recentTools));
  }, [recentTools]);

  const isFavorite = useCallback((toolId: string) => favorites.includes(toolId), [favorites]);

  const toggleFavorite = useCallback((toolId: string) => {
    setFavorites((prev) =>
      prev.includes(toolId) ? prev.filter((id) => id !== toolId) : [...prev, toolId]
    );
  }, []);

  const recordRecentTool = useCallback((toolId: string) => {
    setRecentTools((prev) => [toolId, ...prev.filter((id) => id !== toolId)].slice(0, 12));
    // Also ping backend tracking asynchronously
    try {
      fetch('/api/tools/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId }),
      }).catch(() => {});
    } catch {}
  }, []);

  const clearRecentTools = useCallback(() => {
    setRecentTools([]);
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        recentTools,
        isFavorite,
        toggleFavorite,
        recordRecentTool,
        clearRecentTools,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within a FavoritesProvider');
  return context;
};
