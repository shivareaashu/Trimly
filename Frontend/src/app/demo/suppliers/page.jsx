'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Truck, Search, Plus, Star, Phone, Mail, MapPin, ClipboardList, Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoSuppliers() {
  const { suppliers, purchaseOrders, inventory, demoAction } = useDemo();
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || null);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

  // Get products supplied by this supplier
  const suppliedProducts = inventory.filter(p => p.supplier === selectedSupplier?.name);

  // Get POs for this supplier
  const supplierPOs = purchaseOrders.filter(po => po.supplierName === selectedSupplier?.name);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Suppliers Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Truck className="h-7 w-7 text-primary" /> Supplier Directory
          </h1>
          <p className="text-sm text-slate-400">
            Audit wholesale distributors, track delivery turnaround timelines, and manage open account balances.
          </p>
        </div>
        <button
          onClick={() => demoAction('onboard new supplier distributor')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Supplier</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Supplier Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              onClick={() => setSelectedSupplierId(sup.id)}
              className={cn(
                'bg-slate-900 border rounded-3xl p-5 cursor-pointer transition-all hover:scale-[1.01] space-y-4',
                selectedSupplierId === sup.id 
                  ? 'border-primary bg-slate-900 shadow-lg shadow-primary/5' 
                  : 'border-slate-800 bg-slate-900/50'
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-sm text-white">{sup.name}</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Contact: {sup.contactName}</p>
                </div>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 rounded-full text-[9px] font-bold uppercase tracking-wider">
                  {sup.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 border-t border-slate-850 pt-3 text-[10px] text-slate-400">
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[8px]">Balance</p>
                  <p className="font-bold text-slate-200 mt-0.5">{sup.outstandingBalance}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[8px]">Active POs</p>
                  <p className="font-bold text-slate-200 mt-0.5">{sup.activeOrders} Orders</p>
                </div>
                <div>
                  <p className="text-slate-500 font-bold uppercase text-[8px]">Lead Time</p>
                  <p className="font-bold text-primary mt-0.5">{sup.leadTime}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Detailed supplier sheet (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[32px] p-6 h-[600px] flex flex-col justify-between">
          
          {selectedSupplier ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Profile details */}
              <div className="border-b border-slate-800 pb-5 space-y-3 shrink-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">{selectedSupplier.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">Point of contact: {selectedSupplier.contactName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-500 font-bold uppercase">Outstanding Ledger</p>
                    <p className="text-base font-bold text-primary mt-0.5">{selectedSupplier.outstandingBalance}</p>
                  </div>
                </div>

                {/* Contact pills */}
                <div className="flex flex-wrap gap-4 text-xs text-slate-400 font-medium pt-1">
                  <span className="flex items-center gap-1.5 font-mono text-[10px]">
                    <Phone className="h-3.5 w-3.5 text-primary" /> {selectedSupplier.phone}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px]">
                    <Mail className="h-3.5 w-3.5 text-primary" /> {selectedSupplier.email}
                  </span>
                </div>
                <div className="flex items-start gap-1.5 text-xs text-slate-500 leading-normal">
                  <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>{selectedSupplier.address}</span>
                </div>
              </div>

              {/* Scrollable listing */}
              <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6">
                
                {/* Supplied products */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-primary" /> Catalogs & Linked products ({suppliedProducts.length})
                  </h4>
                  <div className="space-y-2">
                    {suppliedProducts.map((p) => (
                      <div key={p.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-white leading-normal">{p.name}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">SKU: {p.sku} | Cat: {p.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-200">₹{p.costPrice}</p>
                          <p className="text-[9px] text-slate-500 mt-0.5">Stock: {p.stock} units</p>
                        </div>
                      </div>
                    ))}
                    {suppliedProducts.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">No active inventory catalogs linked to supplier.</p>
                    )}
                  </div>
                </div>

                {/* Purchase Order History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Purchase Orders History ({supplierPOs.length})
                  </h4>
                  <div className="space-y-2">
                    {supplierPOs.map((po) => (
                      <div key={po.id} className="p-3.5 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                        <div className="space-y-1">
                          <p className="font-mono font-bold text-white">{po.id}</p>
                          <p className="text-[10px] text-slate-500">{po.date} | {po.itemsCount} Items logged</p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-bold text-primary">₹{po.amount.toLocaleString('en-IN')}</p>
                          <span className={`inline-block px-2 py-0.5 text-[8px] font-bold rounded uppercase tracking-wider ${
                            po.status === 'COMPLETED' || po.status === 'RECEIVED'
                              ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {po.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Detail footer CTA */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <button
                  onClick={() => demoAction(`dispatch restocking email order to ${selectedSupplier.name}`)}
                  className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Create Wholesale Purchase Order <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-500 py-10 text-xs">
              Select a supplier.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
