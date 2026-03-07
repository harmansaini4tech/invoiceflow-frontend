import React from 'react';
import { Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

export default function Topbar() {
  const { company } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center flex-shrink-0 px-4 md:px-6 gap-3">

      {/* Spacer for mobile hamburger */}
      <div className="w-9 h-9 flex-shrink-0 md:hidden" />

      {/* Search */}
      <div className="relative flex-1 md:flex-none">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          placeholder="Search..."
          className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full md:w-64"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 ml-auto">

        {/* ✅ Replace old bell button with this */}
        <NotificationBell />

        {company?.logo?.url && (
          <img src={company.logo.url} alt={company.name}
            className="hidden sm:block h-8 w-auto rounded" />
        )}
      </div>
    </header>
  );
}