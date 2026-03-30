'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCartStore } from '@/store/cartStore';
import { useRouter } from '@/i18n/navigation';
import type { Product } from '@/types';
import QuantityStepper from './QuantityStepper';
import Button from '@/components/ui/Button';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(product.minimumOrderQuantity || 1);
  const addItem = useCartStore((s) => s.addItem);
  const router = useRouter();
  const t = useTranslations('common');

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      title: product.title,
      price: product.finalPrice,
      quantity: qty,
      thumbnail: product.thumbnail,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push('/checkout');
  };

  return (
    <div className="space-y-4">
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-text-secondary font-medium">
          {t('add')}:
        </span>
        <QuantityStepper
          value={qty}
          onChange={setQty}
          min={product.minimumOrderQuantity || 1}
          max={product.stock}
          size="md"
        />
      </div>

      {/* Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="flex-1" onClick={handleBuyNow}>
          {t('buy_now')}
        </Button>
        <Button variant="primary" size="lg" className="flex-1" onClick={handleAddToCart}>
          {t('add_to_cart')}
        </Button>
      </div>
    </div>
  );
}
