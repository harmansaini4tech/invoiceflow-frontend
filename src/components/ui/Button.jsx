import React from 'react';
import Spinner from './Spinner';

export default function Button({ children, variant = 'primary', loading, className = '', ...props }) {
  const base = 'inline-flex items-center gap-2 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-red-600 hover:bg-red-700 text-white shadow-sm',
    secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200',
    danger: 'bg-red-100 hover:bg-red-200 text-red-700',
    ghost: 'hover:bg-gray-100 text-gray-600',
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} disabled={loading || props.disabled} {...props}>
      {loading ? <Spinner size="sm" /> : children}
    </button>
  );
}