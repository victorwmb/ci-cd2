import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_URL,
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

export type User = {
  id?: number;
  lastName: string;
  firstName: string;
  email: string;
  birthDate?: string;
  city?: string;
  postalCode?: string;
  isAdmin?: boolean;
};

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users');
  return response.data.utilisateurs;
};

export const saveUser = async (user: User): Promise<{ id: number }> => {
  const response = await api.post('/users', user);
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}`);
};

export const loginAdmin = async (email: string, password: string): Promise<{ token: string, isAdmin: boolean }> => {
  const response = await api.post('/login', { email, password });
  return response.data;
};
