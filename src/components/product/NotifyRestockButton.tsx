'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from '@/i18n/navigation';
import { subscribeToRestock } from '@/services/restockService';
import { ApiError } from '@/services/apiError';

interface Props {
  productId: string;
}

export default function NotifyRestockButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  const handleClick = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    setLoading(true);
    try {
      await subscribeToRestock(productId);
      setSubscribed(true);
      toast.success("You'll be notified on WhatsApp when this product is back in stock");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code === 'ALREADY_SUBSCRIBED') {
          setSubscribed(true);
          toast.info("You're already subscribed to restock alerts for this product");
        } else if (err.code === 'NO_WHATSAPP_NUMBER') {
          toast.error('Add a WhatsApp number to your profile to receive restock alerts');
        } else if (err.code === 'PRODUCT_IN_STOCK') {
          toast.info('This product is currently in stock');
        } else {
          toast.error(err.message);
        }
      } else {
        toast.error('Failed to subscribe to restock notifications');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || subscribed}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:cursor-not-allowed transition-colors text-sm font-semibold text-text-primary border border-border"
    >
      <Bell className="w-4 h-4" />
      {subscribed
        ? "We'll notify you on WhatsApp"
        : loading
          ? 'Subscribing…'
          : 'Notify me when back in stock'}
    </button>
  );
}
