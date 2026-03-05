import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Topbar() {
  const { company } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center flex-shrink-0 px-4 md:px-6 gap-3">

      {/* Spacer for mobile hamburger — exact same size as hamburger button */}
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
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-500" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        {company?.logo?.url && (
          <img src={company.logo.url} alt={company.name}
            className="hidden sm:block h-8 w-auto rounded" />
        )}
      </div>
    </header>
  );
}