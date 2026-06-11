'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAVIGATION_REGISTRY } from '@/config/navigationRegistry';
import { usePermissions } from '@/hooks/usePermissions';
import { useModules } from '@/hooks/useModules';
import { cn } from '@/lib/utils';
import { useTranslation } from '../../hooks/useTranslation';

export function Navigation({ collapsed = false, scope = 'admin', variant = 'admin' }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { hasPermission } = usePermissions();
  const { hasModule } = useModules();
  
  const isPlatform = variant === 'superadmin';

  // Dynamic builder engine to build & group navigation menu from registry at runtime
  const getDynamicSections = () => {
    const activeItems = NAVIGATION_REGISTRY.filter((item) => {
      if (item.scope !== scope) return false;
      return hasModule(item.module) && hasPermission(item.permission);
    });

    const groupedSections = [];
    activeItems.forEach((item) => {
      let sec = groupedSections.find((s) => s.title === item.section);
      if (!sec) {
        sec = { title: item.section, items: [] };
        groupedSections.push(sec);
      }
      sec.items.push(item);
    });

    return groupedSections;
  };

  const sections = getDynamicSections();

  // Return empty nav container during SSR and initial client paint to prevent hydration mismatch
  if (!mounted) {
    return <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5 scrollbar-hide" />;
  }

  return (
    <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4 space-y-5 scrollbar-hide">
      {sections.map((section) => {
        const visibleItems = section.items;

        if (visibleItems.length === 0) return null;

        return (
          <div key={section.title}>
            {!collapsed ? (
              <p
                className={cn(
                  'mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.25em]',
                  isPlatform ? 'text-slate-500' : 'text-muted-foreground/60'
                )}
              >
                {t(`section_${section.title.toLowerCase().replace(/ & /g, '_').replace(/ /g, '_')}`) || section.title}
              </p>
            ) : null}

            <div className="space-y-1">
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                const translatedLabel = t(`nav_${item.id.replace(/-/g, '_')}`) || item.label;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      collapsed && 'justify-center',
                      isPlatform
                        ? active
                          ? 'bg-violet-500/10 text-violet-300'
                          : 'text-slate-500 hover:bg-violet-500/5 hover:text-slate-300'
                        : active
                          ? 'bg-primary/15 text-primary shadow-sm shadow-primary/5'
                          : 'text-muted-foreground hover:bg-white/5 hover:text-foreground'
                    )}
                    title={collapsed ? translatedLabel : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                        isPlatform
                          ? active
                            ? 'text-violet-400'
                            : 'text-slate-600 group-hover:text-slate-400'
                          : active
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
                      )}
                    />
                    {!collapsed ? <span className="min-w-0 truncate">{translatedLabel}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export default Navigation;
