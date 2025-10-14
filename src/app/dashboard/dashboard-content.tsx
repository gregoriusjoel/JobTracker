'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2, 
  Calendar, 
  MapPin,
  Banknote,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Globe,
  ChevronDown,
  ChevronUp,
  User,
  Mail,
  FileText,
  Briefcase
} from 'lucide-react';
import { toast } from 'react-toastify';
import { JobApplication, JobApplicationStats } from '@/types';
import { jobApplicationService } from '@/services/jobApplication';
import { Header } from '@/components/Header';
import { JobApplicationModal } from '@/components/JobApplicationModal';
import { useAuth } from '@/context/AuthContext';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  loading?: boolean;
  percentage?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  color, 
  bgColor, 
  loading = false, 
  percentage 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02 }}
    className={`${bgColor} rounded-xl p-6 shadow-lg border border-gray-100 relative overflow-hidden`}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-gray-600 text-sm font-medium">{title}</p>
        {loading ? (
          <div className="mt-1">
            <div className="animate-pulse bg-gray-300 h-8 w-16 rounded"></div>
          </div>
        ) : (
          <div className="flex items-end gap-2">
            <p className={`${color} text-2xl font-bold mt-1`}>{value}</p>
            {percentage !== undefined && percentage > 0 && (
              <p className="text-gray-500 text-sm mb-1">({percentage}%)</p>
            )}
          </div>
        )}
      </div>
      <div className={`${color} opacity-80`}>
        {loading ? (
          <div className="animate-spin">
            <div className="w-6 h-6 border-2 border-current border-t-transparent rounded-full"></div>
          </div>
        ) : (
          icon
        )}
      </div>
    </div>
    {!loading && value > 0 && percentage !== undefined && (
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ delay: 0.5, duration: 1 }}
        className={`absolute bottom-0 left-0 h-1 ${color.replace('text-', 'bg-')} opacity-50`}
      />
    )}
  </motion.div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'applied':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Applied' };
      case 'screening':
        return { color: 'bg-purple-100 text-purple-800', icon: Users, label: 'Screening' };
      case 'test':
        return { color: 'bg-orange-100 text-orange-800', icon: AlertCircle, label: 'Test/Assessment' };
      case 'interview_user':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Users, label: 'Interview - Team' };
      case 'interview_hr':
        return { color: 'bg-amber-100 text-amber-800', icon: Users, label: 'Interview - HR' };
      case 'interview_final':
        return { color: 'bg-indigo-100 text-indigo-800', icon: Users, label: 'Interview - Final' };
      case 'offered':
        return { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Offered' };
      case 'accepted':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' };
      case 'withdrawn':
        return { color: 'bg-gray-100 text-gray-800', icon: XCircle, label: 'Withdrawn' };
      // Legacy support
      case 'interview':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Users, label: 'Interview' };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock, label: status };
    }
  };

  const { color, icon: Icon, label } = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}>
      <Icon size={12} className="mr-1" />
      {label}
    </span>
  );
};

