'use client';

import Image from 'next/image';
import { useCartStore } from '@/store/cartStore';
import type { CartItem as CartItemType } from '@/types';
import PriceDisplay from '@/components/ui/PriceDisplay';
import QuantityStepper from '@/components/product/QuantityStepper';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <tr className="border-b border-border">
      {/* Product */}
      <td className="py-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-50 shrink-0">
            <Image
              src={item.thumbnail}
              alt={item.title}
              fill
              sizes="64px"
              className="object-contain p-1"
            />
          </div>
          <span className="text-sm font-medium text-text-primary line-clamp-2">
            {item.title}
          </span>
        </div>
      </td>

      {/* Price */}
      <td className="py-4 px-4 hidden sm:table-cell">
        <PriceDisplay price={item.price} size="sm" />
      </td>

      {/* Quantity */}
      <td className="py-4 px-4">
        <QuantityStepper
          value={item.quantity}
          onChange={(qty) => updateQuantity(item.productId, qty)}
          size="sm"
        />
      </td>

      {/* Subtotal */}
      <td className="py-4 px-4 hidden md:table-cell">
        <PriceDisplay price={item.price * item.quantity} size="sm" />
      </td>

      {/* Action */}
      <td className="py-4 pl-4">
        <button
          onClick={() => removeItem(item.productId)}
          className="p-1.5 text-text-muted hover:text-primary transition-colors"
          aria-label="Remove item"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </td>
    </tr>
  );
}
