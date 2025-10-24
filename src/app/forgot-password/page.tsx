'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, Key, Lock, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/axios';

interface ForgotPasswordForm {
  email: string;
}

interface VerifyCodeForm {
  code: string;
}

interface ResetPasswordForm {
  code: string;
  password: string;
  confirmPassword: string;
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'email' | 'code' | 'password'>('email');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const emailForm = useForm<ForgotPasswordForm>();
  const codeForm = useForm<VerifyCodeForm>();
  const passwordForm = useForm<ResetPasswordForm>();

  const onSubmitEmail = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    
    try {
      await api.post('/forgot-password', data);
      setSubmittedEmail(data.email);
      setCurrentStep('code');
      toast.success('Kode reset telah dikirim ke email Anda!');
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Gagal mengirim kode reset';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCode = async (data: VerifyCodeForm) => {
    setIsLoading(true);
    
    try {
      const response = await api.post('/verify-reset-code', {
        email: submittedEmail,
        code: data.code,
      });
      
      if (response.data.message === 'Kode reset valid') {
        passwordForm.setValue('code', data.code);
        setCurrentStep('password');
        toast.success('Kode valid! Silakan buat password baru.');
      }
    } catch (error) {
      console.error('Verify code error:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Kode tidak valid atau sudah kedaluwarsa';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitPassword = async (data: ResetPasswordForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Password dan konfirmasi password tidak sama');
      return;
    }

    setIsLoading(true);
    
    try {
      // Get the verified code from the form
      const verifiedCode = passwordForm.getValues('code');
      
      await api.post('/reset-password', {
        email: submittedEmail,
        code: verifiedCode,
        password: data.password
      });
      
      toast.success('Password berhasil direset! Silakan login dengan password baru.');
      
      // Redirect to login after success
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Gagal reset password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'email' ? 'bg-blue-500 text-white' : currentStep === 'code' || currentStep === 'password' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          1
        </div>
        <div className={`h-1 w-12 ${currentStep === 'code' || currentStep === 'password' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'code' ? 'bg-blue-500 text-white' : currentStep === 'password' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          2
        </div>
        <div className={`h-1 w-12 ${currentStep === 'password' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep === 'password' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
          3
        </div>
      </div>
    </div>
  );

  if (currentStep === 'code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-2xl p-8"
          >
            {renderStepIndicator()}
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Key className="w-8 h-8 text-blue-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900">
                Masukkan Kode Reset
              </h2>
              <p className="mt-2 text-gray-600">
                Kami telah mengirim kode 6 digit ke{' '}
                <span className="font-medium text-gray-900">{submittedEmail}</span>
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Kode akan kedaluwarsa dalam 15 menit
              </p>
            </div>

            {/* Form */}
            <form onSubmit={codeForm.handleSubmit(onSubmitCode)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Reset 6 Digit
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...codeForm.register('code', {
                      required: 'Kode reset diperlukan',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Kode harus 6 digit angka',
                      },
                    })}
                    type="text"
                    maxLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 text-center text-2xl tracking-widest"
                    placeholder="123456"
                  />
                </div>
                {codeForm.formState.errors.code && (
                  <p className="mt-1 text-sm text-red-600">{codeForm.formState.errors.code.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check size={20} className="mr-2" />
                    Verifikasi Kode
                  </>
                )}
              </motion.button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center space-y-3">
              <button
                onClick={() => setCurrentStep('email')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Tidak menerima kode? Kirim ulang
              </button>
              <div>
                <Link href="/login">
                  <button className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeft size={16} className="mr-2" />
                    Kembali ke Login
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (currentStep === 'password') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-2xl p-8"
          >
            {renderStepIndicator()}
            
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
              >
                <Lock className="w-8 h-8 text-green-600" />
              </motion.div>
              <h2 className="text-3xl font-bold text-gray-900">
                Buat Password Baru
              </h2>
              <p className="mt-2 text-gray-600">
                Masukkan password baru untuk akun Anda
              </p>
            </div>

            {/* Form */}
            <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password Baru
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...passwordForm.register('password', {
                      required: 'Password diperlukan',
                      minLength: {
                        value: 6,
                        message: 'Password minimal 6 karakter',
                      },
                    })}
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Masukkan password baru"
                  />
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Konfirmasi Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    {...passwordForm.register('confirmPassword', {
                      required: 'Konfirmasi password diperlukan',
                    })}
                    type="password"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                    placeholder="Konfirmasi password baru"
                  />
                </div>
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Check size={20} className="mr-2" />
                    Reset Password
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-xl rounded-2xl p-8"
        >
          {renderStepIndicator()}
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
              className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <Mail className="w-8 h-8 text-blue-600" />
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900">
              Lupa Password?
            </h2>
            <p className="mt-2 text-gray-600">
              Masukkan email Anda dan kami akan mengirim kode 6 digit untuk reset password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  {...emailForm.register('email', {
                    required: 'Email diperlukan',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Format email tidak valid',
                    },
                  })}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Masukkan email Anda"
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{emailForm.formState.errors.email.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send size={20} className="mr-2" />
                  Kirim Kode Reset
                </>
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Kembali ke Login
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}