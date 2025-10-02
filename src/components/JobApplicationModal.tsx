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
  status: 'applied' | 'interview' | 'rejected' | 'accepted';
  application_date: string;
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
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? 'Edit Aplikasi Pekerjaan' : 'Tambah Aplikasi Pekerjaan'}
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  >
                    <option value="applied">Applied</option>
                    <option value="interview">Interview</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  {errors.application_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.application_date.message}</p>
                  )}
                </div>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tambahkan catatan tambahan tentang aplikasi ini..."
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
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