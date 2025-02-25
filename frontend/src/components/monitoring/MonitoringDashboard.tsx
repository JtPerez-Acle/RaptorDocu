'use client';

import { useQuery } from '@tanstack/react-query';
import { monitoringApi, MetricsResponse, EndpointMetric } from '@/lib/api/monitoring';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export function MonitoringDashboard() {
  const { data, isLoading, isError, error, refetch } = useQuery<MetricsResponse>({
    queryKey: ['metrics'],
    queryFn: monitoringApi.getMetrics,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const formatDuration = (ms: number): string => {
    if (ms < 1) {
      return '< 1ms';
    }
    if (ms < 1000) {
      return `${ms.toFixed(1)}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const getColorForDuration = (avg: number): string => {
    if (avg < 100) return 'bg-green-100 text-green-800';
    if (avg < 500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => refetch()}
          variant="outline"
          size="sm"
          isLoading={isLoading}
        >
          Refresh Data
        </Button>
      </div>

      {isError && (
        <Card className="bg-red-50 border-red-200">
          <div className="text-red-700">
            <p className="font-medium">Unable to load monitoring data</p>
            <p className="text-sm mt-1">Please try again or check the API connectivity.</p>
          </div>
        </Card>
      )}

      {isLoading && !data && (
        <div className="flex justify-center py-12">
          <svg
            className="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}

      {data && (
        <div className="grid gap-6 md:grid-cols-2">
          {Object.entries(data).map(([endpoint, metrics]) => (
            <EndpointMetricsCard
              key={endpoint}
              endpoint={endpoint}
              metrics={metrics}
              formatDuration={formatDuration}
              getColorForDuration={getColorForDuration}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface EndpointMetricsCardProps {
  endpoint: string;
  metrics: EndpointMetric;
  formatDuration: (ms: number) => string;
  getColorForDuration: (avg: number) => string;
}

function EndpointMetricsCard({
  endpoint,
  metrics,
  formatDuration,
  getColorForDuration,
}: EndpointMetricsCardProps) {
  const { count, avgDuration, minDuration, maxDuration } = metrics;

  return (
    <Card>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900 truncate">{endpoint}</h3>
          <p className="text-sm text-gray-500">
            {count} request{count === 1 ? '' : 's'} processed
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Avg</p>
            <p className={`mt-1 text-sm font-semibold ${getColorForDuration(avgDuration)}`}>
              {formatDuration(avgDuration)}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Min</p>
            <p className="mt-1 text-sm font-semibold text-green-600">
              {formatDuration(minDuration)}
            </p>
          </div>

          <div className="rounded-md bg-gray-50 p-3 text-center">
            <p className="text-xs font-medium text-gray-500 uppercase">Max</p>
            <p className="mt-1 text-sm font-semibold text-red-600">
              {formatDuration(maxDuration)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}