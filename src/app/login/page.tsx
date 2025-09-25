'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { authService } from '@/services/auth';
import { useAuth } from '@/context/AuthContext';
import { LoginRequest } from '@/types';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const router = useRouter();
  const { login } = useAuth();

  // Motivational messages that change based on time or randomly
  const motivationalMessages = [
    "Ayo update progres kamu! 🚀",
    "Waktunya tracking karier impian! ✨",
    "Yuk lanjutkan perjalanan kariermu! 💪",
    "Mari capai target aplikasi harimu! 🎯",
    "Saatnya upgrade skill dan career! 📈",
    "Dream job menunggu, ayo mulai! 🌟",
    "Progress kecil hari ini = sukses besok! 💫",
    "Your future self will thank you! 🙏"
  ];

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning! Ayo mulai hari dengan semangat! ☀️";
    if (hour < 17) return "Good afternoon! Tetap semangat kejar impian! 🌤️";
    if (hour < 21) return "Good evening! Jangan menyerah, terus berjuang! 🌅";
    return "Good night! Besok adalah hari baru penuh peluang! 🌙";
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginRequest>();

  const onSubmit = async (data: LoginRequest) => {
    setIsLoading(true);
    setDebugInfo('Mencoba login...');
    
    try {
      console.log('Attempting login with:', { username: data.username, password: '[HIDDEN]' });
      setDebugInfo('Mengirim request ke backend...');
      
      const response = await authService.login(data);
      console.log('Login response:', response);
      setDebugInfo('Login berhasil, menyimpan data...');
      
      login(response.token, response.user);
      toast.success('🎉 Selamat datang! Ayo capai target hari ini!');
      setDebugInfo('Redirect ke dashboard...');
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      
      const err = error as {
        response?: {
          data?: { error?: string };
          status?: number;
        };
        request?: unknown;
        code?: string;
        message?: string;
      };
      
      if (err.response) {
        // Server responded with error status
        console.error('Response data:', err.response.data);
        console.error('Response status:', err.response.status);
        const errorMessage = err.response.data?.error || `Server error: ${err.response.status}`;
        setDebugInfo(`❌ ${errorMessage}`);
        toast.error(errorMessage);
      } else if (err.request) {
        // Request was made but no response received
        console.error('Request error:', err.request);
        setDebugInfo('❌ Tidak dapat terhubung ke server. Pastikan backend berjalan di http://localhost:8080');
        toast.error('Tidak dapat terhubung ke server');
      } else if (err.code === 'ERR_NETWORK') {
        // Network error
        setDebugInfo('❌ Network error - Check if backend is running and CORS is configured');
        toast.error('Network error - Cannot reach server');
      } else {
        // Other error
        setDebugInfo(`❌ Error: ${err.message || 'Unknown error'}`);
        toast.error('Terjadi kesalahan saat login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full mb-4"
            >
              <Briefcase className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Tracker</h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 font-medium"
            >
              {getMotivationalMessage()}
            </motion.p>
          </div>

          {/* Debug Info */}
          {debugInfo && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">{debugInfo}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                {...register('username', { required: 'Username wajib diisi' })}
                type="text"
                id="username"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Username kamu..."
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password', { required: 'Password wajib diisi' })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12 text-gray-900 placeholder-gray-500"
                  placeholder="Password rahasia kamu..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Sedang Masuk...
                </div>
              ) : (
                'Yuk Mulai! 🚀'
              )}
            </motion.button>
          </form>

          {/* Forgot Password Link */}
          <div className="mt-6 text-center">
            <Link href="/forgot-password">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors font-medium"
              >
                Lupa password? Gak masalah, kita bantu! 💪
              </motion.button>
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}