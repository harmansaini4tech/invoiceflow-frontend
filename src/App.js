import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: { fontSize: '14px', borderRadius: '12px', padding: '12px 16px' },
            success: { style: { background: '#F0FDF4', color: '#166534', border: '1px solid #BBF7D0' } },
            error: { style: { background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}