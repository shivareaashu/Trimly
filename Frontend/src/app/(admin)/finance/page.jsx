'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Landmark, Wallet, Percent, Calendar, RefreshCw, BarChart2 } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '../../../store/moduleStore';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  PageHeader,
  Button,
  StatCard,
} from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function FinancePage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  const [summary, setSummary] = useState(null);
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadFinancials = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/finance/summary?startDate=${startDate}&endDate=${endDate}`, { headers });
      const data = await res.json();
      setSummary(data.summary || null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinancials();
  }, [activeTenant?.id, token, startDate, endDate]);

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Financial Management"
          title={t('profit_loss_terminal')}
          description="Consolidate gross revenues, staff payroll bills, operational overheads, and net margins."
        >
          <Button variant="outline" size="sm" onClick={loadFinancials} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh Audit
          </Button>
        </PageHeader>

        {/* Date Filter Card */}
        <Card className="border-border/70 bg-card/60">
          <CardBody className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
              />
            </div>

            <div className="flex-1 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/80 flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-900 border border-border rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:border-primary/50 transition"
              />
            </div>
          </CardBody>
        </Card>

        {/* Primary Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label={t('gross_collections')}
            value={formatCurrency(summary?.metrics?.grossRevenue)}
            hint="Total paid bookings/services"
            icon={Landmark}
            tone="default"
          />
          <StatCard
            label={t('total_expenses')}
            value={formatCurrency(summary?.metrics?.totalExpenses)}
            hint="Overheads + Staff salaries"
            icon={Wallet}
            tone="default"
          />
          <StatCard
            label={t('net_operating_profit')}
            value={formatCurrency(summary?.metrics?.netProfit)}
            hint="Gross Collections less Expenses"
            icon={DollarSign}
            tone={Number(summary?.metrics?.netProfit || 0) >= 0 ? 'success' : 'danger'}
          />
          <StatCard
            label={t('operating_margin_pct')}
            value={`${summary?.metrics?.profitMarginPct ?? 0}%`}
            hint="Return percentage on revenue"
            icon={Percent}
            tone={Number(summary?.metrics?.profitMarginPct || 0) >= 0 ? 'success' : 'danger'}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Operating Outlay Breakdown */}
          <Card>
            <CardHeader className="border-b border-border/60 bg-white/3">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-primary" /> Cost Category Allocation
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="bg-background/40 border border-border p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Staff Salaries</span>
                  <span className="text-xl font-bold text-white mt-1 block font-display">
                    {formatCurrency(summary?.metrics?.staffSalaryExpenses)}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {summary?.metrics?.totalExpenses > 0 
                      ? `${((summary.metrics.staffSalaryExpenses / summary.metrics.totalExpenses) * 100).toFixed(0)}% of expenses`
                      : '0%'}
                  </span>
                </div>

                <div className="bg-background/40 border border-border p-4 rounded-2xl">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Operating Overheads</span>
                  <span className="text-xl font-bold text-white mt-1 block font-display">
                    {formatCurrency(summary?.metrics?.otherExpenses)}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    {summary?.metrics?.totalExpenses > 0 
                      ? `${((summary.metrics.otherExpenses / summary.metrics.totalExpenses) * 100).toFixed(0)}% of expenses`
                      : '0%'}
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="space-y-2 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Wage-to-Overhead Ratio</span>
                <div className="w-full bg-zinc-900 h-3 rounded-full overflow-hidden flex">
                  {summary?.metrics?.totalExpenses > 0 ? (
                    <>
                      <div 
                        className="bg-emerald-500 h-full" 
                        style={{ width: `${(summary.metrics.staffSalaryExpenses / summary.metrics.totalExpenses) * 100}%` }}
                        title="Salaries"
                      />
                      <div 
                        className="bg-primary h-full" 
                        style={{ width: `${(summary.metrics.otherExpenses / summary.metrics.totalExpenses) * 100}%` }}
                        title="Overheads"
                      />
                    </>
                  ) : (
                    <div className="bg-zinc-800 w-full h-full" />
                  )}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Salaries</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary"></span> Overheads</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Ledger Categorization List */}
          <Card>
            <CardHeader className="border-b border-border/60 bg-white/3">
              <h3 className="text-lg font-semibold text-foreground">Ledger Categorization</h3>
            </CardHeader>
            <CardBody className="space-y-3">
              {(summary?.categoryBreakdown || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic text-center py-6">No categorised outgoings recorded for this audit range.</p>
              ) : (
                summary?.categoryBreakdown.map((item) => (
                  <div key={item.category} className="flex justify-between items-center py-2.5 border-b border-border/40 last:border-0">
                    <span className="text-xs font-semibold text-stone-300">{item.category}</span>
                    <span className="text-xs font-bold text-foreground font-display">{formatCurrency(item.amount)}</span>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
}
