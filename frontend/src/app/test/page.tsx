'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { crawlerApi } from '@/lib/api/crawler';
import { searchApi } from '@/lib/api/search';
import { monitoringApi } from '@/lib/api/monitoring';

export default function TestPage() {
  const [crawlerStatus, setCrawlerStatus] = useState<string>('Not tested');
  const [searchStatus, setSearchStatus] = useState<string>('Not tested');
  const [monitoringStatus, setMonitoringStatus] = useState<string>('Not tested');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<any>(null);

  const testCrawler = async () => {
    setLoading(true);
    setCrawlerStatus('Testing...');
    try {
      console.log('Testing crawler API...');
      const response = await crawlerApi.crawl4aiDocs({
        maxPages: 5,
        generateSummaries: true
      });
      console.log('Crawler API response:', response);
      setCrawlerStatus('Success!');
      setResults({ type: 'crawler', data: response });
    } catch (error: any) {
      console.error('Crawler API error:', error);
      setCrawlerStatus(`Error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testSearch = async () => {
    setLoading(true);
    setSearchStatus('Testing...');
    try {
      const response = await searchApi.search({
        query: 'documentation',
        limit: 5
      });
      setSearchStatus('Success!');
      setResults({ type: 'search', data: response });
    } catch (error: any) {
      setSearchStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testMonitoring = async () => {
    setLoading(true);
    setMonitoringStatus('Testing...');
    try {
      const response = await monitoringApi.getMetrics();
      setMonitoringStatus('Success!');
      setResults({ type: 'monitoring', data: response });
    } catch (error: any) {
      setMonitoringStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCrawl4AIDocs = async () => {
    setLoading(true);
    setCrawlerStatus('Testing specific crawl...');
    try {
      const response = await crawlerApi.startCrawl({
        url: 'https://crawl4ai.com/mkdocs/',
        maxPages: 5,
        includePatterns: ['*'],
        generateSummaries: true
      });
      setCrawlerStatus('Success!');
      setResults({ type: 'crawler', data: response });
    } catch (error: any) {
      setCrawlerStatus(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">API Testing Page</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Crawler API</h2>
          <div className="mb-4">Status: <span className={crawlerStatus.includes('Error') ? 'text-red-600' : crawlerStatus === 'Success!' ? 'text-green-600' : 'text-blue-600'}>{crawlerStatus}</span></div>
          <div className="flex flex-col space-y-2">
            <Button onClick={testCrawler} isLoading={loading && crawlerStatus === 'Testing...'} disabled={loading}>
              Test Crawl4AI Docs
            </Button>
            <Button onClick={testCrawl4AIDocs} isLoading={loading && crawlerStatus === 'Testing specific crawl...'} disabled={loading}>
              Test Specific URL
            </Button>
          </div>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Search API</h2>
          <div className="mb-4">Status: <span className={searchStatus.includes('Error') ? 'text-red-600' : searchStatus === 'Success!' ? 'text-green-600' : 'text-blue-600'}>{searchStatus}</span></div>
          <Button onClick={testSearch} isLoading={loading && searchStatus === 'Testing...'} disabled={loading}>
            Test Search
          </Button>
        </Card>
        
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Monitoring API</h2>
          <div className="mb-4">Status: <span className={monitoringStatus.includes('Error') ? 'text-red-600' : monitoringStatus === 'Success!' ? 'text-green-600' : 'text-blue-600'}>{monitoringStatus}</span></div>
          <Button onClick={testMonitoring} isLoading={loading && monitoringStatus === 'Testing...'} disabled={loading}>
            Test Metrics
          </Button>
        </Card>
      </div>
      
      {results && (
        <Card className="p-4">
          <h2 className="text-lg font-medium mb-4">Response Data</h2>
          <div className="overflow-auto max-h-96">
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-sm">
              {JSON.stringify(results.data, null, 2)}
            </pre>
          </div>
        </Card>
      )}
    </main>
  );
}