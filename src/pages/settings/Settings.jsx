import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Building2, Mail, Shield } from 'lucide-react';

export default function Settings() {
  const { user, company } = useAuth();

  return (
    <div className="max-w-2xl w-full space-y-4 md:space-y-6">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-xs md:text-sm text-gray-500 mt-0.5">
          Manage your profile and company info
        </p>
      </div>

      {/* ── Profile Card ───────────────────────────────────────────────── */}
      <div className="card p-4 md:p-6">
        {/* Card Header with avatar */}
        <div className="flex items-center gap-3 mb-4 md:mb-5 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <span className="text-red-600 font-bold text-lg">
              {user?.name?.[0]?.toUpperCase()}
            </span>
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user?.name}</h2>
            <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full capitalize">
              <Shield className="w-3 h-3" />
              {user?.role}
            </span>
          </div>
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Profile Details
        </h3>

        <div className="space-y-0 rounded-xl overflow-hidden border border-gray-100">
          {/* Name */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">Name</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900 truncate text-right">
                {user?.name}
              </span>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">Email</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900 truncate text-right">
                {user?.email}
              </span>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">Role</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900 capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Company Card ───────────────────────────────────────────────── */}
      <div className="card p-4 md:p-6">
        {/* Card Header */}
        <div className="flex items-center gap-3 mb-4 md:mb-5 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center flex-shrink-0">
            {company?.logo?.url ? (
              <img src={company.logo.url} alt={company.name}
                className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-blue-400" />
            )}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{company?.name}</h2>
            <p className="text-xs text-gray-400">Company Account</p>
          </div>
        </div>

        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Company Details
        </h3>

        <div className="space-y-0 rounded-xl overflow-hidden border border-gray-100">
          {/* Company Name */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-50">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">Company</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900 truncate text-right">
                {company?.name}
              </span>
            </div>
          </div>

          {/* Company Email */}
          <div className="flex items-center gap-3 px-4 py-3 bg-white">
            <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
              <span className="text-xs md:text-sm text-gray-500 flex-shrink-0">Email</span>
              <span className="text-xs md:text-sm font-semibold text-gray-900 truncate text-right">
                {company?.email}
              </span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}