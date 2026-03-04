import React from 'react';
const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
export default function Spinner({ size = 'md' }) {
  return (
    <div className={`${sizes[size]} border-2 border-red-200 border-t-red-600 rounded-full animate-spin`} />
  );
}