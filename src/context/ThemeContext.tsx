'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);
  const [forceRender, setForceRender] = useState(0);

  // Apply theme to document
  const applyTheme = (newTheme: Theme) => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      const body = document.body;
      
      // Clear all theme classes first
      root.classList.remove('dark', 'light');
      
      if (newTheme === 'dark') {
        root.classList.add('dark');
        body.style.backgroundColor = '#111827'; // Force dark background
        console.log('Applied dark theme - classes:', root.classList.toString());
      } else {
        body.style.backgroundColor = '#ffffff'; // Force light background
        console.log('Applied light theme - classes:', root.classList.toString());
      }
      
      // Force CSS recalculation
      document.querySelectorAll('*').forEach(el => {
        const element = el as HTMLElement;
        const display = element.style.display;
        element.style.display = 'none';
        element.offsetHeight; // trigger reflow
        element.style.display = display;
      });
      
      setForceRender(prev => prev + 1);
    }
  };

  // Handle hydration
  useEffect(() => {
    setMounted(true);
    
    if (typeof window !== 'undefined') {
      // Get theme from localStorage or system preference
      const savedTheme = localStorage.getItem('job-tracker-theme') as Theme;
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      
      const initialTheme = savedTheme || systemTheme;
      console.log('Initial theme:', initialTheme);
      setThemeState(initialTheme);
      applyTheme(initialTheme);
    }
  }, []);

  const setTheme = (newTheme: Theme) => {
    console.log('Setting theme to:', newTheme);
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('job-tracker-theme', newTheme);
    }
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    console.log('Toggling theme from', theme, 'to', newTheme);
    setTheme(newTheme);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }} key={forceRender}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};