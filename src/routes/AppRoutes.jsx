import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import Spinner from '../components/ui/Spinner';

import Login          from '../pages/auth/Login';
import Register       from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';
import Dashboard      from '../pages/dashboard/Dashboard';
import InvoiceList    from '../pages/invoices/InvoiceList';
import CreateInvoice  from '../pages/invoices/CreateInvoice';
import InvoiceDetail  from '../pages/invoices/InvoiceDetail';
import CustomerList   from '../pages/customers/CustomerList';
import QuoteList      from '../pages/quotes/QuoteList';
import ExpenseList    from '../pages/expenses/ExpenseList';
import Settings       from '../pages/settings/Settings';
import Pricing        from '../pages/subscription/Pricing';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <Spinner size="lg" />
    </div>
  );
  if (!token) return <Navigate to="/login" replace />;
  return <DashboardLayout>{children}</DashboardLayout>;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login"          element={<Login />} />
      <Route path="/register"       element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected */}
      <Route path="/dashboard"       element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/invoices"        element={<PrivateRoute><InvoiceList /></PrivateRoute>} />
      <Route path="/invoices/create" element={<PrivateRoute><CreateInvoice /></PrivateRoute>} />
      <Route path="/invoices/:id"    element={<PrivateRoute><InvoiceDetail /></PrivateRoute>} />
      <Route path="/customers"       element={<PrivateRoute><CustomerList /></PrivateRoute>} />
      <Route path="/quotes"          element={<PrivateRoute><QuoteList /></PrivateRoute>} />
      <Route path="/expenses"        element={<PrivateRoute><ExpenseList /></PrivateRoute>} />
      <Route path="/settings"        element={<PrivateRoute><Settings /></PrivateRoute>} />
      <Route path="/billing"         element={<PrivateRoute><Pricing /></PrivateRoute>} />

      {/* Fallback */}
      <Route path="/"   element={<Navigate to="/dashboard" replace />} />
      <Route path="*"   element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}