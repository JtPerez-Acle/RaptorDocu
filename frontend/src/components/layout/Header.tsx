'use client';

import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-slate-800 text-white shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <svg
            className="h-8 w-8 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <Link href="/" className="text-xl font-bold">
            RAPTOR Documentation Assistant
          </Link>
        </div>
        <nav>
          <ul className="flex space-x-6">
            <li>
              <Link href="/" className="hover:text-blue-300">
                Home
              </Link>
            </li>
            <li>
              <Link href="/monitoring" className="hover:text-blue-300">
                Monitoring
              </Link>
            </li>
            <li>
              <Link href="/test" className="hover:text-blue-300">
                API Test
              </Link>
            </li>
            <li>
              <Link 
                href="https://github.com/username/raptor-docu" 
                className="hover:text-blue-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}