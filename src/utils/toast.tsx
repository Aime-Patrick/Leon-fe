import React, { type ReactElement } from 'react';
import { Toaster } from 'react-hot-toast';
import type { ToastPosition } from 'react-hot-toast';
import { FaInfoCircle } from 'react-icons/fa';

export const toastConfig = {
    position: 'bottom-right' as ToastPosition,
    duration: 4000,
    style: {
        background: 'white',
        color: 'black',
        padding: '16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    },
    icon: <FaInfoCircle className="text-blue-500" /> as ReactElement,
};

export const CustomToaster = (): ReactElement => {
    return <Toaster toastOptions={toastConfig} />;
}; 