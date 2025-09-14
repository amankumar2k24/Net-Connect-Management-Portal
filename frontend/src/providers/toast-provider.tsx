'use client'

import { Toaster } from 'react-hot-toast'

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'white',
          color: '#363636',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        },
        success: {
          style: {
            border: '1px solid #10b981',
            background: '#f0fdf4',
            color: '#065f46',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: '#f0fdf4',
          },
        },
        error: {
          style: {
            border: '1px solid #ef4444',
            background: '#fef2f2',
            color: '#991b1b',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fef2f2',
          },
        },
      }}
    />
  )
}