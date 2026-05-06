import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { registerSyncfusionLicense } from '@/lib/syncfusion-license';

registerSyncfusionLicense();

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'OMS Portal — Enterprise Logistics',
  description: 'Order Management System — SENA ADSO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}