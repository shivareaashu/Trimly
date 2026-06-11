'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Receipt, Search, Plus, Filter, ArrowUpRight, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoExpenses() {
  const { expenses, demoAction } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');

  // Static category definitions for styling/percentages
  const categories = [
    { name: 'Rent & Utilities', amount: 75000, percentage: 52, color: 'bg-rose-500' },
    { name: 'Salon Inventory', amount: 35000, percentage: 25, color: 'bg-cyan-500' },
    { name: 'Marketing & Ads', amount: 18000, percentage: 13, color: 'bg-emerald-500' },
    { name: 'Staff Welfare & Training', amount: 14800, percentage: 10, color: 'bg-amber-500' }
  ];

  // Filtering
  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          e.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'ALL' || e.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Expenses Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Receipt className="h-7 w-7 text-primary" /> Salon Expenses
          </h1>
          <p className="text-sm text-slate-400">
            Log overhead rents, utility bill cycles, team dining receipts, and marketing budgets.
          </p>
        </div>
        <button
          onClick={() => demoAction('log new business expense')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Month Outflow</p>
          <h3 className="text-2xl font-bold text-white font-display">₹1,42,800</h3>
          <p className="text-[9px] text-slate-400">Current active monthly period</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Highest Overhead Sector</p>
          <h3 className="text-2xl font-bold text-rose-500 font-display">Rent & Utilities</h3>
          <p className="text-[9px] text-slate-400">Makes up 52% of total spend</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Reimbursements</p>
          <h3 className="text-2xl font-bold text-white font-display">₹3,500</h3>
          <p className="text-[9px] text-slate-400">Awaiting partner audit approvals</p>
        </div>
      </div>

      {/* Categorical Distribution Visual */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-6">
        <div>
          <h3 className="text-lg font-bold font-display text-white">Expense Distribution</h3>
          <p className="text-xs text-slate-400 mt-1">Breakdown of operational spend by category</p>
        </div>
        
        {/* Horizontal Split Percentage Bar */}
        <div className="h-4.5 bg-slate-950 border border-slate-800 rounded-full flex overflow-hidden p-0.5">
          {categories.map((c, i) => (
            <div
              key={i}
              className={cn('h-full first:rounded-l-full last:rounded-r-full transition-all')}
              style={{ width: `${c.percentage}%` }}
            >
              <div className={cn('h-full w-full', c.color)} title={`${c.name}: ${c.percentage}%`} />
            </div>
          ))}
        </div>

        {/* Categories Details Legend */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((c, i) => (
            <div key={i} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex items-center gap-3">
              <div className={cn('h-3.5 w-3.5 rounded-full shrink-0', c.color)} />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{c.name}</p>
                <p className="text-sm font-bold text-white mt-0.5">
                  ₹{c.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-[10px] text-slate-500 font-medium">({c.percentage}%)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
        
        {/* Table Toolbar */}
        <div className="p-6 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center">
            
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search expense description, merchant..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            {/* Category selection */}
            <div className="flex flex-wrap bg-slate-950 border border-slate-800 p-1 rounded-full w-fit">
              <button
                onClick={() => setActiveCategory('ALL')}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-[9px] font-bold tracking-wider transition-all uppercase',
                  activeCategory === 'ALL' ? 'bg-primary text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[9px] font-bold tracking-wider transition-all uppercase',
                    activeCategory === cat.name
                      ? 'bg-primary text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {cat.name.split(' ')[0]}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Expenses List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-850">
              <tr>
                <th className="px-6 py-4">Expense ID</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Logged Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {filteredExpenses.map((e) => (
                <tr key={e.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4 font-mono text-slate-350">{e.id}</td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] font-semibold text-slate-200 bg-slate-950 px-2.5 py-1 border border-slate-800 rounded-lg">
                      {e.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">{e.merchant}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{e.description}</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{e.date}</td>
                  <td className="px-6 py-4 text-right font-bold text-white text-sm">
                    ₹{e.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                      {e.status}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No logged expenses match your query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
