'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from './api';
import { showToast, showError, showSuccess } from './sweetalert';

export interface User {
  id: string;
  username: string;
  fullName?: string | null;
  courtName?: string | null;
  role: 'USER' | 'ADMIN';
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, fullName?: string, courtName?: string) => Promise<boolean>;
  updateProfile: (fullName?: string, courtName?: string) => Promise<boolean>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedToken = localStorage.getItem('jads_token');
    if (savedToken) {
      setToken(savedToken);
      fetchProfile(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  async function fetchProfile(authToken: string) {
    try {
      const res = await fetchApi('/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        // Token invalid or expired
        localStorage.removeItem('jads_token');
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showError('เข้าสู่ระบบไม่สำเร็จ', data.message || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
        return false;
      }

      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      localStorage.setItem('jads_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      showToast(`ยินดีต้อนรับ ${receivedUser.fullName || receivedUser.username}`);
      router.push('/overview');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', error.message);
      return false;
    }
  };

  const register = async (username: string, password: string, fullName?: string, courtName?: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, fullName, courtName }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showError('ลงทะเบียนไม่สำเร็จ', data.message || 'ข้อมูลไม่ถูกต้องหรือชื่อผู้ใช้ซ้ำ');
        return false;
      }

      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      localStorage.setItem('jads_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      showSuccess('สมัครสมาชิกสำเร็จ', 'เข้าสู่ระบบให้ท่านเรียบร้อยแล้ว');
      router.push('/overview');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาดในการเชื่อมต่อ', error.message);
      return false;
    }
  };

  const updateProfile = async (fullName?: string, courtName?: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, courtName }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showError('บันทึกข้อมูลไม่สำเร็จ', data.message);
        return false;
      }

      setUser((prev) => (prev ? {
        ...prev,
        ...(fullName !== undefined && { fullName }),
        ...(courtName !== undefined && { courtName }),
      } : null));
      showToast('อัปเดตข้อมูลสำเร็จ');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด', error.message);
      return false;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showError('เปลี่ยนรหัสผ่านไม่สำเร็จ', data.message);
        return false;
      }

      showSuccess('เปลี่ยนรหัสผ่านสำเร็จ', 'รหัสผ่านใหม่ของท่านได้รับการบันทึกแล้ว');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด', error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore
    } finally {
      localStorage.removeItem('jads_token');
      setToken(null);
      setUser(null);
      showToast('ออกจากระบบเรียบร้อย', 'info');
      router.push('/login');
    }
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
