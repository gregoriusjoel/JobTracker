'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Key, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ResetPasswordPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to forgot password page after 3 seconds
    const timer = setTimeout(() => {
      router.push('/forgot-password');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl p-8 text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <Key className="w-8 h-8 text-blue-600" />
          </motion.div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Sistem Reset Password Diperbarui!
          </h2>
          
          <p className="text-gray-600 mb-6">
            Kami telah memperbarui sistem reset password menggunakan kode 6 digit yang lebih aman.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Fitur Baru:</strong>
              <br />• Kode reset 6 digit via email
              <br />• Lebih aman dan mudah digunakan
              <br />• Tidak perlu klik link lagi
            </p>
          </div>
          
          <p className="text-sm text-gray-500 mb-6">
            Mengalihkan ke halaman forgot password dalam 3 detik...
          </p>
          
          <Link href="/forgot-password">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
            >
              <ArrowRight size={20} className="mr-2" />
              Lanjut ke Reset Password
            </motion.button>
          </Link>
          
          <div className="mt-4">
            <Link href="/login">
              <button className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                Kembali ke Login
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}