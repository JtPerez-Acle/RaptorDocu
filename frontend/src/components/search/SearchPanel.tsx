'use client';

import { useState, FormEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { searchApi, SearchResult, Document } from '@/lib/api/search';
import { SearchResults } from './SearchResults';
import { DocumentView } from './DocumentView';

export function SearchPanel() {
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [source, setSource] = useState('');
  const [version, setVersion] = useState('');
  const [limit, setLimit] = useState('10');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const { data, isLoading, isError } = useQuery<SearchResult>({
    queryKey: ['search', searchTerm, source, version, limit],
    queryFn: () =>
      searchApi.search({
        query: searchTerm,
        source: source || undefined,
        version: version || undefined,
        limit: parseInt(limit),
      }),
    enabled: searchTerm.length > 0,
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
    setSelectedDocument(null);
  };

  const handleDocumentSelect = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleBackToResults = () => {
    setSelectedDocument(null);
  };

  return (
    <Card title="Documentation Search" className="h-full">
      <div className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Search documentation..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Button type="submit" isLoading={isLoading}>
              Search
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              placeholder="Source"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              helperText="Filter by source"
            />
            <Input
              placeholder="Version"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              helperText="Filter by version"
            />
            <Input
              type="number"
              placeholder="Limit"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              helperText="Number of results"
            />
          </div>
        </form>

        {selectedDocument ? (
          <DocumentView document={selectedDocument} onBack={handleBackToResults} />
        ) : (
          <div>
            {isError && (
              <div className="rounded-md bg-red-50 p-4">
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
                    <h3 className="text-sm font-medium text-red-800">Search Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>Unable to perform search. Please try again.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {searchTerm && !isLoading && !isError && (
              <SearchResults
                results={data?.documents || []}
                total={data?.total || 0}
                onSelectDocument={handleDocumentSelect}
              />
            )}

            {!searchTerm && (
              <div className="rounded-md bg-blue-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-blue-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Search Tips</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        Enter a search query to find documentation. You can filter results by source
                        and version.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isLoading && (
              <div className="flex justify-center py-8">
                <svg
                  className="h-8 w-8 animate-spin text-blue-500"
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
          </div>
        )}
      </div>
    </Card>
  );
}