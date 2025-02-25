'use client';

import { Document } from '@/lib/api/search';
import { Button } from '../ui/Button';

interface SearchResultsProps {
  results: Document[];
  total: number;
  onSelectDocument: (document: Document) => void;
}

export function SearchResults({ results, total, onSelectDocument }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="py-6 text-center">
        <p className="text-gray-500">No results found. Try a different search query.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        Found {total} result{total === 1 ? '' : 's'}
      </div>

      <div className="space-y-4">
        {results.map((doc) => (
          <div
            key={doc.id}
            className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-medium text-blue-600">{doc.metadata.title}</h3>
              {doc.score !== undefined && (
                <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-800">
                  Score: {(doc.score * 100).toFixed(0)}%
                </span>
              )}
            </div>
            <div className="mb-3">
              <p className="text-sm text-gray-800">
                {doc.content.length > 200 ? `${doc.content.substring(0, 200)}...` : doc.content}
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between text-xs text-gray-500">
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Source:</span> {doc.metadata.source}
                </p>
                {doc.metadata.version && (
                  <p>
                    <span className="font-medium">Version:</span> {doc.metadata.version}
                  </p>
                )}
                {doc.metadata.lastUpdated && (
                  <p>
                    <span className="font-medium">Last Updated:</span>{' '}
                    {new Date(doc.metadata.lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="mt-2"
                onClick={() => onSelectDocument(doc)}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}