'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { CreditCard, Search, ArrowDownRight, Wallet, Receipt, IndianRupee, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoPayments() {
  const { payments, demoAction } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');

  // Filter payments
  const filteredPayments = payments.filter(p => {
    const matchesSearch = p.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || p.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
      case 'UNPAID': return 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
      case 'PARTIAL': return 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
      case 'REFUNDED': return 'bg-slate-800 text-slate-400 border border-slate-700';
      default: return 'bg-slate-750 text-slate-350';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Payments Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <CreditCard className="h-7 w-7 text-primary" /> Payments Ledger
          </h1>
          <p className="text-sm text-slate-400">
            View transaction invoices, collect outstanding dues, and check payment method distribution.
          </p>
        </div>
        <button
          onClick={() => demoAction('issue manual refund invoice')}
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white rounded-full font-semibold transition-all text-xs"
        >
          <span>Issue Refund</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl w-fit">
            <IndianRupee className="h-5 w-5" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Revenue</p>
          <h3 className="text-2xl font-bold text-white font-display">₹4,87,500</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="p-3 bg-rose-500/15 text-rose-450 rounded-2xl w-fit">
            <ArrowDownRight className="h-5 w-5" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Refunds Issued</p>
          <h3 className="text-2xl font-bold text-white font-display">₹8,500</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="p-3 bg-emerald-500/15 text-emerald-450 rounded-2xl w-fit">
            <Wallet className="h-5 w-5" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Payouts</p>
          <h3 className="text-2xl font-bold text-white font-display">₹2,40,000</h3>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-2 relative overflow-hidden">
          <div className="p-3 bg-cyan-500/15 text-cyan-450 rounded-2xl w-fit">
            <Receipt className="h-5 w-5" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Net Margin Earnings</p>
          <h3 className="text-2xl font-bold text-white font-display">₹2,39,000</h3>
        </div>
      </div>

      {/* Transaction Table Panel */}
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
                placeholder="Search by client, invoice or txn ID..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            {/* Method Select Filter */}
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-full w-fit">
              {['ALL', 'UPI', 'Card', 'Cash', 'Cashfree'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMethodFilter(m)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase',
                    methodFilter === m
                      ? 'bg-primary text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {m}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-850">
              <tr>
                <th className="px-6 py-4">Transaction ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Service Details</th>
                <th className="px-6 py-4">Method</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {filteredPayments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-855/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-300">{p.id}</td>
                  <td className="px-6 py-4 font-semibold text-white">{p.customerName}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{p.service}</td>
                  <td className="px-6 py-4 font-bold text-slate-300">{p.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{p.date}</td>
                  <td className="px-6 py-4 text-right font-bold text-white text-sm">
                    ₹{p.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => demoAction(`print receipt for invoice ${p.invoiceNo}`)}
                      className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:border-primary text-slate-450 hover:text-primary transition-all"
                      title="View Invoice Receipt"
                    >
                      <FileText className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No transactions match your search.
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
