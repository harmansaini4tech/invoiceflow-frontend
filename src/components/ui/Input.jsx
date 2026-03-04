import React from 'react';

export default function Input({ label, error, prefix, suffix, className = '', ...props }) {
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{prefix}</span>
        )}
        <input
          className={`input-field ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${error ? 'border-red-400 focus:ring-red-400' : ''} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">{suffix}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600 flex items-center gap-1">{error}</p>}
    </div>
  );
}