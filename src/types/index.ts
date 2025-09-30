export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  profilePicture?: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id: number;
  user_id: number;
  company_name: string;
  position: string;
  status: 'applied' | 'interview' | 'rejected' | 'accepted';
  application_date: string;
  notes?: string;
  contact_person?: string;
  contact_email?: string;
  salary?: number;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateJobApplicationRequest {
  company_name: string;
  position: string;
  status?: 'applied' | 'interview' | 'rejected' | 'accepted';
  application_date: string;
  notes?: string;
  contact_person?: string;
  contact_email?: string;
  salary?: number;
  location?: string;
}

export interface UpdateJobApplicationRequest {
  company_name?: string;
  position?: string;
  status?: 'applied' | 'interview' | 'rejected' | 'accepted';
  application_date?: string;
  notes?: string;
  contact_person?: string;
  contact_email?: string;
  salary?: number;
  location?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface JobApplicationStats {
  total: number;
  applied: number;
  interview: number;
  rejected: number;
  accepted: number;
}