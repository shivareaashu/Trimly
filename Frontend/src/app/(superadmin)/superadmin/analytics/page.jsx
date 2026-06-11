'use client';

import {
  BarChart2,
  TrendingUp,
  Users,
  IndianRupee,
  Building2,
  CalendarCheck,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export default function PlatformAnalyticsPage() {
  // Mock data — in production, loaded from superadmin analytics API
  const monthlyData = [
    { month: 'Jan', revenue: 45000, tenants: 6, appointments: 580 },
    { month: 'Feb', revenue: 52000, tenants: 7, appointments: 650 },
    { month: 'Mar', revenue: 58000, tenants: 8, appointments: 720 },
    { month: 'Apr', revenue: 64000, tenants: 9, appointments: 880 },
    { month: 'May', revenue: 76000, tenants: 10, appointments: 1050 },
    { month: 'Jun', revenue: 84500, tenants: 12, appointments: 1283 },
  ];

  const maxRevenue = Math.max(...monthlyData.map((d) => d.revenue));

  const planDistribution = [
    { plan: 'Starter', count: 4, color: 'bg-slate-500', pct: 33 },
    { plan: 'Growth', count: 5, color: 'bg-blue-500', pct: 42 },
    { plan: 'Premium', count: 3, color: 'bg-amber-500', pct: 25 },
  ];

  const topSalons = [
    { name: 'Luxe Salon & Spa', revenue: 38500, appointments: 245 },
    { name: 'Golden Scissors', revenue: 28200, appointments: 198 },
    { name: 'Bella Beauty Lounge', revenue: 22800, appointments: 175 },
    { name: 'Urban Cuts Studio', revenue: 15600, appointments: 132 },
    { name: 'Bloom Beauty Studio', revenue: 12400, appointments: 98 },
  ];

  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const revenueGrowth = (((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100).toFixed(1);

  return (
    <main className="min-h-screen px-6 py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400/80">
            Business Intelligence
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Platform Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Track platform growth, revenue trends, and salon performance across the Trimly ecosystem.
          </p>
        </div>

        {/* Summary Metrics */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: 'Revenue Growth',
              value: `${revenueGrowth}%`,
              icon: TrendingUp,
              color: 'text-emerald-400 bg-emerald-500/10',
              trend: Number(revenueGrowth) >= 0 ? 'up' : 'down',
            },
            {
              label: 'Total Salons',
              value: currentMonth.tenants,
              icon: Building2,
              color: 'text-violet-400 bg-violet-500/10',
              trend: 'up',
            },
            {
              label: 'Monthly Revenue',
              value: `₹${currentMonth.revenue.toLocaleString('en-IN')}`,
              icon: IndianRupee,
              color: 'text-emerald-400 bg-emerald-500/10',
              trend: 'up',
            },
            {
              label: 'Appointments',
              value: currentMonth.appointments.toLocaleString(),
              icon: CalendarCheck,
              color: 'text-blue-400 bg-blue-500/10',
              trend: 'up',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500">{stat.label}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-rose-400" />
                      )}
                    </div>
                  </div>
                  <div className={`rounded-lg p-2 ${stat.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          {/* Revenue Trend Chart (bar visualization) */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
            <div className="border-b border-slate-800 px-6 py-4">
              <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                <BarChart2 className="h-5 w-5 text-violet-400" /> Monthly Revenue Trend
              </h3>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-end gap-3 h-48">
                {monthlyData.map((d) => (
                  <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500">
                      ₹{(d.revenue / 1000).toFixed(0)}K
                    </span>
                    <div
                      className="w-full rounded-t-lg bg-gradient-to-t from-violet-600/40 to-violet-500/80 transition-all duration-500"
                      style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Plan Distribution + Top Salons */}
          <div className="space-y-6">
            {/* Plan Distribution */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="text-base font-semibold text-white">Plan Distribution</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                {/* Stacked bar */}
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  {planDistribution.map((p) => (
                    <div
                      key={p.plan}
                      className={`${p.color} h-full transition-all`}
                      style={{ width: `${p.pct}%` }}
                      title={`${p.plan}: ${p.count}`}
                    />
                  ))}
                </div>
                <div className="flex justify-between">
                  {planDistribution.map((p) => (
                    <div key={p.plan} className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${p.color}`} />
                      <span className="text-[10px] text-slate-500">
                        {p.plan} ({p.count})
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Performing Salons */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              <div className="border-b border-slate-800 px-6 py-4">
                <h3 className="flex items-center gap-2 text-base font-semibold text-white">
                  <TrendingUp className="h-5 w-5 text-violet-400" /> Top Salons
                </h3>
              </div>
              <div className="divide-y divide-slate-800/60">
                {topSalons.map((salon, i) => (
                  <div key={salon.name} className="flex items-center justify-between px-6 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-[10px] font-bold text-violet-400">
                        {i + 1}
                      </span>
                      <span className="text-sm font-medium text-white">{salon.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-400">
                      ₹{salon.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
