'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion } from 'framer-motion';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors duration-200"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 0, rotate: 180 }}
        transition={{ duration: 0.3 }}
        key={theme}
      >
        {theme === 'light' ? (
          <Moon size={18} className="text-gray-700 dark:text-gray-300" />
        ) : (
          <Sun size={18} className="text-yellow-500 dark:text-yellow-400" />
        )}
      </motion.div>
    </motion.button>
  );
};

interface ThemeToggleMenuItemProps {
  onClose: () => void;
}

export const ThemeToggleMenuItem: React.FC<ThemeToggleMenuItemProps> = ({ onClose }) => {
  const { theme, toggleTheme } = useTheme();

  const handleToggle = () => {
    toggleTheme();
    onClose();
  };

  return (
    <button
      onClick={handleToggle}
      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
    >
      {theme === 'light' ? (
        <>
          <Moon size={16} />
          <span>Dark Theme</span>
        </>
      ) : (
        <>
          <Sun size={16} />
          <span>Light Theme</span>
        </>
      )}
    </button>
  );
};