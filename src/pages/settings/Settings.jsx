import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { user, company } = useAuth();
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Profile</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Name</span>
            <span className="font-medium">{user?.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Email</span>
            <span className="font-medium">{user?.email}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Role</span>
            <span className="font-medium capitalize">{user?.role}</span>
          </div>
        </div>
      </div>
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Company</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-gray-50">
            <span className="text-gray-500">Company Name</span>
            <span className="font-medium">{company?.name}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Company Email</span>
            <span className="font-medium">{company?.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
}