'use client';

import React from 'react';
import { Document } from '@/lib/api/search';
import { Button } from '../ui/Button';
import ReactMarkdown from 'react-markdown';

interface DocumentViewProps {
  document: Document;
  onBack: () => void;
}

export function DocumentView({ document, onBack }: DocumentViewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={onBack}>
          ← Back to results
        </Button>
        <a
          href={document.metadata.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          View Original
        </a>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-gray-900">{document.metadata.title}</h2>
        
        <div className="mb-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-blue-100 px-2 py-1 text-blue-800">
            {document.metadata.source}
          </span>
          {document.metadata.version && (
            <span className="rounded-full bg-green-100 px-2 py-1 text-green-800">
              v{document.metadata.version}
            </span>
          )}
          {document.score !== undefined && (
            <span className="rounded-full bg-purple-100 px-2 py-1 text-purple-800">
              Relevance: {(document.score * 100).toFixed(0)}%
            </span>
          )}
        </div>

        <div className="prose prose-sm max-w-none">
          <ReactMarkdown>{document.content}</ReactMarkdown>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          {document.metadata.lastUpdated && (
            <p>Last updated: {new Date(document.metadata.lastUpdated).toLocaleString()}</p>
          )}
          <p className="mt-1">Document ID: {document.id}</p>
        </div>
      </div>
    </div>
  );
}