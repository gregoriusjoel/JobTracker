'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Calendar, MapPin, Banknote, FileText, Mail } from 'lucide-react';
import { toast } from 'react-toastify';
import { JobApplication, CreateJobApplicationRequest, UpdateJobApplicationRequest } from '@/types';
import { jobApplicationService } from '@/services/jobApplication';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  jobApplication?: JobApplication;
}

type FormData = {
  company_name: string;
  position: string;
  status: 'applied' | 'screening' | 'test' | 'interview_user' | 'interview_hr' | 'interview_final' | 'offered' | 'accepted' | 'rejected' | 'withdrawn';
  application_date: string;
  application_platform: string;
  notes: string;
  contact_person: string;
  contact_email: string;
  salary: number | '';
  location: string;
};

export const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  jobApplication
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isEditing = !!jobApplication;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>();

  useEffect(() => {
    if (isOpen) {
      if (jobApplication) {
        // Fill form for editing
        setValue('company_name', jobApplication.company_name);
        setValue('position', jobApplication.position);
        setValue('status', jobApplication.status);
        setValue('application_date', new Date(jobApplication.application_date).toISOString().split('T')[0]);
        setValue('application_platform', jobApplication.application_platform || '');
        setValue('notes', jobApplication.notes || '');
        setValue('contact_person', jobApplication.contact_person || '');
        setValue('contact_email', jobApplication.contact_email || '');
        setValue('salary', jobApplication.salary || '');
        setValue('location', jobApplication.location || '');
      } else {
        // Reset form for creating
        reset({
          company_name: '',
          position: '',
          status: 'applied',
          application_date: new Date().toISOString().split('T')[0],
          application_platform: '',
          notes: '',
          contact_person: '',
          contact_email: '',
          salary: '',
          location: ''
        });
      }
    }
  }, [isOpen, jobApplication, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        application_date: new Date(data.application_date).toISOString(),
        salary: data.salary === '' ? undefined : Number(data.salary)
      };

      if (isEditing && jobApplication) {
        await jobApplicationService.update(jobApplication.id, payload as UpdateJobApplicationRequest);
        toast.success('Aplikasi berhasil diperbarui');
      } else {
        await jobApplicationService.create(payload as CreateJobApplicationRequest);
        toast.success('Aplikasi berhasil ditambahkan');
      }

      // Show success animation before closing
      setIsSuccess(true);
      
      // Wait for success animation then close
      setTimeout(() => {
        onSuccess();
        onClose();
        reset();
        setIsSuccess(false);
      }, 1000);
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
    setIsSuccess(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.4, ease: "easeInOut" }
          }}
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { duration: 0.3, ease: "easeOut" }
            }}
            exit={{ 
              scale: 0.85, 
              opacity: 0, 
              y: -30,
              rotateX: -15,
              transition: { 
                duration: 0.4, 
                ease: "easeInOut",
                rotateX: { duration: 0.3 }
              }
            }}
            className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            style={{
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none' // IE/Edge
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200/30">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Aplikasi Pekerjaan' : 'Tambah Aplikasi Pekerjaan'}
              </h2>
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  rotate: 90,
                  backgroundColor: "rgba(239, 68, 68, 0.1)" 
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 25 
                }}
                onClick={handleClose}
                className="p-2 hover:bg-red-50 rounded-xl transition-all duration-300 group"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <X size={20} className="text-gray-500 group-hover:text-red-500 transition-colors duration-300" />
                </motion.div>
              </motion.button>
            </div>

            {/* Success Overlay */}
            <AnimatePresence>
              {isSuccess && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.2 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="absolute inset-0 bg-green-500/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
                >
                  <div className="text-center text-white">
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
                      className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5, duration: 0.5, ease: "easeOut" }}
                        className="w-10 h-10 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <motion.path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                    </motion.div>
                    <motion.h3
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7, duration: 0.3 }}
                      className="text-2xl font-bold mb-2"
                    >
                      Berhasil!
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.8, duration: 0.3 }}
                      className="text-lg opacity-90"
                    >
                      {isEditing ? 'Aplikasi berhasil diperbarui' : 'Aplikasi berhasil ditambahkan'}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Company and Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 size={16} className="inline mr-2" />
                    Nama Perusahaan *
                  </label>
                  <input
                    {...register('company_name', { required: 'Nama perusahaan wajib diisi' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 transition-all duration-200"
                    placeholder="Contoh: PT. Tech Indonesia"
                  />
                  {errors.company_name && (
                    <p className="mt-1 text-sm text-red-600">{errors.company_name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Posisi *
                  </label>
                  <input
                    {...register('position', { required: 'Posisi wajib diisi' })}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 transition-all duration-200"
                    placeholder="Contoh: Frontend Developer"
                  />
                  {errors.position && (
                    <p className="mt-1 text-sm text-red-600">{errors.position.message}</p>
                  )}
                </div>
              </div>

              {/* Status and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    {...register('status')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  >
                    <option value="applied">Applied</option>
                    <option value="screening">Screening</option>
                    <option value="test">Test/Assessment</option>
                    <option value="interview_user">Interview - User/Team</option>
                    <option value="interview_hr">Interview - HR</option>
                    <option value="interview_final">Interview - Final</option>
                    <option value="offered">Offered</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                    <option value="withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="inline mr-2" />
                    Tanggal Apply *
                  </label>
                  <input
                    {...register('application_date', { required: 'Tanggal apply wajib diisi' })}
                    type="date"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                  />
                  {errors.application_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.application_date.message}</p>
                  )}
                </div>
              </div>

              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 size={16} className="inline mr-2" />
                  Platform Aplikasi
                </label>
                <select
                  {...register('application_platform')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white transition-all duration-200"
                >
                  <option value="">Pilih Platform</option>
                  <option value="LinkedIn">LinkedIn</option>
                  <option value="Dealls">Dealls</option>
                  <option value="JobStreet">JobStreet</option>
                  <option value="Indeed">Indeed</option>
                  <option value="Glints">Glints</option>
                  <option value="Kalibrr">Kalibrr</option>
                  <option value="TopKarir">TopKarir</option>
                  <option value="JobsDB">JobsDB</option>
                  <option value="Company Website">Company Website</option>
                  <option value="Referral">Referral</option>
                  <option value="Walk-in">Walk-in</option>
                  <option value="Other">Lainnya</option>
                </select>
              </div>

              {/* Location and Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Lokasi
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Contoh: Jakarta, Indonesia"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Banknote size={16} className="inline mr-2" />
                    Salary (IDR)
                  </label>
                  <input
                    {...register('salary', {
                      validate: (value) => {
                        if (value === '' || value === undefined) return true;
                        const num = Number(value);
                        return !isNaN(num) && num >= 0 || 'Salary harus berupa angka positif';
                      }
                    })}
                    type="number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Contoh: 10000000"
                    min="0"
                  />
                  {errors.salary && (
                    <p className="mt-1 text-sm text-red-600">{errors.salary.message}</p>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User size={16} className="inline mr-2" />
                    Contact Person
                  </label>
                  <input
                    {...register('contact_person')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Contoh: John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail size={16} className="inline mr-2" />
                    Contact Email
                  </label>
                  <input
                    {...register('contact_email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Format email tidak valid'
                      }
                    })}
                    type="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Contoh: hr@company.com"
                  />
                  {errors.contact_email && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_email.message}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="inline mr-2" />
                  Catatan
                </label>
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Tambahkan catatan tambahan tentang aplikasi ini..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <motion.button
                  whileHover={{ 
                    scale: 1.05,
                    x: -5,
                    backgroundColor: "#fee2e2",
                    borderColor: "#fca5a5"
                  }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 20 
                  }}
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-all duration-300 group"
                >
                  <motion.span
                    whileHover={{ x: -2 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center"
                  >
                    <motion.div
                      whileHover={{ rotate: -10 }}
                      className="mr-2"
                    >
                      ✕
                    </motion.div>
                    Batal
                  </motion.span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </div>
                  ) : (
                    isEditing ? 'Perbarui' : 'Tambah'
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
