'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, User, Calendar, MapPin, Banknote, FileText, Mail, Briefcase } from 'lucide-react';
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
  custom_platform: string;
  job_type: 'intern' | 'full_time' | 'part_time' | 'freelance' | 'contract' | 'remote' | 'hybrid' | '';
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
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);
  const [locationSuggestions] = useState([
    'Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang', 'Makassar', 'Palembang',
    'Tangerang', 'Depok', 'Bekasi', 'Bogor', 'Batam', 'Pekanbaru', 'Bandar Lampung',
    'Malang', 'Yogyakarta', 'Solo', 'Denpasar', 'Balikpapan', 'Samarinda', 'Pontianak',
    'Manado', 'Mataram', 'Jayapura', 'Banda Aceh', 'Padang', 'Jambi', 'Bengkulu',
    'Remote', 'Work From Home', 'Hybrid'
  ]);
  const [filteredLocations, setFilteredLocations] = useState<string[]>([]);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [formattedSalary, setFormattedSalary] = useState<string>('');
  const isEditing = !!jobApplication;

  // Format number with dots as thousand separators
  const formatSalaryInput = (value: string): string => {
    // Remove all non-digit characters
    const numbers = value.replace(/\D/g, '');
    
    // Add dots as thousand separators
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  // Remove dots and return clean number
  const parseSalaryInput = (formattedValue: string): number => {
    const cleanValue = formattedValue.replace(/\./g, '');
    return cleanValue === '' ? 0 : parseInt(cleanValue, 10);
  };

  // Handle salary input change
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formatted = formatSalaryInput(inputValue);
    const numericValue = parseSalaryInput(formatted);
    
    setFormattedSalary(formatted);
    setValue('salary', numericValue === 0 ? '' : numericValue);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<FormData>();

  const watchedPlatform = watch('application_platform');

  useEffect(() => {
    setShowCustomPlatform(watchedPlatform === 'Other');
  }, [watchedPlatform]);

  useEffect(() => {
    if (isOpen) {
      // Always clear suggestion states when modal opens
      setShowLocationSuggestions(false);
      setFilteredLocations([]);
      setShowCustomPlatform(false);
      
      if (jobApplication) {
        // Fill form for editing
        setValue('company_name', jobApplication.company_name);
        setValue('position', jobApplication.position);
        setValue('status', jobApplication.status);
        setValue('application_date', new Date(jobApplication.application_date).toISOString().split('T')[0]);
        setValue('application_platform', jobApplication.application_platform || '');
        setValue('custom_platform', '');
        setValue('notes', jobApplication.notes || '');
        setValue('contact_person', jobApplication.contact_person || '');
        setValue('contact_email', jobApplication.contact_email || '');
        setValue('salary', jobApplication.salary || '');
        setValue('location', jobApplication.location || '');
        setValue('job_type', jobApplication.job_type || '');
        
        // Set formatted salary for display
        setFormattedSalary(jobApplication.salary ? formatSalaryInput(jobApplication.salary.toString()) : '');
      } else {
        // Reset form for creating
        reset({
          company_name: '',
          position: '',
          status: 'applied',
          application_date: new Date().toISOString().split('T')[0],
          application_platform: '',
          custom_platform: '',
          notes: '',
          contact_person: '',
          contact_email: '',
          salary: '',
          location: '',
          job_type: ''
        });
        
        // Clear formatted salary for new entries
        setFormattedSalary('');
      }
    }
  }, [isOpen, jobApplication, setValue, reset]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        ...data,
        application_date: new Date(data.application_date).toISOString(),
        application_platform: data.application_platform === 'Other' ? data.custom_platform : data.application_platform,
        salary: data.salary === '' ? undefined : Number(data.salary)
      };

      if (isEditing && jobApplication) {
        await jobApplicationService.update(jobApplication.id, payload as UpdateJobApplicationRequest);
      } else {
        await jobApplicationService.create(payload as CreateJobApplicationRequest);
      }

      // Show success animation before closing
      setIsSuccess(true);
      
      // Wait for success animation then close (extended duration)
      setTimeout(() => {
        onSuccess();
        onClose();
        reset();
        setIsSuccess(false);
      }, 2500);
    } catch (error) {
      // Error akan ditampilkan dalam modal, tidak perlu toast
      console.error('Error submitting form:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    reset();
    setIsSuccess(false);
    // Clear location suggestion states
    setShowLocationSuggestions(false);
    setFilteredLocations([]);
    setShowCustomPlatform(false);
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
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-emerald-600/90 backdrop-blur-sm rounded-2xl flex items-center justify-center z-10"
                >
                  <div className="text-center text-white relative">
                    {/* Floating particles animation */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                        animate={{ 
                          opacity: [0, 1, 0], 
                          scale: [0, 1, 0],
                          x: [0, (i % 2 === 0 ? 1 : -1) * (50 + i * 10)],
                          y: [0, -30 - i * 5]
                        }}
                        transition={{ 
                          delay: 1.6 + i * 0.1, 
                          duration: 1.5, 
                          ease: "easeOut" 
                        }}
                        className="absolute w-2 h-2 bg-white rounded-full"
                        style={{ 
                          left: '50%', 
                          top: '50%',
                          transform: 'translate(-50%, -50%)'
                        }}
                      />
                    ))}
                    
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
                      className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <motion.svg
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
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
                      transition={{ delay: 1.2, duration: 0.4 }}
                      className="text-2xl font-bold mb-2"
                    >
                      Berhasil!
                    </motion.h3>
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 1.4, duration: 0.4 }}
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

              {/* Job Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase size={16} className="inline mr-2" />
                  Tipe Pekerjaan
                </label>
                <select
                  {...register('job_type')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                >
                  <option value="">Pilih Tipe Pekerjaan</option>
                  <option value="intern">Intern</option>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="freelance">Freelance</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              {/* Platform Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Building2 size={16} className="inline mr-2" />
                    Platform Aplikasi
                  </label>
                  <select
                    {...register('application_platform')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
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

                {/* Custom Platform Field */}
                <AnimatePresence>
                  {showCustomPlatform && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Platform Lainnya *
                      </label>
                      <input
                        {...register('custom_platform', {
                          required: showCustomPlatform ? 'Nama platform wajib diisi' : false
                        })}
                        type="text"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                        placeholder="Contoh: Telegram Jobs, WhatsApp Group, dll"
                      />
                      {errors.custom_platform && (
                        <p className="mt-1 text-sm text-red-600">{errors.custom_platform.message}</p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Location and Salary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin size={16} className="inline mr-2" />
                    Lokasi
                  </label>
                  <input
                    {...register('location')}
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white"
                    placeholder="Ketik untuk mencari lokasi..."
                    onFocus={() => {
                      setShowLocationSuggestions(true);
                    }}
                    onBlur={() => {
                      // Immediate hide without delay to prevent ghost suggestions
                      setTimeout(() => {
                        setShowLocationSuggestions(false);
                        setFilteredLocations([]);
                      }, 150);
                    }}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.length > 0) {
                        const filtered = locationSuggestions.filter(location =>
                          location.toLowerCase().includes(value.toLowerCase())
                        ).slice(0, 8);
                        setFilteredLocations(filtered);
                        setShowLocationSuggestions(true);
                      } else {
                        setFilteredLocations([]);
                        setShowLocationSuggestions(false);
                      }
                    }}
                  />
                  
                  {/* Location Suggestions Dropdown */}
                  <AnimatePresence>
                    {showLocationSuggestions && filteredLocations.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                      >
                        {filteredLocations.map((location, index) => (
                          <button
                            key={location}
                            type="button"
                            className="w-full px-4 py-2 text-left text-gray-900 bg-white hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                            onClick={() => {
                              setValue('location', location);
                              setShowLocationSuggestions(false);
                              setFilteredLocations([]);
                            }}
                          >
                            {location}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Banknote size={16} className="inline mr-2" />
                    Salary (IDR)
                  </label>
                  <input
                    type="text"
                    value={formattedSalary}
                    onChange={handleSalaryChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Contoh: 10.000.000"
                  />
                  {/* Hidden input for form validation */}
                  <input
                    {...register('salary', {
                      validate: (value) => {
                        if (value === '' || value === undefined) return true;
                        const num = Number(value);
                        return !isNaN(num) && num >= 0 || 'Salary harus berupa angka positif';
                      }
                    })}
                    type="hidden"
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
