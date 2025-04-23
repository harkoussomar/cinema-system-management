import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

interface LinkItem {
  url: string | null;
  label: string;
  active: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  links: LinkItem[];
}

export function Pagination({ links }: PaginationProps) {
  // Filter out the "Next" and "Previous" specific links
  const pageLinks = links.filter(
    (link) => link.label !== '&laquo; Previous' && link.label !== 'Next &raquo;'
  );

  const prevLink = links.find((link) => link.label === '&laquo; Previous');
  const nextLink = links.find((link) => link.label === 'Next &raquo;');

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex justify-between flex-1 sm:hidden">
        {prevLink && prevLink.url ? (
          <Link
            href={prevLink.url}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium transition-colors border rounded-md border-border bg-card text-foreground hover:bg-muted"
          >
            Previous
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 text-sm font-medium border rounded-md cursor-not-allowed border-border bg-muted text-muted-foreground">
            Previous
          </span>
        )}

        {nextLink && nextLink.url ? (
          <Link
            href={nextLink.url}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium transition-colors border rounded-md border-border bg-card text-foreground hover:bg-muted"
          >
            Next
          </Link>
        ) : (
          <span className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium border rounded-md cursor-not-allowed border-border bg-muted text-muted-foreground">
            Next
          </span>
        )}
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-foreground">
            Showing page <span className="font-medium">{pageLinks.find(link => link.active)?.label || '1'}</span> of{' '}
            <span className="font-medium">{pageLinks.length}</span> pages
          </p>
        </div>

        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
            {prevLink && (
              <Link
                href={prevLink.url || '#'}
                className={`relative inline-flex items-center rounded-l-md border border-border px-2 py-2 text-sm font-medium ${prevLink.url
                    ? 'bg-card text-foreground hover:bg-muted transition-colors'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                aria-disabled={!prevLink.url}
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="w-5 h-5" aria-hidden="true" />
              </Link>
            )}

            {pageLinks.map((link) => (
              <Link
                key={link.label}
                href={link.url || '#'}
                className={`relative inline-flex items-center border border-border px-4 py-2 text-sm font-medium transition-colors ${link.active
                    ? 'z-10 bg-primary border-primary text-primary-foreground'
                    : link.url
                      ? 'bg-card text-foreground hover:bg-muted'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                aria-current={link.active ? 'page' : undefined}
                aria-disabled={!link.url}
                dangerouslySetInnerHTML={{ __html: link.label }}
              />
            ))}

            {nextLink && (
              <Link
                href={nextLink.url || '#'}
                className={`relative inline-flex items-center rounded-r-md border border-border px-2 py-2 text-sm font-medium ${nextLink.url
                    ? 'bg-card text-foreground hover:bg-muted transition-colors'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                aria-disabled={!nextLink.url}
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="w-5 h-5" aria-hidden="true" />
              </Link>
            )}
          </nav>
        </div>
      </div>
    </div>
  );
}
