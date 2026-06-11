'use client';

import { useState } from 'react';
import {
  CreditCard,
  IndianRupee,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react';

export default function SubscriptionsPage() {
  // Mock data — in production, loaded from superadmin billing API
  const subscriptions = [
    { id: '1', salon: 'Luxe Salon & Spa', plan: 'Premium', amount: 4999, status: 'ACTIVE', renewsAt: '2026-07-01', paidAt: '2026-06-01' },
    { id: '2', salon: 'Urban Cuts Studio', plan: 'Starter', amount: 999, status: 'TRIAL', renewsAt: '2026-06-15', paidAt: null },
    { id: '3', salon: 'Golden Scissors', plan: 'Growth', amount: 2499, status: 'ACTIVE', renewsAt: '2026-07-01', paidAt: '2026-06-01' },
    { id: '4', salon: 'Bella Beauty Lounge', plan: 'Growth', amount: 2499, status: 'ACTIVE', renewsAt: '2026-07-01', paidAt: '2026-06-01' },
    { id: '5', salon: 'Royal Grooming Hub', plan: 'Starter', amount: 999, status: 'TRIAL', renewsAt: '2026-06-20', paidAt: null },
    { id: '6', salon: 'Bloom Beauty Studio', plan: 'Premium', amount: 4999, status: 'PAST_DUE', renewsAt: '2026-06-01', paidAt: '2026-05-01' },
    { id: '7', salon: 'Serenity Spa', plan: 'Growth', amount: 2499, status: 'CANCELED', renewsAt: null, paidAt: '2026-05-01' },
  ];

  const [filter, setFilter] = useState('ALL');

  const filtered = subscriptions.filter(
    (s) => filter === 'ALL' || s.status === filter
  );

  const totalMRR = subscriptions
    .filter((s) => s.status === 'ACTIVE')
    .reduce((sum, s) => sum + s.amount, 0);
  const activeCount = subscriptions.filter((s) => s.status === 'ACTIVE').length;
  const trialCount = subscriptions.filter((s) => s.status === 'TRIAL').length;
  const pastDueCount = subscriptions.filter((s) => s.status === 'PAST_DUE').length;

  const statusStyles = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    TRIAL: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    PAST_DUE: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    CANCELED: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  const planColors = {
    Starter: 'bg-slate-800 text-slate-300',
    Growth: 'bg-blue-500/15 text-blue-400',
    Premium: 'bg-amber-500/15 text-amber-400',
  };

  return (
    <main className="min-h-screen px-6 py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400/80">
              Revenue Operations
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
              Subscription Management
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Monitor subscription lifecycle, MRR, trial conversions, and billing health.
            </p>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Monthly Recurring Revenue', value: `₹${totalMRR.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Active Subscriptions', value: activeCount, icon: CheckCircle, color: 'text-emerald-400 bg-emerald-500/10' },
            { label: 'Active Trials', value: trialCount, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
            { label: 'Past Due', value: pastDueCount, icon: AlertTriangle, color: 'text-amber-400 bg-amber-500/10' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2">
          {['ALL', 'ACTIVE', 'TRIAL', 'PAST_DUE', 'CANCELED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'
              }`}
            >
              {f.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Subscription Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Salon</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Plan</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Amount</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Renews</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Last Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-white">{sub.salon}</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${planColors[sub.plan]}`}>
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">₹{sub.amount.toLocaleString('en-IN')}/mo</td>
                    <td className="px-6 py-4">
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${statusStyles[sub.status]}`}>
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500">
                      {sub.renewsAt
                        ? new Date(sub.renewsAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-500">
                      {sub.paidAt
                        ? new Date(sub.paidAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
