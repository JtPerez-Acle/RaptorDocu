'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CrawlResponse, crawlerApi } from '@/lib/api/crawler';
import { Button } from '../ui/Button';

interface CrawlStatusProps {
  crawlResult: CrawlResponse;
  onReset: () => void;
}

export function CrawlStatus({ crawlResult, onReset }: CrawlStatusProps) {
  const [status, setStatus] = useState<CrawlResponse>(crawlResult);

  const { data, isError, refetch } = useQuery({
    queryKey: ['crawlStatus', status.jobId],
    queryFn: () => crawlerApi.getCrawlStatus(status.jobId),
    enabled: status.status !== 'completed' && status.status !== 'failed',
    refetchInterval: status.status === 'pending' || status.status === 'processing' ? 5000 : false,
  });

  useEffect(() => {
    if (data) {
      setStatus(data);
    }
  }, [data]);

  const getStatusColor = () => {
    switch (status.status) {
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      case 'processing':
        return 'text-blue-600';
      default:
        return 'text-yellow-600';
    }
  };

  const formatStatus = () => {
    switch (status.status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'processing':
        return 'Processing';
      default:
        return 'Pending';
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-medium text-gray-900">Crawl Job Status</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Job ID</p>
            <p className="font-mono text-sm">{status.jobId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className={`font-medium ${getStatusColor()}`}>{formatStatus()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">URL</p>
            <p className="truncate text-sm">{status.url}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pages Crawled</p>
            <p className="text-sm">{status.pageCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pages Embedded</p>
            <p className="text-sm">{status.embeddedCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Pages Summarized</p>
            <p className="text-sm">{status.summarizedCount}</p>
          </div>
        </div>

        {status.error && (
          <div className="mt-4 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{status.error}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-4">
        {(status.status === 'pending' || status.status === 'processing') && (
          <Button
            onClick={() => refetch()}
            variant="outline"
          >
            Refresh Status
          </Button>
        )}
        <Button
          onClick={onReset}
          variant={status.status === 'completed' || status.status === 'failed' ? 'primary' : 'outline'}
        >
          Start New Crawl
        </Button>
      </div>
    </div>
  );
}