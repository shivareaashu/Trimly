'use client';
 
import React, { useState, useEffect } from 'react';
import { DemoSidebar } from './DemoSidebar';
import { Sparkles, AlertCircle, ArrowRight, UserCircle, Bell, Globe, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
 
export function DemoLayout({ children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const pathname = usePathname();
 
  useEffect(() => {
    setMounted(true);
  }, []);
 
  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [pathname]);
 
  if (!mounted) {
    return (
      <div className="flex min-h-screen bg-[#F8F5F1] text-[#1A1A1A]">
        <div className="flex-1 flex items-center justify-center">
          <Sparkles className="h-8 w-8 animate-spin text-[#B58A2A]" />
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
    <div className="flex min-h-screen bg-[#F8F5F1] text-[#1A1A1A] selection:bg-[#E8DCC5] selection:text-[#1A1A1A] overflow-hidden font-sans">
      
      {/* Demo Sidebar (Desktop) */}
      <DemoSidebar 
        collapsed={collapsed} 
        onCollapsedChange={setCollapsed} 
        className="hidden lg:flex" 
      />
 
      {/* Mobile Sidebar Backdrop & Overlay Drawer */}
      <div 
        className={cn(
          "fixed inset-0 z-50 lg:hidden transition-all duration-350",
          isMobileSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
      >
        {/* Backdrop */}
        <div 
          className={cn(
            "absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300",
            isMobileSidebarOpen ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        {/* Drawer content */}
        <div 
          className={cn(
            "absolute inset-y-0 left-0 w-[260px] bg-white shadow-2xl transition-transform duration-300 ease-out transform",
            isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <DemoSidebar 
            collapsed={false} 
            onCollapsedChange={() => {}} 
            className="h-full border-r-0"
            showCloseButton={true}
            onCloseClick={() => setIsMobileSidebarOpen(false)}
            onLinkClick={() => setIsMobileSidebarOpen(false)}
          />
        </div>
      </div>
 
      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden relative">
        
        {/* Warning Banner at the top */}
        <div className="bg-[#B58A2A] text-white px-4 py-2.5 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs font-semibold tracking-wide shadow-md z-30">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 animate-bounce" />
            <span>Trimly Demo Environment — changes are not saved to the database.</span>
          </div>
          <Link
            href="/register"
            className="flex items-center gap-1 bg-white text-[#1A1A1A] hover:bg-stone-50 transition-colors px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider"
          >
            Start Free Trial <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
 
        {/* Demo Header */}
        <header className="h-16 flex items-center justify-between border-b border-[#E8DCC5]/40 px-4 sm:px-6 backdrop-blur-md bg-white/80 sticky top-0 z-20">
          <div className="flex items-center gap-2.5">
            <button 
              className="lg:hidden p-1.5 rounded-xl hover:bg-[#F8F5F1] text-stone-600 hover:text-black focus:outline-none transition-colors"
              onClick={() => setIsMobileSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="text-sm sm:text-lg font-bold font-sans text-[#1A1A1A] tracking-wide truncate">
              {getHeaderTitle()}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs text-stone-500 bg-white border border-[#E8DCC5]/50 px-3 py-1.5 rounded-xl">
              <Globe className="h-3.5 w-3.5 text-[#B58A2A]" />
              <span>Multi-Branch Active</span>
            </div>
            
            <div className="flex items-center gap-2.5 bg-white border border-[#E8DCC5]/50 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-2xl">
              <UserCircle className="h-5 w-5 text-stone-400 shrink-0" />
              <div className="leading-tight">
                <p className="text-[10px] sm:text-xs font-bold text-[#1A1A1A] truncate max-w-[80px] sm:max-w-none">Aanya Kapoor</p>
                <p className="text-[8px] sm:text-[9px] text-stone-400 font-semibold">Salon Partner</p>
              </div>
            </div>
          </div>
        </header>
 
        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-[#F8F5F1]">
          {children}
        </main>
      </div>
    </div>
  );
}
 
export default DemoLayout;
