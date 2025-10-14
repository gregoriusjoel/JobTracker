'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  User, 
  Mail,
  Shield,
  Users,
  UserCheck,
  UserX,
  ArrowLeft
} from 'lucide-react';
import { toast } from 'react-toastify';
import { User as UserType } from '@/types';
import { userService } from '@/services/user';
import { Header } from '@/components/Header';
import { UserModal } from '@/components/UserModal';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function AdminPage() {
  const { user: currentUser } = useAuth();
  const { theme } = useTheme();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | undefined>();

  // Theme-based styles
  const isDark = theme === 'dark';
  const bgStyle = {
    backgroundColor: isDark ? '#0f172a' : '#f8fafc',
    backgroundImage: isDark 
      ? 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' 
      : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    minHeight: '100vh'
  };
  const cardBgStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    boxShadow: isDark 
      ? '0 10px 25px -3px rgba(0, 0, 0, 0.7), 0 4px 6px -2px rgba(0, 0, 0, 0.5)' 
      : '0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    border: 'none'
  };
  const headerBgStyle = {
    backgroundColor: isDark ? '#1e293b' : '#ffffff',
    borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`
  };
  const textStyle = {
    color: isDark ? '#f8fafc' : '#111827'
  };
  const secondaryTextStyle = {
    color: isDark ? '#cbd5e1' : '#6b7280'
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data || []);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      toast.error('Cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userService.delete(id);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleEdit = (user: UserType) => {
    setEditingUser(user);
  };

  const handleModalClose = () => {
    setIsCreateModalOpen(false);
    setEditingUser(undefined);
  };

  const handleRefresh = () => {
    fetchUsers();
  };

  const filteredUsers = users.filter((user) => {
    return user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  const totalUsers = users.length;
  const adminUsers = users.filter(u => u.role === 'admin').length;
  const regularUsers = users.filter(u => u.role === 'user').length;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div style={bgStyle}>
      <Header />

      {/* Welcome Header */}
      <div style={headerBgStyle}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center">
              <Link href="/dashboard">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mr-4 p-2 rounded-lg transition-all duration-200"
                  style={{
                    color: isDark ? '#cbd5e1' : '#6b7280'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#a855f7';
                    e.currentTarget.style.backgroundColor = isDark ? '#2d1b69' : '#f3e8ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isDark ? '#cbd5e1' : '#6b7280';
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ArrowLeft size={20} />
                </motion.button>
              </Link>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-2"
              >
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  User Management<span style={textStyle}>🛡️</span>
                </h1>
                <p style={secondaryTextStyle} className="mt-1">
                  Manage system users and their permissions
                </p>
              </motion.div>
            </div>
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateModalOpen(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Plus size={20} className="mr-2" />
              Add New User
            </motion.button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)'
                : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
              border: 'none'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-blue-200' : 'text-blue-700'}`}>Total Users</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-blue-900'}`}>{totalUsers}</p>
              </div>
              <Users className={`opacity-80 ${isDark ? 'text-blue-300' : 'text-blue-600'}`} size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #7c2d12 0%, #a21caf 100%)'
                : 'linear-gradient(135deg, #fdf4ff 0%, #f3e8ff 100%)',
              border: 'none'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-purple-200' : 'text-purple-700'}`}>Admins</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-purple-900'}`}>{adminUsers}</p>
              </div>
              <UserCheck className={`opacity-80 ${isDark ? 'text-purple-300' : 'text-purple-600'}`} size={24} />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl p-6 shadow-lg"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, #14532d 0%, #166534 100%)'
                : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              border: 'none'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-green-200' : 'text-green-700'}`}>Regular Users</p>
                <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-green-900'}`}>{regularUsers}</p>
              </div>
              <UserX className={`opacity-80 ${isDark ? 'text-green-300' : 'text-green-600'}`} size={24} />
            </div>
          </motion.div>
        </div>

        {/* Search */}
        <div className="rounded-xl shadow-sm p-6 mb-6" style={cardBgStyle}>
          <div className="relative">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} size={20} />
            <input
              type="text"
              placeholder="Search users by username or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all placeholder-gray-500"
              style={{
                backgroundColor: isDark ? '#334155' : '#ffffff',
                color: isDark ? '#f8fafc' : '#111827',
                border: `1px solid ${isDark ? '#475569' : '#d1d5db'}`
              }}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-xl shadow-sm overflow-hidden" style={cardBgStyle}>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`mx-auto h-12 w-12 mb-4 ${isDark ? 'text-slate-400' : 'text-gray-400'}`} />
              <h3 className="text-lg font-medium mb-2" style={textStyle}>No users found</h3>
              <p style={{color: isDark ? '#cbd5e1' : '#6b7280'}} className="mb-4">Try adjusting your search or add new users</p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                Add User
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{
                  backgroundColor: isDark ? '#334155' : '#f9fafb'
                }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{color: isDark ? '#cbd5e1' : '#6b7280'}}>
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{color: isDark ? '#cbd5e1' : '#6b7280'}}>
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{color: isDark ? '#cbd5e1' : '#6b7280'}}>
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                        style={{color: isDark ? '#cbd5e1' : '#6b7280'}}>
                      Created At
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider"
                        style={{color: isDark ? '#cbd5e1' : '#6b7280'}}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody style={{
                  backgroundColor: isDark ? '#1e293b' : '#ffffff'
                }}>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      style={{
                        backgroundColor: isDark ? '#1e293b' : '#ffffff',
                        borderBottom: `1px solid ${isDark ? '#334155' : '#e5e7eb'}`
                      }}
                      className="transition-colors duration-200"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#334155' : '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = isDark ? '#1e293b' : '#ffffff';
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-3">
                            {user.profile_image ? (
                              <>
                                <Image
                                  src={user.profile_image}
                                  alt={`${user.username} profile`}
                                  width={40}
                                  height={40}
                                  className="h-10 w-10 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    const fallback = e.currentTarget.parentElement?.querySelector('.fallback-avatar') as HTMLElement;
                                    if (fallback) {
                                      fallback.style.display = 'flex';
                                    }
                                  }}
                                />
                                <div className="fallback-avatar h-10 w-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm absolute top-0 left-0" style={{ display: 'none' }}>
                                  <User className="h-5 w-5 text-white" />
                                </div>
                              </>
                            ) : (
                              <div className="h-10 w-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center shadow-sm">
                                <User className="h-5 w-5 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate" style={textStyle}>
                              {user.username}
                              {user.id === currentUser?.id && (
                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-sm flex items-center truncate" style={{color: isDark ? '#cbd5e1' : '#6b7280'}}>
                              <Mail className="h-3 w-3 mr-1 flex-shrink-0" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm" style={textStyle}>
                        {user.name || '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          <Shield size={12} className="mr-1" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm" style={textStyle}>
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(user)}
                            className="p-2 text-purple-600 rounded-lg transition-all duration-200"
                            title="Edit User"
                            style={{
                              backgroundColor: 'transparent'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = isDark ? '#2d1b69' : '#f3e8ff';
                              e.currentTarget.style.transform = 'scale(1.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                          >
                            <Edit size={16} />
                          </button>
                          {user.id !== currentUser?.id && (
                            <button
                              onClick={() => handleDelete(user.id)}
                              className="p-2 text-red-600 rounded-lg transition-all duration-200"
                              title="Delete User"
                              style={{
                                backgroundColor: 'transparent'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = isDark ? '#7f1d1d' : '#fee2e2';
                                e.currentTarget.style.transform = 'scale(1.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
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

      {/* User Modal */}
      <UserModal
        isOpen={isCreateModalOpen || !!editingUser}
        onClose={handleModalClose}
        onSuccess={handleRefresh}
        user={editingUser}
      />
    </div>
  );
}