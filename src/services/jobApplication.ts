import { api } from '@/lib/axios';
import { JobApplication, CreateJobApplicationRequest, UpdateJobApplicationRequest, JobApplicationStats } from '@/types';

export const jobApplicationService = {
  getAll: async (filters?: { status?: string; company?: string; position?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.company) params.append('company', filters.company);
    if (filters?.position) params.append('position', filters.position);
    
    const response = await api.get(`/job-applications?${params.toString()}`);
    return response.data.job_applications;
  },

  getById: async (id: number): Promise<JobApplication> => {
    const response = await api.get(`/job-applications/${id}`);
    return response.data.job_application;
  },

  create: async (data: CreateJobApplicationRequest): Promise<JobApplication> => {
    const response = await api.post('/job-applications', data);
    return response.data.job_application;
  },

  update: async (id: number, data: UpdateJobApplicationRequest): Promise<JobApplication> => {
    const response = await api.put(`/job-applications/${id}`, data);
    return response.data.job_application;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/job-applications/${id}`);
  },

  getStats: async (): Promise<JobApplicationStats> => {
    const response = await api.get('/job-applications/stats');
    return response.data.stats;
  }
};