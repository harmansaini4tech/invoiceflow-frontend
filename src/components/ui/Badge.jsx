import React from 'react';

const STATUS_STYLES = {
  draft:     'bg-gray-100 text-gray-600',
  sent:      'bg-blue-100 text-blue-700',
  paid:      'bg-green-100 text-green-700',
  overdue:   'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  partial:   'bg-yellow-100 text-yellow-700',
  active:    'bg-green-100 text-green-700',
  inactive:  'bg-gray-100 text-gray-600',
  free:      'bg-gray-100 text-gray-600',
  pro:       'bg-blue-100 text-blue-700',
  business:  'bg-purple-100 text-purple-700',
};

export default function Badge({ status, children }) {
  const text = children || status;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[status] || 'bg-gray-100 text-gray-600'}`}>
      {text}
    </span>
  );
}