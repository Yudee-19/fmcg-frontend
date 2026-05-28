'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/store/authStore';
import TrackOrderForm from './TrackOrderForm';
import OrdersList from '../orders/OrdersList';

type TabId = 'history' | 'lookup';

export default function TrackOrderTabs() {
  const t = useTranslations('track_order');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  // Logged-in users default to History; guests default to Lookup
  const [activeTab, setActiveTab] = useState<TabId>(
    isAuthenticated ? 'history' : 'lookup',
  );

  return (
    <div className="space-y-6">
      {/* Tab selector */}
      <div className="flex gap-2 border-b border-border">
        {isAuthenticated && (
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('history_tab')}
          </button>
        )}
        <button
          onClick={() => setActiveTab('lookup')}
          className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'lookup'
              ? 'border-primary text-primary'
              : 'border-transparent text-text-secondary hover:text-text-primary'
          }`}
        >
          {t('lookup_tab')}
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'history' && isAuthenticated && <OrdersList />}
      {activeTab === 'lookup' && <TrackOrderForm />}
    </div>
  );
}
