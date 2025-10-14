'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, User, Mail, Key, Shield, Camera, Edit, Plus } from 'lucide-react';
import { toast } from 'react-toastify';
import { User as UserType } from '@/types';
import { CreateUserRequest, UpdateUserRequest, userService } from '@/services/user';
import { useTheme } from '@/context/ThemeContext';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: UserType;
}

type FormData = {
  username: string;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  profile_image: string;
};

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user
}) => {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  // const [imageFile, setImageFile] = useState<File | null>(null); // removed unused variable
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = !!user;

  // Theme-based styles
  const isDark = theme === 'dark';
  const modalBgStyle = {
    backgroundColor: isDark ? '#1f2937' : '#ffffff'
  };
  const headerBgStyle = {
    background: isDark 
      ? 'linear-gradient(to right, #374151, #4b5563)' 
      : 'linear-gradient(to right, #faf5ff, #f0f9ff)',
    borderBottom: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`
  };
  const textStyle = {
    color: isDark ? '#f9fafb' : '#111827'
  };
  const inputStyle = {
    backgroundColor: isDark ? '#374151' : '#ffffff',
    color: isDark ? '#f9fafb' : '#111827',
    border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`
  };

  const compressImage = (file: File, maxWidth: number = 400, maxHeight: number = 400, quality: number = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new (window.Image)();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedBase64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Ukuran file terlalu besar. Maksimal 5MB.');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('File harus berupa gambar.');
        return;
      }

      try {
        // Compress image before setting preview
        const compressedBase64 = await compressImage(file);
        // setImageFile(file); // removed unused
        setProfileImagePreview(compressedBase64);
        setValue('profile_image', compressedBase64);
      } catch (error) {
        toast.error('Gagal memproses gambar.');
        console.error('Image compression failed:', error);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (user) {
        // Fill form for editing
        setValue('username', user.username);
        setValue('name', user.name || '');
        setValue('email', user.email);
        setValue('role', user.role as 'admin' | 'user');
        setValue('password', ''); // Don't prefill password
        setValue('profile_image', user.profile_image || '');
        setProfileImagePreview(user.profile_image || null);
      } else {
        // Reset form for creating
        reset({
          username: '',
          name: '',
          email: '',
          password: '',
          role: 'user',
          profile_image: ''
        });
        setProfileImagePreview(null);
      }
    }
  }, [isOpen, user, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // Use the compressed image from preview or existing profile image
      const profileImageUrl = profileImagePreview || data.profile_image;

      if (isEditing && user) {
        const updateData: UpdateUserRequest = {
          username: data.username,
          name: data.name,
          email: data.email,
          role: data.role,
          profile_image: profileImageUrl
        };
        // Only include password if it's not empty
        if (data.password && data.password.trim() !== '') {
          updateData.password = data.password;
        }
        await userService.update(user.id, updateData);
        toast.success('User berhasil diperbarui');
      } else {
        const createData: CreateUserRequest = {
          username: data.username,
          name: data.name,
          email: data.email,
          password: data.password,
          role: data.role,
          profile_image: profileImageUrl
        };
        await userService.create(createData);
        toast.success('User berhasil ditambahkan');
      }

      onSuccess();
      onClose();
      reset();
      setProfileImagePreview(null);
      // setImageFile(null); // removed unused
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
    setProfileImagePreview(null);
    // setImageFile(null); // removed unused
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
            className="rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col"
            style={modalBgStyle}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 flex-shrink-0 rounded-t-xl" style={headerBgStyle}>
              <div className="flex items-center space-x-3">
                {isEditing ? (
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <Edit className="h-5 w-5 text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-semibold" style={textStyle}>
                    {isEditing ? 'Edit User' : 'Add New User'}
                  </h2>
                  {isEditing && user && (
                    <p className="text-sm" style={{color: isDark ? '#d1d5db' : '#6b7280'}}>Editing: {user.username}</p>
                  )}
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#ffffff';
                  e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <X size={20} style={{color: isDark ? '#9ca3af' : '#6b7280'}} />
              </button>
            </div>

            {/* Form */}
            <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: isDark ? '#d1d5db' : '#374151'}}>
                  <User size={16} className="inline mr-2" />
                  Username *
                </label>
                <input
                  {...register('username', { required: 'Username wajib diisi' })}
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
                  style={inputStyle}
                  placeholder="Enter username"
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: isDark ? '#d1d5db' : '#374151'}}>
                  <User size={16} className="inline mr-2" />
                  Full Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
                  style={inputStyle}
                  placeholder="Enter full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{color: isDark ? '#d1d5db' : '#374151'}}>
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
                  className="w-full px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder-gray-500 transition-all duration-200"
                  style={inputStyle}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500 transition-all duration-200 hover:border-gray-400"
                  placeholder={isEditing ? "Leave empty to keep current password" : "Enter password"}
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 transition-all duration-200 hover:border-gray-400"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Camera size={16} className="inline mr-2" />
                  Profile Image
                </label>
                
                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-dashed border-purple-300 rounded-lg bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all duration-200 text-purple-700"
                >
                  <Camera size={18} />
                  <span className="font-medium">Choose Image</span>
                </button>
                
                {/* Image Preview */}
                {profileImagePreview && (
                  <div className="mt-3 flex justify-center">
                    <div className="relative">
                      <Image
                        src={profileImagePreview}
                        alt="Profile preview"
                        width={80}
                        height={80}
                        className="w-20 h-20 object-cover rounded-full border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setProfileImagePreview(null);
                          // setImageFile(null); // removed unused
                          setValue('profile_image', '');
                        }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </div>
                  </div>
                )}
                
                <p className="mt-2 text-xs text-gray-500 text-center">
                  Upload an image that will be used as the profile picture (Max 5MB)
                </p>
              </div>
              </div>
            </form>

            {/* Actions - Fixed Footer */}
            <div className="flex justify-end space-x-4 px-6 py-4 border-t border-gray-100 bg-gray-50 flex-shrink-0 rounded-b-xl">
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                form="user-form"
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg font-medium"
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
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};