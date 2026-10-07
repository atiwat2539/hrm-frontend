'use client';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import dynamic from 'next/dynamic';

const CalendarClient = dynamic(() => import('@/components/CalendarClient'), { 
  ssr: false,
  loading: () => <LoadingSpinner />
});

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Calendar Management</h1>
        <p className="text-sm text-gray-500">Manage all corporate events, trainings, and meetings</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <CalendarClient />
      </div>
    </div>
  );
}
