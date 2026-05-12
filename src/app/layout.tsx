import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import SyncfusionProvider from '@/components/SyncfusionProvider';
import { ToastProvider } from '@/components/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Sistema Ordenes — Gestión Logística',
  description: 'Sistema de Gestión de Pedidos — SENA ADSO',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <SyncfusionProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </SyncfusionProvider>
      </body>
    </html>
  );
}