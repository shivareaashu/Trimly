'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Users,
  IndianRupee,
  TrendingUp,
  ShieldCheck,
  CreditCard,
  Activity,
  Globe,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function SuperAdminDashboard() {
  const token = useModuleStore((state) => state.token);
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    trialTenants: 0,
    canceledTenants: 0,
    totalBookings: 0,
    totalRevenue: 0,
    usersCount: 0,
    systemHealth: 'HEALTHY'
  });
  const [tenants, setTenants] = useState([]);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [statsRes, tenantsRes] = await Promise.all([
        fetch(`${API_BASE}/api/superadmin/stats`, { headers }),
        fetch(`${API_BASE}/api/superadmin/tenants`, { headers })
      ]);

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
      }
      if (tenantsRes.ok) {
        const tenantsData = await tenantsRes.json();
        setTenants(tenantsData.tenants || []);
      }
    } catch (err) {
      console.error('Error loading superadmin details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const handleApprove = async (tenantId) => {
    try {
      const res = await fetch(`${API_BASE}/api/superadmin/approvals/${tenantId}/approve`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const statusColors = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    TRIAL: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    PENDING: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    CANCELED: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  const planColors = {
    Starter: 'bg-slate-800 text-slate-300',
    Growth: 'bg-blue-500/15 text-blue-400',
    Premium: 'bg-amber-500/15 text-amber-400',
  };

  const pendingApprovalsCount = tenants.filter(t => t.subscriptionStatus === 'TRIAL' || t.subscriptionStatus === 'PENDING').length;

  return (
    <main className="min-h-screen px-6 py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400/80">
              Super Administrator
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-display">
              Platform Command Center
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Monitor all registered salons, subscriptions, and platform health metrics.
            </p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/5 px-4 py-2.5 text-xs font-medium text-violet-400 transition-all hover:bg-violet-500/10 disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
          </button>
        </div>

        {/* Key Platform Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Total Salons',
              value: stats.totalTenants,
              hint: `${stats.activeTenants} active, ${stats.trialTenants} trial`,
              icon: Building2,
              color: 'text-violet-400 bg-violet-500/10',
            },
            {
              label: 'Platform Revenue',
              value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`,
              hint: 'Platform payments sum',
              icon: IndianRupee,
              color: 'text-emerald-400 bg-emerald-500/10',
            },
            {
              label: 'Pending Reviews',
              value: pendingApprovalsCount,
              hint: 'Onboarding reviews required',
              icon: ShieldCheck,
              color: 'text-amber-400 bg-amber-500/10',
            },
            {
              label: 'Active Subscriptions',
              value: stats.activeTenants,
              hint: `${stats.usersCount} total platform users`,
              icon: CreditCard,
              color: 'text-blue-400 bg-blue-500/10',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">
                      {stat.label}
                    </p>
                    <p className="text-3xl font-bold tracking-tight text-white font-display">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-2.5 ${stat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">{stat.hint}</p>
              </div>
            );
          })}
        </div>

        {/* Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Recent Salon Signups */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <Activity className="h-5 w-5 text-violet-400" /> Recent Registrations
              </h3>
              <a
                href="/superadmin/tenants"
                className="text-[10px] font-bold uppercase tracking-widest text-violet-400 hover:text-violet-300 transition-colors"
              >
                View All →
              </a>
            </div>
            <div className="divide-y divide-slate-800/60">
              {tenants.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-6 text-center">No tenants registered yet.</p>
              ) : (
                tenants.slice(0, 5).map((salon) => (
                  <div key={salon.id} className="flex items-center justify-between px-6 py-4 hover:bg-white/[0.01] transition-colors">
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-white">{salon.name}</p>
                      <p className="text-[11px] text-slate-500">
                        Registered {new Date(salon.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${planColors[salon.planName] || 'bg-slate-800 text-slate-300'}`}>
                        {salon.planName}
                      </span>
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${statusColors[salon.subscriptionStatus] || 'bg-slate-800 border-slate-700'}`}>
                        {salon.subscriptionStatus}
                      </span>
                      {salon.subscriptionStatus === 'TRIAL' && (
                        <button
                          onClick={() => handleApprove(salon.id)}
                          className="rounded-lg bg-violet-600 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-white hover:bg-violet-700 transition"
                        >
                          Approve Active
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Platform Health & Quick Actions */}
          <div className="space-y-6">
            {/* Health Indicators */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                  <Globe className="h-5 w-5 text-violet-400" /> Platform Health
                </h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                {[
                  { label: 'Database', status: 'Operational', ok: true },
                  { label: 'Payment Gateway', status: 'Connected', ok: true },
                  { label: 'Email Service', status: 'Mock Console Logger', ok: true },
                  { label: 'WhatsApp API', status: 'Connected', ok: true },
                ].map((health) => (
                  <div key={health.label} className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{health.label}</span>
                    <span className={`flex items-center gap-1.5 text-[11px] font-semibold ${health.ok ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {health.ok ? (
                        <CheckCircle className="h-3.5 w-3.5" />
                      ) : (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      )}
                      {health.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pending Approval Actions */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                  <ShieldCheck className="h-5 w-5 text-violet-400" /> Pending Actions
                </h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {pendingApprovalsCount > 0 ? (
                  <>
                    <p className="text-xs text-slate-500">
                      <strong className="text-amber-400">{pendingApprovalsCount}</strong> salon registrations require active status review.
                    </p>
                    <a
                      href="/superadmin/tenants"
                      className="inline-flex items-center gap-2 rounded-xl bg-violet-500/15 px-4 py-2.5 text-xs font-semibold text-violet-400 transition-all hover:bg-violet-500/25"
                    >
                      <ShieldCheck className="h-4 w-4" />
                      Review Tenants List
                    </a>
                  </>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    All registrations are processed. No pending actions.
                  </p>
                )}
              </div>
            </div>

            {/* Quick Stats Bar */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                    Total Bookings Logged
                  </p>
                  <p className="text-2xl font-bold text-white font-display">
                    {stats.totalBookings.toLocaleString()}
                  </p>
                  <p className="text-[10px] text-slate-500">Platform-wide historical bookings count</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
