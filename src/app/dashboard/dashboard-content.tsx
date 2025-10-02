'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
  Globe
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
      case 'interview':
        return { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Interview' };
      case 'accepted':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Accepted' };
      case 'rejected':
        return { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' };
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

export default function DashboardContent() {
  const { user } = useAuth();
  const [jobApplications, setJobApplications] = useState<JobApplication[]>([]);
  const [stats, setStats] = useState<JobApplicationStats>({
    total: 0,
    applied: 0,
    interview: 0,
    rejected: 0,
    accepted: 0
  });
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState<JobApplication | undefined>();

  useEffect(() => {
    fetchJobApplications();
    fetchStats();
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

  const filteredApplications = jobApplications.filter((app) => {
    const matchesSearch = app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Welcome back, {user?.username}! <span className="text-gray-800">👋</span>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            value={stats.interview}
            icon={<Users size={24} />}
            color="text-orange-600"
            bgColor="bg-orange-50"
            loading={statsLoading}
            percentage={calculatePercentage(stats.interview, stats.total)}
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
                <option value="interview">Interview</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perusahaan & Posisi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Apply
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lokasi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredApplications.map((app, index) => (
                    <motion.tr
                      key={app.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <div className="flex items-center">
                            <Building2 size={16} className="text-gray-400 mr-2" />
                            <div className="font-medium text-gray-900">{app.company_name}</div>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{app.position}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar size={16} className="text-gray-400 mr-2" />
                          {formatDate(app.application_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <MapPin size={16} className="text-gray-400 mr-2" />
                          {app.location || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Globe size={16} className="text-gray-400 mr-2" />
                          {app.application_platform || '-'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-sm text-gray-900">
                          <Banknote size={16} className="text-gray-400 mr-2" />
                          {formatCurrency(app.salary)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
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
                  ))}
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