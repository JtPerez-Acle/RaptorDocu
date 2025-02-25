'use client';

import { useState, FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { crawlerApi, CrawlResponse } from '@/lib/api/crawler';
import { CrawlStatus } from './CrawlStatus';

export function CrawlerPanel() {
  const [url, setUrl] = useState('https://crawl4ai.com/mkdocs/');
  const [maxPages, setMaxPages] = useState('50');
  const [includePatterns, setIncludePatterns] = useState('*');
  const [excludePatterns, setExcludePatterns] = useState('');
  const [generateSummaries, setGenerateSummaries] = useState(true);
  const [crawlResult, setCrawlResult] = useState<CrawlResponse | null>(null);
  const [showQuickCrawl, setShowQuickCrawl] = useState(false);

  const { mutate: startCrawl, isPending: isStartingCrawl } = useMutation({
    mutationFn: crawlerApi.startCrawl,
    onSuccess: (data) => {
      setCrawlResult(data);
    },
  });

  const { mutate: crawl4aiDocs, isPending: isCrawling4ai } = useMutation({
    mutationFn: crawlerApi.crawl4aiDocs,
    onSuccess: (data) => {
      setCrawlResult(data);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const includeArray = includePatterns ? includePatterns.split(',').map((p) => p.trim()) : undefined;
    const excludeArray = excludePatterns ? excludePatterns.split(',').map((p) => p.trim()) : undefined;

    console.log('Starting crawl with params:', {
      url,
      maxPages: parseInt(maxPages),
      includePatterns: includePatterns,
      excludePatterns: excludeArray,
      generateSummaries,
    });

    startCrawl({
      url,
      maxPages: parseInt(maxPages),
      includePatterns: includePatterns,
      excludePatterns: excludeArray,
      generateSummaries,
    });
  };

  const handleQuickCrawl = () => {
    crawl4aiDocs({
      maxPages: parseInt(maxPages),
      generateSummaries,
    });
  };

  return (
    <Card title="Documentation Crawler" className="h-full">
      {crawlResult ? (
        <div className="space-y-4">
          <CrawlStatus crawlResult={crawlResult} onReset={() => setCrawlResult(null)} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <Button
              onClick={() => setShowQuickCrawl(!showQuickCrawl)}
              variant="outline"
              className="mb-4"
            >
              {showQuickCrawl ? 'Custom Crawl' : 'Quick Crawl Crawl4AI Docs'}
            </Button>

            {showQuickCrawl ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Quickly crawl the Crawl4AI documentation to populate the knowledge base.
                </p>
                <div className="flex flex-col space-y-4">
                  <Input
                    label="Max Pages"
                    type="number"
                    value={maxPages}
                    onChange={(e) => setMaxPages(e.target.value)}
                    helperText="Maximum number of pages to crawl"
                  />
                  <div className="flex items-center">
                    <input
                      id="generate-summaries"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      checked={generateSummaries}
                      onChange={(e) => setGenerateSummaries(e.target.checked)}
                    />
                    <label
                      htmlFor="generate-summaries"
                      className="ml-2 block text-sm text-gray-700"
                    >
                      Generate summaries
                    </label>
                  </div>
                  <Button
                    onClick={handleQuickCrawl}
                    isLoading={isCrawling4ai}
                    className="mt-2"
                  >
                    Start Quick Crawl
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="URL"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com/docs"
                  required
                />
                <Input
                  label="Max Pages"
                  type="number"
                  value={maxPages}
                  onChange={(e) => setMaxPages(e.target.value)}
                  helperText="Maximum number of pages to crawl"
                />
                <Input
                  label="Include Patterns"
                  value={includePatterns}
                  onChange={(e) => setIncludePatterns(e.target.value)}
                  placeholder="docs/*, api/*"
                  helperText="Comma-separated list of patterns to include"
                />
                <Input
                  label="Exclude Patterns"
                  value={excludePatterns}
                  onChange={(e) => setExcludePatterns(e.target.value)}
                  placeholder="blog/*, archive/*"
                  helperText="Comma-separated list of patterns to exclude"
                />
                <div className="flex items-center">
                  <input
                    id="generate-summaries"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={generateSummaries}
                    onChange={(e) => setGenerateSummaries(e.target.checked)}
                  />
                  <label
                    htmlFor="generate-summaries"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Generate summaries
                  </label>
                </div>
                <Button type="submit" isLoading={isStartingCrawl} className="mt-2">
                  Start Crawl
                </Button>
              </form>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}