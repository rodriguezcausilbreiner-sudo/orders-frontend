'use client';

import { useEffect } from 'react';
import { registerLicense } from '@syncfusion/ej2-base';
import { registerSpanishLocalization } from '@/lib/syncfusion-l10n';

// Registrar licencia al cargar el módulo
const licenseKey = process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE;
if (licenseKey) {
  registerLicense(licenseKey);
}

export default function SyncfusionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerSpanishLocalization();
  }, []);

  return <>{children}</>;
}
