'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { FileText, Search, Plus, Filter, ArrowUpRight, CheckSquare, Send, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoPurchaseOrders() {
  const { purchaseOrders, demoAction, showToast } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  
  // Local state for checking status update simulations
  const [orders, setOrders] = useState(purchaseOrders);

  // Filter
  const filteredOrders = orders.filter(po => {
    const matchesSearch = po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          po.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (id, newStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return { ...o, status: newStatus };
      }
      return o;
    }));
    showToast(
      'Order Status Updated',
      `PO ${id} status updated to ${newStatus} locally (stock levels auto-adjusted)`
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-slate-800 text-slate-450 border border-slate-700';
      case 'SENT': return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'APPROVED': return 'bg-primary/10 text-primary border border-primary/20';
      case 'RECEIVED': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* PO Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <FileText className="h-7 w-7 text-primary" /> Purchase Orders
          </h1>
          <p className="text-sm text-slate-400">
            Create, verify, dispatch, and confirm delivery of wholesale product procurements.
          </p>
        </div>
        <button
          onClick={() => demoAction('create draft purchase order')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Create Purchase Order</span>
        </button>
      </div>

      {/* PO workflow stages indicators */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] space-y-4">
        <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Procurement Workflow Timeline</h3>
        <div className="grid grid-cols-5 gap-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl border-t-2 border-t-slate-650 text-slate-400">
            <p className="text-slate-600 font-mono text-[9px]">Stage 1</p>
            <p className="mt-1.5">Draft PO</p>
          </div>
          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl border-t-2 border-t-cyan-500 text-cyan-400">
            <p className="text-slate-600 font-mono text-[9px]">Stage 2</p>
            <p className="mt-1.5">Dispatched / Sent</p>
          </div>
          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl border-t-2 border-t-primary text-primary">
            <p className="text-slate-600 font-mono text-[9px]">Stage 3</p>
            <p className="mt-1.5">Approved</p>
          </div>
          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl border-t-2 border-t-amber-500 text-amber-400">
            <p className="text-slate-600 font-mono text-[9px]">Stage 4</p>
            <p className="mt-1.5">Received / Goods</p>
          </div>
          <div className="bg-slate-950 p-3.5 border border-slate-850 rounded-2xl border-t-2 border-t-emerald-500 text-emerald-450">
            <p className="text-slate-600 font-mono text-[9px]">Stage 5</p>
            <p className="mt-1.5">Completed</p>
          </div>
        </div>
      </div>

      {/* Orders log table */}
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
                placeholder="Search orders by ID, supplier name..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            {/* Filter pills */}
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-full w-fit">
              {['ALL', 'DRAFT', 'SENT', 'RECEIVED', 'COMPLETED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-3.5 py-1.5 rounded-full text-[9px] font-bold tracking-wider transition-all uppercase',
                    statusFilter === s
                      ? 'bg-primary text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

          </div>
        </div>

        {/* PO Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-850">
              <tr>
                <th className="px-6 py-4">PO Code</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Quantity Items</th>
                <th className="px-6 py-4">Date Dispatched</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Invoice Value</th>
                <th className="px-6 py-4 text-center">Interactions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {filteredOrders.map((po) => (
                <tr key={po.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-350">{po.id}</td>
                  <td className="px-6 py-4 font-bold text-white">{po.supplierName}</td>
                  <td className="px-6 py-4 text-slate-400 font-semibold">{po.itemsCount} Wholesale lines</td>
                  <td className="px-6 py-4 text-slate-500 font-medium">{po.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(po.status)}`}>
                      {po.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white text-sm">
                    ₹{po.amount.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {po.status === 'SENT' && (
                      <button
                        onClick={() => handleStatusChange(po.id, 'RECEIVED')}
                        className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-primary text-slate-300 hover:text-primary rounded-xl font-bold uppercase transition-all tracking-wider text-[9px] flex items-center gap-1.5 mx-auto"
                      >
                        <CheckSquare className="h-3.5 w-3.5 text-primary" /> Receive Goods
                      </button>
                    )}
                    {po.status === 'RECEIVED' && (
                      <button
                        onClick={() => handleStatusChange(po.id, 'COMPLETED')}
                        className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500 hover:bg-emerald-500 hover:text-slate-950 rounded-xl font-bold uppercase transition-all tracking-wider text-[9px] flex items-center gap-1.5 mx-auto"
                      >
                        Complete Audit
                      </button>
                    )}
                    {(po.status === 'COMPLETED' || po.status === 'DRAFT') && (
                      <span className="text-slate-500 font-bold tracking-wide uppercase text-[9px] block text-center font-mono">
                        Archive Logged
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-10 text-slate-500">
                    No purchase orders logged under these parameters.
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
