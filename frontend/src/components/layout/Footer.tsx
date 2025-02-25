'use client';

export function Footer() {
  return (
    <footer className="bg-slate-800 py-6 text-center text-sm text-white">
      <div className="container mx-auto px-4">
        <p>© {new Date().getFullYear()} RAPTOR Documentation Assistant</p>
        <p className="mt-2 text-slate-400">
          Built with RAPTOR (Recursive Abstractive Processing and Thematic Organization for
          Retrieval) and Crawl4AI
        </p>
      </div>
    </footer>
  );
}