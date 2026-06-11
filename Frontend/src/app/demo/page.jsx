'use client';

import React from 'react';
import { ArrowRight, LayoutDashboard, Calendar, Users, Globe, Package, Truck, Wallet, Receipt, TrendingUp, ShieldAlert, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function DemoLandingPage() {
  const modules = [
    {
      title: 'Operational Dashboard',
      description: 'Real-time daily salon revenue, active stylist stats, appointments status, and automatic stock alerts.',
      icon: LayoutDashboard,
      href: '/demo/dashboard',
      color: 'from-violet-500 to-indigo-500',
      badge: 'Core'
    },
    {
      title: 'Appointments Calendar',
      description: 'Visual time-grid scheduling. Manage booking slots, allocate stylists, and test out drag-and-drop mechanics.',
      icon: Calendar,
      href: '/demo/calendar',
      color: 'from-teal-500 to-emerald-500',
      badge: 'Interactions'
    },
    {
      title: 'Client Management (CRM)',
      description: 'Review loyalty points, complete visit history timeline, custom notes, preferences, and sales ledger for every customer.',
      icon: Users,
      href: '/demo/customers',
      color: 'from-pink-500 to-rose-500',
      badge: 'Audience'
    },
    {
      title: 'Interactive Website Builder',
      description: 'Salon web builder with theme presets, SEO headers, section re-ordering, and responsive preview widget.',
      icon: Globe,
      href: '/demo/website-builder',
      color: 'from-cyan-500 to-blue-500',
      badge: 'Website Engine'
    },
    {
      title: 'Inventory & Stock Alerts',
      description: 'Inventory levels tracking, reorder limits, expiration alerts, SKU logs, and supplier links.',
      icon: Package,
      href: '/demo/inventory',
      color: 'from-amber-500 to-orange-500',
      badge: 'Supply Chain'
    },
    {
      title: 'Suppliers & Directory',
      description: 'Store contact logs, active purchase orders count, lead times, and outstanding procurement balances.',
      icon: Truck,
      href: '/demo/suppliers',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Procurement'
    },
    {
      title: 'Purchase Orders log',
      description: 'Create and dispatch purchase orders, manage draft workflows, and record confirmed supply intake.',
      icon: FileText,
      href: '/demo/purchase-orders',
      color: 'from-indigo-500 to-violet-500',
      badge: 'Logistics'
    },
    {
      title: 'Staff Payroll Ledger',
      description: 'Calculate salary, salon commissions, bonus allocations, payroll adjustments, and approve disbursements.',
      icon: Wallet,
      href: '/demo/payroll',
      color: 'from-purple-500 to-pink-500',
      badge: 'Operations'
    },
    {
      title: 'Expenses Tracker',
      description: 'Monitor utility expenses, rents, marketing budgets, and stock procurement logs with categorical distributions.',
      icon: Receipt,
      href: '/demo/expenses',
      color: 'from-rose-500 to-red-500',
      badge: 'Finance'
    },
    {
      title: 'Profit & Loss (P&L)',
      description: 'Executive-level financial reporting, profit margins, average ticket size, and monthly business summaries.',
      icon: TrendingUp,
      href: '/demo/finance',
      color: 'from-emerald-400 to-teal-600',
      badge: 'Analytics'
    },
    {
      title: 'SuperAdmin Platform',
      description: 'Multi-location franchise tracking, subscriptions, MRR logs, approval workflows, and tenant management.',
      icon: ShieldAlert,
      href: '/demo/platform',
      color: 'from-violet-600 to-fuchsia-600',
      badge: 'Enterprise'
    }
  ];

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      
      {/* Hero Welcome */}
      <div className="text-center space-y-4 py-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-semibold tracking-wider uppercase mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          Interactive Tour
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-white tracking-tight">
          Welcome to <span className="text-primary bg-clip-text">Trimly OS</span>
        </h1>
        <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed font-sans">
          Select any operational module below to experience the salon management dashboard. Test schedules, website designs, supply chain flows, and financial logs.
        </p>
      </div>

      {/* Grid of Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div
              key={idx}
              className="group relative bg-slate-900/50 border border-slate-800 hover:border-slate-700 rounded-[28px] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${m.color} text-slate-950 shrink-0`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 bg-slate-800/80 px-2.5 py-1 rounded-full">
                    {m.badge}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-base text-white tracking-wide">{m.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">{m.description}</p>
                </div>
              </div>
              <div className="pt-6">
                <Link
                  href={m.href}
                  className="inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:text-primary/80 transition-colors uppercase tracking-wider"
                >
                  Explore Screen <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Inline fallback definition for FileText which was used in modules but not imported
const FileText = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M10 9H8" />
    <path d="M16 13H8" />
    <path d="M16 17H8" />
  </svg>
);
