'use client';

import { MonitoringDashboard } from '@/components/monitoring/MonitoringDashboard';

export default function MonitoringPage() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Performance Monitoring</h1>
        <p className="mt-2 text-gray-600">
          Track performance metrics for all API endpoints used by the RAPTOR Documentation Assistant.
        </p>
      </div>
      
      <MonitoringDashboard />
    </main>
  );
}