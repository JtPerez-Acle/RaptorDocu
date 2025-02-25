'use client';

import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface CardProps {
  title?: string;
  className?: string;
  children: ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <div className={twMerge('overflow-hidden rounded-lg bg-white dark:bg-gray-800 shadow', className)}>
      {title && (
        <div className="border-b border-gray-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-900 px-4 py-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      )}
      <div className="px-4 py-5">{children}</div>
    </div>
  );
}