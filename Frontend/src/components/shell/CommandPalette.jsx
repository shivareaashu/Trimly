'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Users, CalendarCheck, ClipboardList, Activity, 
  Receipt, UserCheck, ShieldAlert, ArrowRight, X, LayoutDashboard
} from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function CommandPalette() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  const quickLinks = [
    { label: 'Go to Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Open Live Salon Floor', href: '/reception/floor', icon: Activity },
    { label: 'Register Walk-In Customer', href: '/reception', icon: ClipboardList },
    { label: 'Manage Appointments', href: '/appointments', icon: CalendarCheck },
    { label: 'View Customer CRM', href: '/customers', icon: Users },
    { label: 'Open Revisit Intelligence Center', href: '/revisit-center', icon: UserCheck },
    { label: 'View POS Billing Queue', href: '/billing-queue', icon: Receipt },
  ];

  // Global key event listener for Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Search effect
  useEffect(() => {
    if (!query.trim() || !isOpen) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setLoading(true);
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
          'x-tenant-id': activeTenant?.id,
        };
        const res = await fetch(`${API_BASE}/api/customers?search=${encodeURIComponent(query)}`, { headers });
        if (res.ok) {
          const data = await res.json();
          setResults(data.customers || []);
        }
      } catch (err) {
        console.error('Command Palette Search Error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, isOpen, token, activeTenant?.id]);

  const handleSelectLink = (href) => {
    setIsOpen(false);
    setQuery('');
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/60 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-border/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Search Bar */}
        <div className="relative flex items-center border-b border-border/40 p-4">
          <Search className="h-5 w-5 text-stone-400 mr-3" />
          <input
            type="text"
            placeholder="Search customers or type commands (e.g. 'reception')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-white placeholder-stone-500 outline-none"
            autoFocus
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-white/5 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Results Area */}
        <div className="max-h-80 overflow-y-auto p-2.5 space-y-4">
          {/* Dynamic Search Results */}
          {query.trim() && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-primary px-3">
                Customer Directory
              </h4>
              {loading ? (
                <div className="py-6 text-center text-xs text-muted-foreground">Searching clients...</div>
              ) : results.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">No matches found.</div>
              ) : (
                results.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectLink(`/customers`)} // Goes to customers page to manage selected customer
                    className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs text-stone-300 hover:text-white hover:bg-white/5 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {c.firstName.charAt(0)}{c.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold">{c.firstName} {c.lastName}</p>
                        <p className="text-[10px] text-stone-500 mt-0.5">{c.phone || c.email || 'No contact info'}</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 text-stone-400 transition" />
                  </button>
                ))
              )}
            </div>
          )}

          {/* Quick Links / Commands */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3">
              Quick Actions & Routes
            </h4>
            <div className="grid gap-1">
              {quickLinks
                .filter((link) => 
                  !query.trim() || link.label.toLowerCase().includes(query.toLowerCase())
                )
                .map((link, idx) => {
                  const Icon = link.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectLink(link.href)}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl text-left text-xs text-stone-300 hover:text-white hover:bg-white/5 transition group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-stone-400 group-hover:text-primary transition" />
                        <span>{link.label}</span>
                      </div>
                      <span className="text-[10px] text-stone-600 font-mono group-hover:text-stone-400 transition">Enter ↵</span>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="bg-white/3 border-t border-border/40 px-4 py-2.5 flex items-center justify-between text-[10px] text-stone-500">
          <span>Use <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[9px]">Esc</kbd> to close</span>
          <span>Press <kbd className="bg-white/10 px-1.5 py-0.5 rounded font-mono text-[9px]">Ctrl+K</kbd> anywhere</span>
        </div>
      </div>
    </div>
  );
}
