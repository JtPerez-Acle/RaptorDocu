'use client';

import { SearchPanel } from '@/components/search/SearchPanel';
import { CrawlerPanel } from '@/components/crawler/CrawlerPanel';

export default function Home() {
  return (
    <main className="container mx-auto py-8 px-4">
      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <CrawlerPanel />
        </div>
        <div className="lg:col-span-8">
          <SearchPanel />
        </div>
      </div>
    </main>
  );
}