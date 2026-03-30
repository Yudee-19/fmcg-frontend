'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function AuthSync() {
  const token = useAuthStore((s) => s.token);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    if (!token) return;

    const validateToken = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) {
          clearAuth();
        }
      } catch {
        // Network error — keep the token for offline usage
      }
    };

    validateToken();
  }, [token, clearAuth]);

  return null;
}
