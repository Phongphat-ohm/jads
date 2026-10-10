'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { fetchApi } from './api';
import { showToast, showError, showSuccess } from './sweetalert';
import { APP_CONFIG } from './config';

export interface User {
  id: string;
  username: string;
  email?: string | null;
  isEmailVerified?: boolean;
  isProfileComplete?: boolean;
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
  register: (username: string, password: string, email?: string, fullName?: string, courtName?: string) => Promise<boolean>;
  syncOAuth: (oauthData: {
    provider: string;
    providerAccountId: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    accessToken?: string;
  }) => Promise<{ success: boolean; isProfileComplete: boolean }>;
  completeProfile: (fullName: string, courtName: string, password: string) => Promise<boolean>;
  requestBindEmail: (newEmail: string) => Promise<boolean>;
  confirmBindEmail: (newEmail: string, otp: string) => Promise<boolean>;
  requestForgotPassword: (email: string) => Promise<boolean>;
  resetPasswordWithOtp: (email: string, otp: string, newPassword: string) => Promise<boolean>;
  updateProfile: (fullName?: string, courtName?: string, username?: string) => Promise<boolean>;
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
      
      if (receivedUser.isProfileComplete === false) {
        router.push('/onboarding');
      } else {
        router.push('/overview');
      }
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์', error.message);
      return false;
    }
  };

  const register = async (
    username: string,
    password: string,
    email?: string,
    fullName?: string,
    courtName?: string
  ): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email: email || undefined, fullName, courtName }),
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

  const syncOAuth = async (oauthData: {
    provider: string;
    providerAccountId: string;
    email?: string;
    fullName?: string;
    avatarUrl?: string;
    accessToken?: string;
  }) => {
    try {
      const res = await fetchApi('/auth/oauth/sync', {
        method: 'POST',
        body: JSON.stringify(oauthData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showError('เข้าสู่ระบบผ่าน Provider ล้มเหลว', data.message);
        return { success: false, isProfileComplete: true };
      }

      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      localStorage.setItem('jads_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      const isComplete = receivedUser.isProfileComplete !== false;
      if (!isComplete) {
        router.push('/onboarding');
      } else {
        showToast(`ยินดีต้อนรับ ${receivedUser.fullName || receivedUser.username}`);
        router.push('/overview');
      }

      return { success: true, isProfileComplete: isComplete };
    } catch (error: any) {
      showError('เชื่อมต่อระบบ Provider ล้มเหลว', error.message);
      return { success: false, isProfileComplete: true };
    }
  };

  const completeProfile = async (fullName: string, courtName: string, password: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/complete-profile', {
        method: 'POST',
        body: JSON.stringify({ fullName, courtName, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showError('บันทึกข้อมูลไม่สำเร็จ', data.message);
        return false;
      }

      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      localStorage.setItem('jads_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      showSuccess('บันทึกข้อมูลเรียบร้อย', 'ยินดีต้อนรับสู่ JADS Court');
      router.push('/overview');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด', error.message);
      return false;
    }
  };

  const requestBindEmail = async (newEmail: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/email/request-bind', {
        method: 'POST',
        body: JSON.stringify({ newEmail }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showError('ส่งรหัส OTP ไม่สำเร็จ', data.message);
        return false;
      }

      showToast(data.message || 'ส่งรหัส OTP ไปยังอีเมลเรียบร้อยแล้ว');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาดในการขอ OTP', error.message);
      return false;
    }
  };

  const confirmBindEmail = async (newEmail: string, otp: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/email/confirm-bind', {
        method: 'POST',
        body: JSON.stringify({ newEmail, otp }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showError('ยืนยันรหัส OTP ไม่สำเร็จ', data.message);
        return false;
      }

      const receivedToken = data.data.token;
      const receivedUser = data.data.user;

      localStorage.setItem('jads_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);

      showSuccess('ยืนยันอีเมลสำเร็จ', 'ที่อยู่อีเมลของคุณได้รับการผูกและยืนยันเรียบร้อยแล้ว');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาดในการยืนยัน OTP', error.message);
      return false;
    }
  };

  const requestForgotPassword = async (email: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showError('ไม่สามารถส่งคำขอได้', data.message);
        return false;
      }

      showToast(data.message || 'ระบบได้ส่งรหัส OTP ไปยังอีเมลของท่านแล้ว');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด', error.message);
      return false;
    }
  };

  const resetPasswordWithOtp = async (email: string, otp: string, newPassword: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        showError('รีเซ็ตรหัสผ่านไม่สำเร็จ', data.message);
        return false;
      }

      showSuccess('รีเซ็ตรหัสผ่านสำเร็จ', data.message || 'คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที');
      router.push('/login');
      return true;
    } catch (error: any) {
      showError('เกิดข้อผิดพลาด', error.message);
      return false;
    }
  };

  const updateProfile = async (fullName?: string, courtName?: string, username?: string): Promise<boolean> => {
    try {
      const res = await fetchApi('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ fullName, courtName, username }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        showError('บันทึกข้อมูลไม่สำเร็จ', data.message);
        return false;
      }

      setUser((prev) => (prev ? {
        ...prev,
        ...(data.data?.username && { username: data.data.username }),
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
      // 1. Call server logout endpoint to record audit log and invalidate session
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Server logout notice:', err);
    } finally {
      // 2. Clear local storage tokens and React states
      localStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      localStorage.removeItem(APP_CONFIG.USER_KEY);
      sessionStorage.removeItem(APP_CONFIG.TOKEN_KEY);
      sessionStorage.removeItem(APP_CONFIG.USER_KEY);
      setToken(null);
      setUser(null);

      // 3. Clear NextAuth session cookies and state
      try {
        await signOut({ redirect: false });
      } catch (err) {
        console.warn('NextAuth signOut error:', err);
      }

      showToast('ออกจากระบบเรียบร้อย', 'info');

      // 4. Force full page navigation to /login to guarantee fresh browser state
      window.location.href = '/login?logged_out=1';
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
        syncOAuth,
        completeProfile,
        requestBindEmail,
        confirmBindEmail,
        requestForgotPassword,
        resetPasswordWithOtp,
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
