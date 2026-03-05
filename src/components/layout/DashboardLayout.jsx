import React from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />

      {/* ── Main Content Area ─────────────────────────────────────────────
          Desktop: ml-64 to offset the fixed sidebar
          Mobile:  ml-0 because sidebar is a drawer (overlay), not inline
      ──────────────────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden ml-0 md:ml-64">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}