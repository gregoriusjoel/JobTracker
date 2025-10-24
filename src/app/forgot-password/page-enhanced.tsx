'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Send, Check, Key } from 'lucide-react';
import Link from 'next/link';
import { api } from '@/lib/axios';

interface ForgotPasswordForm {
  email: string;
}

interface VerifyCodeForm {
  code: string;
  newPassword: string;
  confirmPassword: string;
}

type Step = 'email' | 'code_sent' | 'verify_code' | 'success';

export default function ForgotPasswordEnhanced() {
  const [step, setStep] = useState<Step>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [resetMethod, setResetMethod] = useState<'link' | 'code'>('link');

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors },
  } = useForm<ForgotPasswordForm>();

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors },
    watch,
  } = useForm<VerifyCodeForm>();

  const watchNewPassword = watch('newPassword');

  const onSubmitEmail = async (data: ForgotPasswordForm) => {
    setIsLoading(true);
    setEmailAddress(data.email);
    
    try {
      const endpoint = resetMethod === 'code' ? '/forgot-password-code' : '/forgot-password';
      await api.post(endpoint, { email: data.email });
      
      if (resetMethod === 'code') {
        setStep('verify_code');
        toast.success('Verification code sent to your email!');
      } else {
        setStep('code_sent');
        toast.success('Reset link sent to your email!');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Failed to send reset email';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCode = async (data: VerifyCodeForm) => {
    setIsLoading(true);
    
    try {
      await api.post('/reset-password-with-code', {
        email: emailAddress,
        code: data.code,
        password: data.newPassword,
      });
      
      setStep('success');
      toast.success('Password reset successfully!');
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Invalid verification code or failed to reset password';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'code_sent') {
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
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Sent!
            </h2>
            
            <p className="text-gray-600 mb-6">
              We&apos;ve sent a password reset link to{' '}
              <span className="font-medium text-gray-900">
                {emailAddress}
              </span>
            </p>
            
            <p className="text-sm text-gray-500 mb-6">
              Check your inbox and click the link to reset your password. 
              The link will expire in 1 hour.
            </p>
            
            <div className="space-y-3">
              <Link href="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={20} className="mr-2" />
                  Back to Login
                </motion.button>
              </Link>
              
              <button
                onClick={() => setStep('email')}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Send another email
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === 'verify_code') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white shadow-xl rounded-2xl p-8"
          >
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
                Enter Verification Code
              </h2>
              <p className="mt-2 text-gray-600">
                We sent a 6-digit code to {emailAddress}
              </p>
            </div>

            <form onSubmit={handleSubmitCode(onSubmitCode)} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <input
                  {...registerCode('code', {
                    required: 'Verification code is required',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Code must be 6 digits',
                    },
                  })}
                  type="text"
                  maxLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl font-mono tracking-widest"
                  placeholder="000000"
                />
                {codeErrors.code && (
                  <p className="mt-1 text-sm text-red-600">{codeErrors.code.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  {...registerCode('newPassword', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
                {codeErrors.newPassword && (
                  <p className="mt-1 text-sm text-red-600">{codeErrors.newPassword.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  {...registerCode('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watchNewPassword || 'Passwords do not match',
                  })}
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
                {codeErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{codeErrors.confirmPassword.message}</p>
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
                    <Key size={20} className="mr-2" />
                    Reset Password
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => setStep('email')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← Back to email
              </button>
              <p className="text-xs text-gray-500">
                Didn&apos;t receive the code? Check your spam folder
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (step === 'success') {
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
              className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Check className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Reset Successfully!
            </h2>
            
            <p className="text-gray-600 mb-6">
              Your password has been updated. You can now login with your new password.
            </p>
            
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-medium"
              >
                Go to Login
              </motion.button>
            </Link>
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
              Forgot Password?
            </h2>
            <p className="mt-2 text-gray-600">
              Choose how you&apos;d like to reset your password
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Reset Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="link"
                  checked={resetMethod === 'link'}
                  onChange={(e) => setResetMethod(e.target.value as 'link' | 'code')}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">Email reset link (recommended)</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="code"
                  checked={resetMethod === 'code'}
                  onChange={(e) => setResetMethod(e.target.value as 'link' | 'code')}
                  className="mr-3 text-blue-600"
                />
                <span className="text-gray-700">6-digit verification code</span>
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmitEmail(onSubmitEmail)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  {...registerEmail('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email"
                />
              </div>
              {emailErrors.email && (
                <p className="mt-1 text-sm text-red-600">{emailErrors.email.message}</p>
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
                  {resetMethod === 'code' ? 'Send Verification Code' : 'Send Reset Link'}
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <Link href="/login">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Back to Login
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}