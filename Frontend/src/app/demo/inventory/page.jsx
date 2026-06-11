'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Package, Search, Plus, Trash2, ArrowUpRight, AlertTriangle, CheckCircle, PackagePlus, PackageMinus } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoInventory() {
  const { inventory, adjustInventoryStock, demoAction } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Counts
  const totalItems = inventory.length;
  const lowStockCount = inventory.filter(p => p.status === 'LOW' || p.status === 'OUT_OF_STOCK').length;
  const valuation = inventory.reduce((sum, item) => sum + (item.stock * item.costPrice), 0);

  // Filter
  const filteredProducts = inventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'LOW' && (p.status === 'LOW' || p.status === 'OUT_OF_STOCK')) ||
                          p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'IN_STOCK': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'LOW': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'OUT_OF_STOCK': return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Inventory Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Package className="h-7 w-7 text-primary" /> Inventory Management
          </h1>
          <p className="text-sm text-slate-400">
            Track retail shampoo items, developer creams, styling waxes, and trigger reorders.
          </p>
        </div>
        <button
          onClick={() => demoAction('create new inventory product listing')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Unique Products</p>
          <h3 className="text-2xl font-bold text-white font-display">{totalItems} SKU List</h3>
          <p className="text-[9px] text-slate-400">Retail & professional supplies</p>
        </div>

        <div className="bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-1 border-l-4 border-l-amber-500">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Critical Reorders Alert</p>
          <h3 className="text-2xl font-bold text-amber-550 font-display flex items-center gap-2">
            {lowStockCount} Items <AlertTriangle className="h-5 w-5 text-amber-550 shrink-0" />
          </h3>
          <p className="text-[9px] text-slate-450">Stock levels below reorder limits</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Stock Assets Valuation</p>
          <h3 className="text-2xl font-bold text-primary font-display">₹{valuation.toLocaleString('en-IN')}</h3>
          <p className="text-[9px] text-slate-400">Calculated on wholesale cost price</p>
        </div>
      </div>

      {/* Inventory Grid Table */}
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
                placeholder="Search products by SKU, name, supplier..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>

            {/* Filter Pill statuses */}
            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-full w-fit">
              {['ALL', 'IN_STOCK', 'LOW'].map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-all uppercase',
                    statusFilter === s
                      ? 'bg-primary text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  {s === 'LOW' ? 'Low / Out of Stock' : s.replace('_', ' ')}
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
                <th className="px-6 py-4">Product details</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-center">Current Stock</th>
                <th className="px-6 py-4 text-right">Cost Price</th>
                <th className="px-6 py-4 text-right">Retail Price</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-bold text-white text-xs leading-normal max-w-xs">{p.name}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Supplier: {p.supplier}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-350">{p.sku}</td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{p.category}</td>
                  
                  {/* Interactive Stock adjustments */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3 bg-slate-950 w-fit mx-auto px-2.5 py-1.5 rounded-xl border border-slate-800">
                      <button 
                        onClick={() => adjustInventoryStock(p.id, -1)}
                        className="text-slate-450 hover:text-rose-500 transition-colors"
                        title="Reduce Stock"
                      >
                        <PackageMinus className="h-4 w-4" />
                      </button>
                      <span className="font-mono font-bold text-slate-100 text-xs w-6 text-center">{p.stock}</span>
                      <button 
                        onClick={() => adjustInventoryStock(p.id, 1)}
                        className="text-slate-455 hover:text-emerald-400 transition-colors"
                        title="Add Stock"
                      >
                        <PackagePlus className="h-4 w-4" />
                      </button>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-right text-slate-300 font-semibold">₹{p.costPrice.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-right text-slate-300 font-semibold">₹{p.retailPrice.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => demoAction(`dispatch purchase order for ${p.name}`)}
                      className="px-3 py-1 bg-slate-950 border border-slate-800 hover:border-primary text-slate-350 hover:text-primary rounded-xl font-bold uppercase transition-all tracking-wider text-[9px]"
                    >
                      Reorder
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="8" className="text-center py-10 text-slate-500">
                    No items in inventory match your criteria.
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
