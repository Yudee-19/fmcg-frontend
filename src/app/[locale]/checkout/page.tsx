import { setRequestLocale } from 'next-intl/server';
import type { Metadata } from 'next';
import CheckoutForm from './CheckoutForm';

export const metadata: Metadata = {
  title: 'Checkout | Crown Value Mart',
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <CheckoutForm />;
}
