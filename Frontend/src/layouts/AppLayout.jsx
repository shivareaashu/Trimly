'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Header } from '@/components/shell/Header';
import { Sidebar } from '@/components/shell/Sidebar';
import { Footer } from '@/components/shell/Footer';
import { usePermissions } from '@/hooks/usePermissions';
import { useModules } from '@/hooks/useModules';
import { NAVIGATION } from '@/config/navigation.config';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import CommandPalette from '@/components/shell/CommandPalette';

export default function AppLayout({ children, scope = 'admin', variant = 'admin' }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const { hasModule } = useModules();

  // Defer checks until client hydration has completed
  if (!mounted) {
    return (
      <div className={cn('flex min-h-screen overflow-hidden', variant === 'superadmin' ? 'dark bg-slate-950 text-slate-100' : 'light-theme bg-background text-foreground')}>
        <Sidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          scope={scope}
          variant={variant}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <Header variant={variant} />
          <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#fbf9f9]">
            <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // Route security validation
  let hasAccess = true;
  let requiredModuleName = '';
  let requiredPermissionName = '';

  // Flatten registry items to match pathname
  const allNavItems = NAVIGATION.flatMap(section => section.items);
  const matchedItem = allNavItems.find(item => item.href === pathname);

  if (matchedItem) {
    const moduleOk = hasModule(matchedItem.module);
    const permissionOk = hasPermission(matchedItem.permission);
    
    if (!moduleOk || !permissionOk) {
      hasAccess = false;
      requiredModuleName = matchedItem.module || '';
      requiredPermissionName = matchedItem.permission || '';
    }
  }

  if (!hasAccess) {
    return (
      <div className={cn('flex min-h-screen overflow-hidden', variant === 'superadmin' ? 'dark bg-slate-950 text-slate-100' : 'light-theme bg-background text-foreground')}>
        <Sidebar
          collapsed={collapsed}
          onCollapsedChange={setCollapsed}
          scope={scope}
          variant={variant}
        />
        <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
          <Header variant={variant} />
          <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#fbf9f9]">
            <div className="max-w-md w-full p-8 bg-white border border-border/40 rounded-[32px] shadow-xl space-y-6">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-500">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-bold tracking-tight text-foreground font-display">Access Restricted</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your current subscription or role profile does not grant access to this page.
                </p>
                {requiredModuleName && (
                  <p className="text-xs text-muted-foreground bg-primary/5 p-2.5 rounded-lg border border-primary/10 mt-3 font-medium">
                    Requires active module <span className="font-bold text-primary font-mono">{requiredModuleName}</span> and permission <span className="font-bold text-primary font-mono">{requiredPermissionName}</span>
                  </p>
                )}
              </div>
              <button
                onClick={() => window.location.assign('/dashboard')}
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl text-xs shadow-md hover:opacity-90 active:scale-95 transition-all uppercase tracking-wider"
              >
                Return to Dashboard
              </button>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex min-h-screen overflow-hidden', variant === 'superadmin' ? 'dark bg-slate-950 text-slate-100' : 'light-theme bg-background text-foreground')}>
      <Sidebar
        collapsed={collapsed}
        onCollapsedChange={setCollapsed}
        scope={scope}
        variant={variant}
      />
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        <Header variant={variant} />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
      <CommandPalette />
    </div>
  );
}
