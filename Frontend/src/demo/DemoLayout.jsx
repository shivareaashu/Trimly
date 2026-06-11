'use client';

import React, { useState, useEffect } from 'react';
import { DemoSidebar } from './DemoSidebar';
import { Sparkles, AlertCircle, ArrowRight, UserCircle, Bell, Globe } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function DemoLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-slate-950 text-slate-100">
        <div className="flex-1 flex items-center justify-center">
          <Sparkles className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Determine header title from pathname
  const getHeaderTitle = () => {
    const segments = pathname.split('/');
    const last = segments[segments.length - 1];
    if (last === 'demo') return 'Demo Overview';
    return last.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 selection:bg-primary selection:text-slate-950 overflow-hidden font-sans">
      
      {/* Demo Sidebar */}
      <DemoSidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        
        {/* Warning Banner at the top */}
        <div className="bg-gradient-to-r from-primary/90 to-amber-500/90 text-slate-950 px-4 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-semibold tracking-wide shadow-md z-50">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 animate-bounce" />
            <span>Trimly Demo Environment — changes are not saved to the database.</span>
          </div>
          <Link
            href="/register"
            className="flex items-center gap-1 bg-slate-950 text-white hover:bg-slate-900 transition-colors px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
          >
            Start Free Trial <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {/* Demo Header */}
        <header className="h-16 flex items-center justify-between border-b border-slate-800 px-6 backdrop-blur-xl bg-slate-950/80 sticky top-0 z-40">
          <div>
            <h2 className="text-lg font-bold font-display text-white tracking-wide">
              {getHeaderTitle()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              <Globe className="h-3.5 w-3.5 text-primary" />
              <span>Multi-Branch Active</span>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 px-3.5 py-1.5 rounded-2xl">
              <UserCircle className="h-5 w-5 text-slate-400" />
              <div className="leading-tight">
                <p className="text-xs font-bold text-white">Aanya Kapoor</p>
                <p className="text-[9px] text-slate-500 font-semibold">Salon Partner</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 bg-slate-950/50">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DemoLayout;
