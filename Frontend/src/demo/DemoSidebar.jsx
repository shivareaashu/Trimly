'use client';
 
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LogOut, Settings, Sparkles, X } from 'lucide-react';
import { DEMO_NAVIGATION } from './demoNavigation';
import { cn } from '@/lib/utils';
 
export function DemoSidebar({ 
  collapsed = false, 
  onCollapsedChange, 
  className, 
  onLinkClick, 
  showCloseButton = false, 
  onCloseClick 
}) {
  const pathname = usePathname();
 
  return (
    <aside
      className={cn(
        'sticky top-0 z-40 flex h-screen flex-col border-r transition-all duration-300 ease-in-out flex-shrink-0 bg-white border-[#E8DCC5]/40 text-[#1A1A1A]',
        collapsed ? 'w-[68px]' : 'w-[260px]',
        className
      )}
    >
      {/* Brand & Salon Info */}
      <div className="flex h-16 items-center justify-between border-b border-[#E8DCC5]/40 px-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#E8DCC5]/40 text-[#B58A2A]">
            <Sparkles className="h-4.5 w-4.5" />
          </div>
          {!collapsed ? (
            <div className="overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-[#1A1A1A] font-sans">
                Trimly Demo
              </h1>
              <p className="truncate text-[10px] text-stone-500">
                Lumière Atelier Mumbai
              </p>
            </div>
          ) : null}
        </div>
        {showCloseButton && (
          <button 
            onClick={onCloseClick}
            className="lg:hidden p-1 rounded-lg hover:bg-[#F8F5F1] text-stone-400 hover:text-black focus:outline-none transition-colors"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
 
      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-hide">
        {DEMO_NAVIGATION.map((section) => (
          <div key={section.title}>
            {!collapsed ? (
              <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.25em] text-stone-400">
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
                    onClick={onLinkClick}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      collapsed && 'justify-center',
                      active
                        ? 'bg-[#E8DCC5]/45 text-[#8A6A1F] shadow-xs'
                        : 'text-stone-500 hover:bg-[#F8F5F1] hover:text-[#1A1A1A]'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] flex-shrink-0 transition-colors',
                        active
                          ? 'text-[#B58A2A]'
                          : 'text-stone-400 group-hover:text-[#1A1A1A]'
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
      <div className="border-t border-[#E8DCC5]/40 p-3 space-y-2">
        {!collapsed ? (
          <div className="bg-[#F8F5F1] border border-[#E8DCC5]/50 p-3 rounded-xl text-center space-y-2 mb-2">
            <p className="text-[10px] text-stone-550 leading-normal">
              Experience the full power of Trimly with your own business data.
            </p>
            <Link
              href="/register"
              onClick={onLinkClick}
              className="block w-full py-2.5 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white font-bold rounded-lg text-[10px] uppercase tracking-wider hover:opacity-95 active:scale-95 transition-all text-center"
            >
              Start Free Trial
            </Link>
          </div>
        ) : (
          <Link
            href="/register"
            onClick={onLinkClick}
            className="flex items-center justify-center rounded-xl p-2 bg-[#B58A2A] hover:bg-[#8A6A1F] text-white hover:opacity-95 transition-all mb-2"
            title="Start Free Trial"
          >
            <Sparkles className="h-4.5 w-4.5" />
          </Link>
        )}
 
        <button
          onClick={() => onCollapsedChange?.(!collapsed)}
          className="flex w-full items-center justify-center rounded-xl border border-[#E8DCC5]/50 py-2 transition-all hover:bg-[#F8F5F1] text-stone-500 hover:text-[#1A1A1A]"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
}
