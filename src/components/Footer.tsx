'use client';

import { motion } from 'framer-motion';
import { Heart, Code, Coffee, Github, Linkedin, Mail } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const pathname = usePathname();

  const currentYear = new Date().getFullYear();

  // Determine background color based on current path
  const getBackgroundClass = () => {
    if (pathname === '/account') {
      return 'bg-gray-50 dark:bg-gray-900';
    }
    // For all other pages, use white background even in dark mode
    return 'bg-white dark:bg-gray-50';
  };

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`relative mt-auto border-t ${getBackgroundClass()}`}
      style={{
        borderColor: isDark ? '#374151' : '#e5e7eb'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="footer-brand-icon w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JT</span>
              </div>
              <h3 className="text-lg font-bold footer-gradient-text">
                Job Tracker Pro
              </h3>
            </div>
            <p className="text-sm" style={{ color: isDark ? '#d1d5db' : '#6b7280' }}>
              Aplikasi manajemen lamaran kerja terdepan yang membantu Anda mengorganisir dan melacak perjalanan karir dengan mudah dan efisien.
            </p>
            <div className="flex items-center space-x-1 text-xs footer-watermark" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <span>Dibuat dengan</span>
              <Heart size={12} className="text-red-500 mx-1" />
              <span>oleh</span>
              <Code size={12} className="text-blue-500 mx-1" />
              <span>Gregorius Joel</span>
              <Coffee size={12} className="text-yellow-600 mx-1" />
            </div>
          </div>

          {/* Contact & Social - Right Side with Left Alignment */}
          <div className="space-y-4 md:ml-auto md:max-w-xs">
            <h4 className="font-semibold" style={{ color: isDark ? '#f9fafb' : '#111827' }}>
              Hubungi Developer
            </h4>
            <div className="flex space-x-4">
              <motion.a
                href="https://github.com/gregoriusjoel"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#d1d5db' : '#6b7280'
                }}
              >
                <Github size={18} />
              </motion.a>
              <motion.a
                href="https://linkedin.com/in/gregorius-joel"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#d1d5db' : '#6b7280'
                }}
              >
                <Linkedin size={18} />
              </motion.a>
              <motion.a
                href="mailto:hi.gregoriusjoel@gmail.com"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 rounded-lg transition-colors"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  color: isDark ? '#d1d5db' : '#6b7280'
                }}
              >
                <Mail size={18} />
              </motion.a>
            </div>
            <div className="text-xs space-y-1" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <p>📧 hi.gregoriusjoel@gmail.com</p>
              <p>🌐 Bogor, Indonesia</p>
              <p>💼 Full Stack Developer</p>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t" style={{ borderColor: isDark ? '#374151' : '#e5e7eb' }}>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-sm" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <span>© {currentYear} Job Tracker Pro - Gregorius Joel. All rights reserved.</span>
              <div className="flex items-center space-x-4">
                <span className="hover:text-blue-500 cursor-pointer transition-colors">Privacy Policy</span>
                <span className="hover:text-blue-500 cursor-pointer transition-colors">Terms of Service</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-xs" style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
              <span>Version</span>
              <span className="version-badge px-2 py-1 text-white rounded-full font-medium">
                v1.0.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};