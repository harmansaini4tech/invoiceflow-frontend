import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, User, Building2, Mail, Lock, Check } from 'lucide-react';

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', companyName: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const perks = [
    '5 free invoices to get started',
    'No credit card required',
    'Cancel anytime',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">

        {/* ── Logo + Title ───────────────────────────────────────────── */}
        <div className="text-center mb-5 md:mb-8">
          <div className="inline-flex w-12 h-12 md:w-14 md:h-14 bg-red-600 rounded-2xl items-center justify-center mb-3 md:mb-4 shadow-lg shadow-red-200">
            <Zap className="w-6 h-6 md:w-7 md:h-7 text-white" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">Start your free trial today</p>
        </div>

        {/* ── Perks — shown on sm+ ───────────────────────────────────── */}
        <div className="hidden sm:flex items-center justify-center gap-4 mb-5 flex-wrap">
          {perks.map(perk => (
            <div key={perk} className="flex items-center gap-1.5 text-xs text-gray-600">
              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Check className="w-2.5 h-2.5 text-green-600" />
              </div>
              {perk}
            </div>
          ))}
        </div>

        {/* ── Card ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-xl shadow-gray-100 border border-gray-100 p-5 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">

            {/* Name + Company — side by side on sm+ */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" required value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="input-field pl-9"
                    placeholder="John Doe"
                    autoComplete="name"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={form.companyName}
                    onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))}
                    className="input-field pl-9"
                    placeholder="Acme Inc."
                    autoComplete="organization"
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email" required value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  className="input-field pl-9"
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password" required value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  className="input-field pl-9"
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                />
              </div>
              {/* Password strength hint */}
              {form.password.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i}
                        className={`h-1 flex-1 rounded-full transition-all ${
                          form.password.length >= i * 2
                            ? form.password.length >= 8
                              ? 'bg-green-500'
                              : 'bg-yellow-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className={`text-xs font-medium ${
                    form.password.length >= 8 ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {form.password.length >= 8 ? 'Strong' : 'Too short'}
                  </span>
                </div>
              )}
            </div>

            {/* Terms note */}
            <p className="text-xs text-gray-400 text-center">
              By creating an account you agree to our{' '}
              <span className="text-red-600 cursor-pointer hover:underline">Terms</span>
              {' '}&amp;{' '}
              <span className="text-red-600 cursor-pointer hover:underline">Privacy Policy</span>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10"
                      stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : 'Create Free Account 🎉'}
            </button>
          </form>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────── */}
        <p className="text-center text-sm text-gray-600 mt-4 md:mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-red-600 font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}