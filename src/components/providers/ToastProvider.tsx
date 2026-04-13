'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'font-sans',
          title: 'font-medium',
          description: 'text-sm',
        },
      }}
    />
  );
}