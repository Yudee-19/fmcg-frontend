'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface ProductGalleryProps {
  images: string[];
  title: string;
}

export default function ProductGallery({ images, title }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const t = useTranslations('product');
  const visibleThumbs = 3;
  const extraCount = images.length - visibleThumbs - 1;

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-border">
        <Image
          src={images[activeIndex] ?? images[0]}
          alt={`${title} - Image ${activeIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain p-4"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3">
          {images.slice(0, visibleThumbs + 1).map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={cn(
                'relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors',
                i === activeIndex
                  ? 'border-primary'
                  : 'border-border hover:border-gray-300'
              )}
            >
              <Image
                src={img}
                alt={`${title} thumbnail ${i + 1}`}
                fill
                sizes="64px"
                className="object-contain p-1"
              />
            </button>
          ))}
          {extraCount > 0 && (
            <button
              onClick={() => setActiveIndex(visibleThumbs + 1)}
              className="w-16 h-16 rounded-lg border-2 border-border bg-gray-50 flex items-center justify-center text-sm text-text-secondary font-medium hover:border-gray-300"
            >
              {t('more_images', { count: extraCount })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
