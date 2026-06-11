'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex items-center gap-2 text-xs text-muted-foreground">
      <Link className="transition hover:text-foreground" href="/">
        Home
      </Link>
      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const label = segment.replaceAll('-', ' ');
        const isLast = index === segments.length - 1;

        return (
          <span className="flex items-center gap-2" key={href}>
            <span>/</span>
            {isLast ? (
              <span className="capitalize text-foreground">{label}</span>
            ) : (
              <Link className="capitalize transition hover:text-foreground" href={href}>
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumbs;
