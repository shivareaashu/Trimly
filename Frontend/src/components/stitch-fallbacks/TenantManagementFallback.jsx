'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Users,
  CalendarCheck,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function TenantsPage() {
  const token = useModuleStore((state) => state.token);
  const [search, setSearch] = useState('');
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const loadTenants = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/superadmin/tenants`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTenants(data.tenants || []);
      }
    } catch (err) {
      console.error('Error fetching tenants list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenants();
  }, [token]);

  const handleApprove = async (tenantId) => {
    try {
      const res = await fetch(`${API_BASE}/api/superadmin/approvals/${tenantId}/approve`, {
        method: 'POST',
        headers
      });
      if (res.ok) {
        loadTenants();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = tenants.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.slug.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyles = {
    ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    TRIAL: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    PAST_DUE: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400/80">
              Platform Management
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white font-display">
              Salon Tenants
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              All registered salon clients on the Trimly platform.
            </p>
          </div>

          {/* Search & Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadTenants}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-850 hover:bg-white/5 text-slate-400 transition"
              title="Refresh Tenants"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-650" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search salons..."
                className="rounded-xl border border-slate-800 bg-slate-900 pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-600 outline-none focus:border-violet-500/30 transition w-64"
              />
            </div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Salon</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Plan</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Staff</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Bookings</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Joined</th>
                  <th className="px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filtered.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/15">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{tenant.name}</p>
                          <p className="text-[10px] text-slate-500">{tenant.slug}.trimly.in</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${planColors[tenant.planName] || 'bg-slate-800 text-slate-300'}`}>
                        {tenant.planName}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${statusStyles[tenant.subscriptionStatus] || 'bg-slate-800 border-slate-700'}`}>
                        {tenant.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Users className="h-3.5 w-3.5" /> {tenant.usersCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-slate-400">
                        <CalendarCheck className="h-3.5 w-3.5" /> {tenant.bookingsCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[11px] text-slate-550">
                      {new Date(tenant.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {tenant.subscriptionStatus === 'TRIAL' && (
                          <button
                            onClick={() => handleApprove(tenant.id)}
                            className="flex items-center gap-1 rounded-lg bg-violet-600/15 border border-violet-500/25 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-violet-400 hover:bg-violet-600/25 transition"
                          >
                            <CheckCircle className="h-3 w-3" /> Approve Active
                          </button>
                        )}
                        <a
                          href={`http://${tenant.slug}.trimly.localhost:3000`}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-slate-350 transition-colors"
                          title="Open Salon Website"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Building2 className="mx-auto h-8 w-8 text-slate-700" />
              <p className="mt-2 text-sm text-slate-500">No registered salons match your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
