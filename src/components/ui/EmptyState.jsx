import React from 'react';
import { Inbox } from 'lucide-react';
export default function EmptyState({ message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-4">
        <Inbox className="w-8 h-8 text-red-400" />
      </div>
      <p className="text-gray-500 text-sm">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}