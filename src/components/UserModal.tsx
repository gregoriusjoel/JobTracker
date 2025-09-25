'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Key, Shield } from 'lucide-react';
import { toast } from 'react-toastify';
import { User as UserType } from '@/types';
import { CreateUserRequest, UpdateUserRequest, userService } from '@/services/user';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserType;
}

type FormData = {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
};

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const isEditing = !!user;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Fill form for editing
        setValue('username', user.username);
        setValue('email', user.email);
        setValue('role', user.role as 'admin' | 'user');
        setValue('password', ''); // Don't prefill password
      } else {
        // Reset form for creating
        reset({
          username: '',
          email: '',
          password: '',
          role: 'user'
        });
      }
    }
  }, [isOpen, user, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      if (isEditing && user) {
        const updateData: UpdateUserRequest = {
          username: data.username,
          email: data.email,
          role: data.role
        };
        // Only include password if it's not empty
        if (data.password && data.password.trim() !== '') {
          updateData.password = data.password;
        }
        await userService.update(user.id, updateData);
        toast.success('User berhasil diperbarui');
      } else {
        await userService.create(data as CreateUserRequest);
        toast.success('User berhasil ditambahkan');
      }

      onSuccess();
      onClose();
      reset();
    } catch (error) {
      const errorMessage = (error as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Terjadi kesalahan';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit User' : 'Add New User'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User size={16} className="inline mr-2" />
                  Username *
                </label>
                <input
                  {...register('username', { required: 'Username wajib diisi' })}
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email *
                </label>
                <input
                  {...register('email', { 
                    required: 'Email wajib diisi',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Format email tidak valid'
                    }
                  })}
                  type="email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder="Enter email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Key size={16} className="inline mr-2" />
                  Password {isEditing ? '(Leave empty to keep current)' : '*'}
                </label>
                <input
                  {...register('password', { 
                    required: isEditing ? false : 'Password wajib diisi',
                    minLength: {
                      value: 6,
                      message: 'Password minimal 6 karakter'
                    },
                    validate: (value) => {
                      // For edit mode: if value is empty, it's valid (keep current password)
                      // For create mode: value is required
                      if (isEditing && (!value || value.trim() === '')) {
                        return true;
                      }
                      if (!isEditing && (!value || value.trim() === '')) {
                        return 'Password wajib diisi';
                      }
                      if (value && value.length < 6) {
                        return 'Password minimal 6 karakter';
                      }
                      return true;
                    }
                  })}
                  type="password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                  placeholder={isEditing ? "Leave empty to keep current" : "Enter password"}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Shield size={16} className="inline mr-2" />
                  Role *
                </label>
                <select
                  {...register('role', { required: 'Role wajib dipilih' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </div>
                  ) : (
                    isEditing ? 'Update' : 'Create'
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};