'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, LogOut, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ProfileDropdown } from './ProfileDropdown';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3"
            >
              <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-1">
                <Image 
                  src="/JT.png" 
                  alt="Job Tracker Logo" 
                  width={32} 
                  height={32}
                  className="rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Job Tracker</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Dashboard</p>
              </div>
            </motion.div>
          </div>

          {/* Desktop User Menu */}
          <div className="hidden sm:flex items-center space-x-4">
            <span className="text-sm text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{user?.name || user?.username}</span>
            </span>
            
            {/* Profile Dropdown */}
            <ProfileDropdown />
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="sm:hidden border-t border-gray-200 dark:border-gray-700 py-4"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-3 px-4 py-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{user?.name || user?.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-2">
                {user?.role === 'admin' && (
                  <Link href="/admin">
                    <button
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                    >
                      <Settings size={18} />
                      <span>Admin Panel</span>
                    </button>
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-left text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
};