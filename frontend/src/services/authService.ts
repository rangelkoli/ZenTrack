import axios, { AxiosError } from 'axios';

const API_URL = 'http://127.0.0.1:5000/auth';

interface LoginResponse {
  access_token: string;
  user: {
    email: string;
    name: string;
    id: string;
  };
}

interface RegisterResponse {
  message: string;
  user: {
    email: string;
    name: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login with:', { email: email.trim() });
      const response = await axios.post(`${API_URL}/login`, { 
        email: email.trim(),
        password 
      });
      console.log('Login response:', response.data);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        console.error('Login error:', {
          status: axiosError.response?.status,
          data: axiosError.response?.data,
        });
        throw new Error(axiosError.response?.data?.error || 'Login failed');
      }
      console.error('Unexpected error during login:', error);
      throw error;
    }
  },

  async getCurrentUser() {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) throw new Error('No token found');

      const response = await axios.get(
        `${API_URL}/get_user`,

        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        localStorage.removeItem('access_token');
        throw new Error(error.response?.data?.error || 'Failed to get user');
      }
      throw error;
    }
  },

  async register(email: string, password: string, name: string): Promise<RegisterResponse> {
    try {
      console.log('Attempting registration with:', { email: email.trim(), name: name.trim() });
      const response = await axios.post(`${API_URL}/register`, {
        email: email.trim(),
        password,
        name: name.trim()
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ error: string }>;
        throw new Error(axiosError.response?.data?.error || 'Registration failed');
      }
      throw error;
    }
  },

  async validateToken(): Promise<boolean> {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return false;

      const response = await axios.post(
        `${API_URL}/validate_token`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.valid;
    } catch (error) {
      localStorage.removeItem('access_token');
      return false;
    }
  },
};
