'use client';

import React, { useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import Link from 'next/link';

export function DemoToast({ message, detail, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900/90 text-white rounded-[24px] shadow-2xl border border-primary/20 backdrop-blur-xl p-5 animate-slide-up duration-300">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-primary/20 text-primary rounded-xl shrink-0">
          <Sparkles className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm tracking-wide text-foreground">{message}</h4>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            {detail}
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex items-center justify-center px-4 py-2 bg-primary text-black font-bold rounded-xl text-[10px] uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
