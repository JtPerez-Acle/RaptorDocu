import { Inter } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/AppLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RAPTOR Documentation Assistant',
  description: 'A cloud-based documentation crawler using RAPTOR and Crawl4AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}