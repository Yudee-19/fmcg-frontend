'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiServer from '@/services/apiServer';

export default function AuthSync() {
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        await apiServer.get('/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch {
        // API error (401 etc.) — clear auth. Network error — keep token for offline.
        clearAuth();
      }
    };

    validateToken();
  }, [token, clearAuth]);

  return null;
}
