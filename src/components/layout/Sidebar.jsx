import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  LayoutDashboard, FileText, Users, Quote, Receipt,
  Settings, CreditCard, Shield, LogOut, Zap
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/invoices',  icon: FileText,        label: 'Invoices'  },
  { to: '/customers', icon: Users,           label: 'Customers' },
  { to: '/quotes',    icon: Quote,           label: 'Quotes'    },
  { to: '/expenses',  icon: Receipt,         label: 'Expenses'  },
];

export default function Sidebar() {
  const { user, company, logout } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();

  // Always fetch fresh subscription data
  useEffect(() => {
    api.get('/subscriptions')
      .then(r => setSubscription(r.data.data))
      .catch(() => {});
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isPaid = subscription?.plan && subscription.plan !== 'free';
  const invoiceUsed = subscription?.invoiceCount || 0;
  const invoiceLimit = subscription?.limits?.invoices || 5;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-red-600 rounded-xl flex items-center justify-center">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 text-sm">InvoiceFlow</p>
          <p className="text-xs text-gray-400 truncate max-w-[130px]">{company?.name}</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}

        <div className="pt-4 pb-2 px-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Account</p>
        </div>

        <NavLink to="/settings"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <Settings className="w-4 h-4" /> Settings
        </NavLink>
        <NavLink to="/billing"
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <CreditCard className="w-4 h-4" /> Billing
        </NavLink>
        {user?.role === 'superadmin' && (
          <NavLink to="/super-admin"
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <Shield className="w-4 h-4" /> Super Admin
          </NavLink>
        )}
      </nav>

      {/* Plan Badge */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className={`rounded-lg p-3 mb-3 ${isPaid ? 'bg-red-50' : 'bg-gray-50'}`}>
          <div className="flex items-center justify-between mb-1">
            <span className={`text-xs font-bold uppercase tracking-wide ${isPaid ? 'text-red-600' : 'text-gray-600'}`}>
              {subscription?.plan || 'free'} Plan
            </span>
            {!isPaid && (
              <NavLink to="/billing"
                className="text-xs text-red-600 font-semibold hover:underline">
                Upgrade
              </NavLink>
            )}
            {isPaid && (
              <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded-full font-semibold">
                Active
              </span>
            )}
          </div>

          {/* Only show usage bar on free plan */}
          {!isPaid && (
            <div className="mt-1">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Invoices</span>
                <span>{invoiceUsed} / {invoiceLimit}</span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all"
                  style={{ width: `${Math.min(100, (invoiceUsed / invoiceLimit) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Show plan perks on paid plan */}
          {isPaid && (
            <p className="text-xs text-gray-500 mt-1">
              ✓ Unlimited invoices & customers
            </p>
          )}
        </div>

        {/* User */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-sm">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
          </div>
          <button onClick={handleLogout}
            className="text-gray-400 hover:text-red-600 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}