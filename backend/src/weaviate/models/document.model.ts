/**
 * Document model interface
 */
export interface DocumentMetadata {
  title: string;
  url: string;
  source: string;
  version?: string;
}

export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
  score?: number;
}

export interface SearchResult {
  documents: Document[];
  total: number;
}