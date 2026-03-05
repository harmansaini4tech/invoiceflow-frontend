import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock } from 'lucide-react';

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Logo + Title ───────────────────────────────────────────── */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-2xl items-center justify-center mb-3 md:mb-4 shadow-lg shadow-red-200">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">InvoiceFlow</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Sign in to your account</p>
        </div>

        {/* ── Card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={form.email}
                  required
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-9"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link to="/forgot-password"
                  className="text-xs md:text-sm text-red-600 hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={form.password}
                  required
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-9"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-gray-600 mt-4 md:mt-6">
          No account?{' '}
          <Link to="/register" className="text-red-600 font-semibold hover:underline">
            Start free trial
          </Link>
        </p>

        {/* ── Feature hints — visible on larger mobile/tablet+ ──────── */}
        <div className="hidden sm:grid grid-cols-3 gap-3 mt-8 text-center">
          {[
            { emoji: '📄', text: 'Professional invoices' },
            { emoji: '💰', text: 'Track payments' },
            { emoji: '📊', text: 'Business insights' },
          ].map(item => (
            <div key={item.text} className="bg-white/70 rounded-xl p-3 border border-gray-100">
              <p className="text-lg mb-1">{item.emoji}</p>
              <p className="text-xs text-gray-500 font-medium">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}