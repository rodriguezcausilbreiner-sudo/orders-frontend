import { registerLicense } from '@syncfusion/ej2-base';

export function registerSyncfusionLicense() {
  registerLicense(process.env.NEXT_PUBLIC_SYNCFUSION_LICENSE || '');
}