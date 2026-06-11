'use client';

import React from 'react';
import { useDemo } from '@/demo/DemoContext';
import { cn } from '@/lib/utils';
import { TrendingUp, FileText, ArrowUpRight, DollarSign, Award, CreditCard, PieChart } from 'lucide-react';

export default function DemoFinance() {
  const { platform, demoAction } = useDemo();

  // P&L Metrics
  const revenue = 487500;
  const expenses = 142800;
  const payroll = 320500;
  const netProfit = revenue - (expenses + payroll);
  const profitMargin = ((netProfit / revenue) * 100).toFixed(1);

  // Revenue by source
  const revenueSources = [
    { source: 'Hair Styling & Treatments', amount: 268000, percentage: 55, color: 'bg-primary' },
    { source: 'Skin & Facial Therapies', amount: 121800, percentage: 25, color: 'bg-emerald-500' },
    { source: 'Retail Products Sales', amount: 58500, percentage: 12, color: 'bg-cyan-500' },
    { source: 'Nail Lacquer & Extensions', amount: 39200, percentage: 8, color: 'bg-pink-500' }
  ];

  // Monthly historical trend
  const trends = [
    { month: 'Jan', revenue: 420000, expenses: 410000, profit: 10000 },
    { month: 'Feb', revenue: 450000, expenses: 425000, profit: 25000 },
    { month: 'Mar', revenue: 470000, expenses: 450000, profit: 20000 },
    { month: 'Apr', revenue: 510000, expenses: 460000, profit: 50000 },
    { month: 'May', revenue: 487500, expenses: 463300, profit: 24200 }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Finance Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-primary" /> Finance & P&L
          </h1>
          <p className="text-sm text-slate-400">
            CEO-grade overview of salon operating margins, overhead costs, and profit progress.
          </p>
        </div>
        <button
          onClick={() => demoAction('generate certified financial PDF audit')}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <FileText className="h-4 w-4" />
          <span>Export P&L Statement</span>
        </button>
      </div>

      {/* Financial P&L Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Gross Revenue</p>
          <h3 className="text-xl font-bold text-white font-display">₹{revenue.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-emerald-450 font-bold">100% of income</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Overhead Expenses</p>
          <h3 className="text-xl font-bold text-rose-500 font-display">₹{expenses.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 font-medium">{((expenses / revenue) * 100).toFixed(0)}% of revenue</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Staff Payroll Cost</p>
          <h3 className="text-xl font-bold text-rose-500 font-display">₹{payroll.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-slate-400 font-medium">{((payroll / revenue) * 100).toFixed(0)}% of revenue</span>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-1 bg-primary/5 border-primary/20">
          <p className="text-[9px] text-primary font-bold uppercase tracking-wider">Net Operating Profit</p>
          <h3 className="text-xl font-bold text-primary font-display">₹{netProfit.toLocaleString('en-IN')}</h3>
          <span className="text-[10px] text-primary/80 font-semibold">+₹3,200 vs last month</span>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-1 bg-emerald-500/5 border-emerald-500/20">
          <p className="text-[9px] text-emerald-450 font-bold uppercase tracking-wider">Profit Margin</p>
          <h3 className="text-xl font-bold text-emerald-400 font-display">{profitMargin}%</h3>
          <span className="text-[10px] text-emerald-400/80 font-semibold">Healthy limit</span>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Monthly Trend chart (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Monthly Profitability Trend</h3>
            <p className="text-xs text-slate-400 mt-1">Comparison of gross billing revenue versus net profits</p>
          </div>

          <div className="h-[250px] flex items-end justify-between gap-6 px-4 pb-2 pt-6">
            {trends.map((t, idx) => {
              const maxVal = Math.max(...trends.map(x => x.revenue));
              const revHeight = (t.revenue / maxVal) * 100;
              const profHeight = (t.profit / maxVal) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group relative">
                  
                  {/* Bars container */}
                  <div className="w-full flex items-end justify-center gap-1.5 h-full relative">
                    
                    {/* Revenue Bar */}
                    <div 
                      className="w-4 bg-slate-800 group-hover:bg-slate-700 transition-colors rounded-t-md" 
                      style={{ height: `${revHeight}%` }}
                      title={`Revenue: ₹${t.revenue.toLocaleString('en-IN')}`}
                    />
                    
                    {/* Profit Bar */}
                    <div 
                      className="w-4 bg-primary rounded-t-md shadow-lg shadow-primary/20" 
                      style={{ height: `${Math.max(6, profHeight)}%` }}
                      title={`Profit: ₹${t.profit.toLocaleString('en-IN')}`}
                    />

                  </div>

                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-3 font-mono">
                    {t.month}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-slate-850 rounded" /> Gross Billing
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 bg-primary rounded" /> Net Profit Margin
            </div>
          </div>
        </div>

        {/* Right: Revenue Breakdown by Category (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Revenue Channels</h3>
            <p className="text-xs text-slate-400 mt-1">Breakdown of earnings by service and product types</p>
          </div>

          <div className="space-y-4">
            {revenueSources.map((source, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-350 font-bold">{source.source}</span>
                  <span className="text-slate-500 font-mono font-bold">
                    ₹{source.amount.toLocaleString('en-IN')}{' '}
                    <span className="text-primary font-bold">({source.percentage}%)</span>
                  </span>
                </div>
                <div className="h-2 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-850">
                  <div 
                    className={cn('h-full rounded-full', source.color)} 
                    style={{ width: `${source.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
