'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, LogOut, Settings, Shield, Sparkles } from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';
import { cn } from '@/lib/utils';
import { Navigation } from './Navigation';
import { useTranslation } from '../../hooks/useTranslation';

export function Sidebar({ collapsed = false, onCollapsedChange, scope = 'admin', variant = 'admin' }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTenant = useModuleStore((s) => s.activeTenant);
  const activeModules = useModuleStore((s) => s.activeModules);
  const user = useModuleStore((s) => s.user);
  const logout = useModuleStore((s) => s.logout);
  const isPlatform = variant === 'superadmin';
  const BrandIcon = isPlatform ? Shield : Sparkles;

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-dvh max-h-dvh min-h-0 flex-shrink-0 flex-col overflow-hidden border-r transition-all duration-300 ease-in-out',
        collapsed ? 'w-[68px]' : 'w-[260px]',
        isPlatform ? 'border-violet-500/10 bg-slate-950' : 'border-border/60 bg-[hsl(var(--card))]'
      )}
    >
      <div className={cn('flex h-16 items-center border-b px-4', isPlatform ? 'border-violet-500/10' : 'border-border/40')}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className={cn(
              'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
              isPlatform ? 'bg-violet-500/15 text-violet-400' : 'bg-primary/15 text-primary'
            )}
          >
            <BrandIcon className="h-4.5 w-4.5" />
          </div>
          {!collapsed ? (
            <div className="overflow-hidden">
              <h1 className={cn('text-sm font-bold tracking-tight', isPlatform ? 'text-white' : 'font-display text-foreground')}>
                {isPlatform ? 'Trimly Admin' : 'Trimly'}
              </h1>
              <p className={cn('truncate text-[10px]', isPlatform ? 'text-violet-400/60' : 'text-muted-foreground')}>
                {isPlatform ? 'Super Administrator' : (mounted && activeTenant ? activeTenant.name : 'Salon Studio')}
              </p>
            </div>
          ) : null}
        </div>
      </div>

      <Navigation
        collapsed={collapsed}
        scope={scope}
        variant={variant}
      />

      <div className={cn('shrink-0 border-t p-3 space-y-2', isPlatform ? 'border-violet-500/10 bg-slate-950' : 'border-border/40 bg-[hsl(var(--card))]')}>
        {!collapsed && !isPlatform ? (
          <Link
            href="/settings"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-white/5 hover:text-foreground"
          >
            <Settings className="h-[18px] w-[18px]" />
            <span>{t('nav_settings')}</span>
          </Link>
        ) : null}

        <button
          onClick={() => {
            logout();
            window.location.href = '/login';
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-rose-500/10 hover:text-rose-400',
            collapsed && 'justify-center',
            isPlatform ? 'text-slate-500' : 'text-muted-foreground'
          )}
        >
          <LogOut className="h-[18px] w-[18px]" />
          {!collapsed ? <span>{t('auth_logout')}</span> : null}
        </button>

        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className={cn(
            'flex h-10 w-full items-center justify-center rounded-xl border transition-all hover:bg-white/5',
            isPlatform
              ? 'border-violet-500/10 text-slate-500 hover:text-slate-300'
              : 'border-border/40 text-muted-foreground hover:text-foreground'
          )}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