const JobTypeBadge: React.FC<{ jobType?: string }> = ({ jobType }) => {
  if (!jobType) return <span className="text-gray-400">-</span>;
  
  const getJobTypeConfig = (type: string) => {
    switch (type) {
      case 'intern':
        return { 
          style: 'bg-blue-100 text-blue-800', 
          label: 'Intern' 
        };
      case 'full_time':
        return { 
          style: 'bg-green-100 text-green-800', 
          label: 'Full Time' 
        };
      case 'part_time':
        return { 
          style: 'bg-yellow-100 text-yellow-800', 
          label: 'Part Time' 
        };
      case 'freelance':
        return { 
          style: 'bg-purple-100 text-purple-800', 
          label: 'Freelance' 
        };
      case 'contract':
        return { 
          style: 'bg-orange-100 text-orange-800', 
          label: 'Contract' 
        };
      case 'remote':
        return { 
          style: 'bg-indigo-100 text-indigo-800', 
          label: 'Remote' 
        };
      case 'hybrid':
        return { 
          style: 'bg-teal-100 text-teal-800', 
          label: 'Hybrid' 
        };
      default:
        return { 
          style: 'bg-gray-100 text-gray-800', 
          label: type 
        };
    }
  };

  const config = getJobTypeConfig(jobType);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${config.style}`}>
      {config.label}
    </span>
  );
};

export default function DashboardContent() {
  const { user } = useAuth();
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<JobApplicationStats>({
    total: 0,
    applied: 0,
    screening: 0,
    test: 0,
    interview_user: 0,
    interview_hr: 0,
    interview_final: 0,
    offered: 0,
    accepted: 0,
    rejected: 0,
    withdrawn: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Auto reject old applications first, then fetch current data
    const initializeDashboard = async () => {
      try {
        // Auto reject applications older than 1 month
        await jobApplicationService.autoRejectOld();
      } catch (error) {
        // Silent fail for auto reject - don't disturb user experience
        console.warn('Auto reject failed:', error);
      }
      
      // Then fetch current data
      fetchJobApplications();
      fetchStats();
    };
    
    initializeDashboard();
  }, []);

  const fetchJobApplications = async () => {
    try {
      const data = await jobApplicationService.getAll();
      setJobApplications(data || []);
    } catch {
      toast.error('Gagal memuat data aplikasi pekerjaan');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const data = await jobApplicationService.getStats();
      setStats(data);
    } catch {
      console.error('Gagal memuat statistik');
    } finally {
      setStatsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus aplikasi ini?')) {
      try {
        await jobApplicationService.delete(id);
        toast.success('Aplikasi berhasil dihapus');
        fetchJobApplications();
        fetchStats();
      } catch {
        toast.error('Gagal menghapus aplikasi');
      }
    }
  };

  const toggleCardExpansion = (cardId: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(cardId)) {
      newExpanded.delete(cardId);
    } else {
      newExpanded.add(cardId);
    }
    setExpandedCards(newExpanded);
  };

  const getStatusPriority = (status: string): number => {
    const priorities = {
      'test': 1,
      'interview_user': 2,
      'interview_hr': 3,
      'interview_final': 4,
      'screening': 5,
      'offered': 6,
      'applied': 7,
      'accepted': 8,
      'withdrawn': 9,
      'rejected': 10
    };
    return priorities[status as keyof typeof priorities] || 99;
  };

  const filteredApplications = jobApplications
    .filter((app) => {
      const matchesSearch = app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           app.position.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === '' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      // Primary sort: by status priority
      const priorityDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Secondary sort: by application date (newest first)
      return new Date(b.application_date).getTime() - new Date(a.application_date).getTime();
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const handleRefresh = () => {
    fetchJobApplications();
    fetchStats();
  };

  const handleEdit = (application: JobApplication) => {
    setEditingApplication(application);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingApplication(undefined);
  };

  // Calculate percentages for visual representation
  const calculatePercentage = (value: number, total: number) => {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Welcome Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {user?.name || user?.username}! <span className="text-gray-800">👋</span>
                </h1>
                <p className="text-gray-600 mt-1">
                  {new Date().getHours() < 12 
                    ? 'Good morning! Ready to track your job applications?' 
                    : new Date().getHours() < 18 
                    ? 'Good afternoon! Let\'s manage your career journey!'
                    : 'Good evening! Keep pushing towards your dream job!'}
                </p>
              </motion.div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} className="mr-2" />
              Add New Application
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Aplikasi"
            value={stats.total}
            icon={<TrendingUp size={24} />}
            color="text-blue-600"
            bgColor="bg-blue-50"
            loading={statsLoading}
          />
          <StatsCard
            title="Applied"
            value={stats.applied}
            icon={<Clock size={24} />}
            color="text-yellow-600"
            bgColor="bg-yellow-50"
            loading={statsLoading}
            percentage={calculatePercentage(stats.applied, stats.total)}
          />
          <StatsCard
            title="Interview"
            value={stats.screening + stats.test + stats.interview_user + stats.interview_hr + stats.interview_final}
            icon={<Users size={24} />}
            color="text-orange-600"
            bgColor="bg-orange-50"
            loading={statsLoading}
            percentage={calculatePercentage(stats.screening + stats.test + stats.interview_user + stats.interview_hr + stats.interview_final, stats.total)}
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={<XCircle size={24} />}
            color="text-red-600"
            bgColor="bg-red-50"
            loading={statsLoading}
            percentage={calculatePercentage(stats.rejected, stats.total)}
          />
          <StatsCard
            title="Accepted"
            value={stats.accepted}
            icon={<CheckCircle size={24} />}
            color="text-green-600"
            bgColor="bg-green-50"
            loading={statsLoading}
            percentage={calculatePercentage(stats.accepted, stats.total)}
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Cari berdasarkan perusahaan atau posisi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Status</option>
                <option value="applied">Applied</option>
                <option value="screening">Screening</option>
                <option value="test">Test/Assessment</option>
                <option value="interview_user">Interview - Team</option>
                <option value="interview_hr">Interview - HR</option>
                <option value="interview_final">Interview - Final</option>
                <option value="offered">Offered</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Applications Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aplikasi</h3>
              <p className="text-gray-600 mb-4">Mulai tambahkan aplikasi pekerjaan pertama Anda</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <Plus size={20} className="mr-2" />
                Tambah Aplikasi
              </button>
            </div>
          ) : (
            <div className="w-full">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perusahaan & Posisi
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Tanggal Apply
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Type
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Lokasi
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Platform
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                      Salary
                    </th>
                    <th className="px-4 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi  
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app, index) => {
                    const isExpanded = expandedCards.has(app.id);
                    return (
                      <React.Fragment key={app.id}>
                        {/* Main Row */}
                        <motion.tr
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <button
                                onClick={() => toggleCardExpansion(app.id)}
                                className="mr-3 p-1 rounded-md hover:bg-gray-200 transition-colors"
                              >
                                {isExpanded ? (
                                  <ChevronUp size={16} className="text-gray-400" />
                                ) : (
                                  <ChevronDown size={16} className="text-gray-400" />
                                )}
                              </button>
                              <Building2 size={20} className="text-blue-500 mr-3" />
                              <div>
                                <div className="font-medium text-gray-900">{app.company_name}</div>
                                <div className="text-sm text-gray-600 mt-1">{app.position}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="px-4 py-4 hidden sm:table-cell">
                            <div className="flex items-center text-sm text-gray-900">
                              <Calendar size={16} className="text-green-500 mr-2" />
                              {formatDate(app.application_date)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <JobTypeBadge jobType={app.job_type} />
                          </td>
                          <td className="px-4 py-4 hidden md:table-cell">
                            <div className="flex items-center text-sm text-gray-900">
                              <MapPin size={16} className="text-red-500 mr-2" />
                              {app.location || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <div className="flex items-center text-sm text-gray-900">
                              <Globe size={16} className="text-purple-500 mr-2" />
                              {app.application_platform || '-'}
                            </div>
                          </td>
                          <td className="px-4 py-4 hidden lg:table-cell">
                            <div className="flex items-center text-sm text-gray-900">
                              <Banknote size={16} className="text-yellow-500 mr-2" />
                              {formatCurrency(app.salary)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <button 
                                onClick={() => handleEdit(app)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                        
                        {/* Expandable Details Row */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.tr
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <td colSpan={7} className="px-6 py-0">
                                <motion.div
                                  initial={{ height: 0 }}
                                  animate={{ height: 'auto' }}
                                  exit={{ height: 0 }}
                                  transition={{ duration: 0.3 }}
                                  className="overflow-hidden"
                                >
                                  <div className="py-4 bg-gray-50 rounded-lg mx-2 mb-2">
                                    <div className="px-4">
                                      <h4 className="text-sm font-semibold text-gray-800 mb-3">Detail Lengkap</h4>
                                      
                                      {/* Basic Info Grid */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {/* Company Name (redundant but complete) */}
                                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl">
                                          <Building2 size={20} className="text-blue-500" />
                                          <div>
                                            <span className="text-sm font-semibold text-gray-600 block">Perusahaan</span>
                                            <span className="text-base text-gray-800 font-medium">{app.company_name}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Position (redundant but complete) */}
                                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl">
                                          <User size={20} className="text-green-500" />
                                          <div>
                                            <span className="text-sm font-semibold text-gray-600 block">Posisi</span>
                                            <span className="text-base text-gray-800 font-medium">{app.position}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Application Platform */}
                                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl">
                                          <Globe size={20} className="text-purple-500" />
                                          <div>
                                            <span className="text-sm font-semibold text-gray-600 block">Platform</span>
                                            <span className="text-base text-gray-800 font-medium">{app.application_platform || '-'}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Location */}
                                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl">
                                          <MapPin size={20} className="text-red-500" />
                                          <div>
                                            <span className="text-sm font-semibold text-gray-600 block">Lokasi</span>
                                            <span className="text-base text-gray-800 font-medium">{app.location || '-'}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Salary */}
                                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl">
                                          <Banknote size={20} className="text-yellow-500" />
                                          <div>
                                            <span className="text-sm font-semibold text-gray-600 block">Salary</span>
                                            <span className="text-base text-gray-800 font-medium">{formatCurrency(app.salary)}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Application Date */}
                                        <div className="flex items-center space-x-3 p-3 bg-white/70 rounded-xl">
                                          <Calendar size={20} className="text-indigo-500" />
                                          <div>
                                            <span className="text-sm font-semibold text-gray-600 block">Tanggal Apply</span>
                                            <span className="text-base text-gray-800 font-medium">{formatDate(app.application_date)}</span>
                                          </div>
                                        </div>
                                        
                                        {/* Job Type */}
                                        {app.job_type && (
                                          <div className="flex items-center space-x-2">
                                            <Briefcase size={16} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-600">Job Type:</span>
                                            <JobTypeBadge jobType={app.job_type} />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Contact Information */}
                                      {(app.contact_person || app.contact_email) && (
                                        <div className="border-t border-gray-200 pt-3 mb-4">
                                          <h5 className="text-sm font-semibold text-gray-700 mb-2">Informasi Kontak</h5>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Contact Person */}
                                            {app.contact_person && (
                                              <div className="flex items-center space-x-2">
                                                <User size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600">Contact Person:</span>
                                                <span className="text-sm text-gray-800">{app.contact_person}</span>
                                              </div>
                                            )}
                                            
                                            {/* Contact Email */}
                                            {app.contact_email && (
                                              <div className="flex items-center space-x-2">
                                                <Mail size={16} className="text-gray-400" />
                                                <span className="text-sm font-medium text-gray-600">Contact Email:</span>
                                                <span className="text-sm text-gray-800">{app.contact_email}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Notes/Description */}
                                      {app.notes && (
                                        <div className="border-t border-gray-200 pt-3 mb-4">
                                          <div className="flex items-start space-x-2">
                                            <FileText size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                            <div className="flex-1">
                                              <span className="text-sm font-semibold text-gray-700">Catatan:</span>
                                              <p className="text-sm text-gray-800 mt-1 leading-relaxed whitespace-pre-wrap">{app.notes}</p>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                      
                                      {/* Timestamps */}
                                      <div className="border-t border-gray-200 pt-3">
                                        <h5 className="text-sm font-semibold text-gray-700 mb-2">Informasi Sistem</h5>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-500">
                                          <div className="flex items-center space-x-2">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>Dibuat: {formatDate(app.created_at)}</span>
                                          </div>
                                          {app.updated_at !== app.created_at && (
                                            <div className="flex items-center space-x-2">
                                              <Calendar size={14} className="text-gray-400" />
                                              <span>Diupdate: {formatDate(app.updated_at)}</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </motion.div>
                              </td>
                            </motion.tr>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Job Application Modal */}
      <JobApplicationModal
        isOpen={isCreateModalOpen || !!editingApplication}
        onClose={handleModalClose}
        onSuccess={handleRefresh}
        jobApplication={editingApplication}
      />
    </div>
  );
}