import { api } from '@/lib/axios';
import { User } from '@/types';

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
  profile_image?: string;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  profile_image?: string;
}

export const userService = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/admin/users');
    return response.data.users;
  },

  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await api.post('/admin/users', data);
    return response.data.user;
  },

  update: async (id: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data.user;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  }
};