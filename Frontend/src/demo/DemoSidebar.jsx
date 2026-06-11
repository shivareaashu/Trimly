'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, Settings, Sparkles } from 'lucide-react';
import { DEMO_NAVIGATION } from './demoNavigation';
import { cn } from '@/lib/utils';

export function DemoSidebar({ collapsed = false, onCollapsedChange }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out flex-shrink-0 bg-slate-950 border-slate-800 text-slate-100',
        collapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Brand & Salon Info */}
      <div className="flex h-16 items-center border-b border-slate-800 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          {!collapsed ? (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-white font-display">
                Trimly Demo
              </h1>
              <p className="truncate text-[10px] text-slate-400">
                Lumière Atelier Mumbai
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {DEMO_NAVIGATION.map((section) => (
          <div key={section.title}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-slate-500">
                {section.title}
              </p>
            ) : null}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      collapsed && 'justify-center',
                      active
                        ? 'bg-primary/20 text-primary shadow-sm shadow-primary/5'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                        active
                          ? 'text-primary'
                          : 'text-slate-400 group-hover:text-white'
                      )}
                    />
                    {!collapsed ? <span>{item.label}</span> : null}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div className="border-t border-slate-800 p-3 space-y-2">
        {!collapsed ? (
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center space-y-2 mb-2">
            <p className="text-[10px] text-slate-400 leading-normal">
              Experience the full power of Trimly with your own business data.
            </p>
            <Link
              href="/register"
              className="block w-full py-2 bg-primary text-black font-bold rounded-lg text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all text-center"
            >
              Start Free Trial
            </Link>
          </div>
        ) : (
          <Link
            href="/register"
            className="flex items-center justify-center rounded-xl p-2 bg-primary text-black hover:opacity-90 transition-all mb-2"
            title="Start Free Trial"
          >
            <Sparkles className="h-4.5 w-4.5" />
          </Link>
        )}

        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl border border-slate-800 py-2 transition-all hover:bg-slate-900 text-slate-400 hover:text-white"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
