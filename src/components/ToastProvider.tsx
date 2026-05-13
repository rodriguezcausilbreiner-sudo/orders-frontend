'use client';

import React, { createContext, useContext, useRef } from 'react';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';

type ToastType = 'Success' | 'Error' | 'Warning' | 'Info';

interface ToastContextType {
  showToast: (title: string, content: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastObj = useRef<ToastComponent>(null);

  const showToast = (title: string, content: string, type: ToastType = 'Info') => {
    let cssClass = 'e-toast-info';
    if (type === 'Success') cssClass = 'e-toast-success';
    if (type === 'Error') cssClass = 'e-toast-danger';
    if (type === 'Warning') cssClass = 'e-toast-warning';

    toastObj.current?.show({
      title: title,
      content: content,
      cssClass: cssClass,
      icon: type === 'Success' ? 'e-success' : type === 'Error' ? 'e-error' : 'e-info',
      timeOut: 4000,
    });
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastComponent
        id="global-toast"
        ref={toastObj}
        position={{ X: 'Right', Y: 'Bottom' }}
      />
    </ToastContext.Provider>
  );
};
