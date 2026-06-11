'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { ShieldAlert, Search, Plus, Filter, CheckCircle, XCircle, ArrowUpRight, TrendingUp, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoPlatform() {
  const { platform, demoAction, showToast } = useDemo();
  
  // Local state for approval flow simulation
  const [approvalsQueue, setApprovalsQueue] = useState(platform.approvals);
  const [tenants, setTenants] = useState(platform.tenants);

  const handleApprove = (appId) => {
    const item = approvalsQueue.find(a => a.id === appId);
    if (!item) return;

    // Remove from queue
    setApprovalsQueue(prev => prev.filter(a => a.id !== appId));
    
    // Add to active tenants list
    const newTenant = {
      id: `t-${Date.now()}`,
      name: item.salonName,
      owner: item.owner,
      city: item.city,
      subscription: item.planRequested,
      mrr: item.planRequested === 'Enterprise' ? 15000 : 8500,
      status: 'ACTIVE',
      created: new Date().toISOString().split('T')[0]
    };
    setTenants(prev => [newTenant, ...prev]);
    showToast('Tenant Approved', `${item.salonName} has been activated on the platform!`);
  };

  const handleReject = (appId) => {
    setApprovalsQueue(prev => prev.filter(a => a.id !== appId));
    showToast('Application Declined', 'Request dismissed successfully.');
  };

  // MRR sum
  const currentMRR = tenants.reduce((sum, item) => sum + (item.status === 'ACTIVE' ? item.mrr : 0), 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'SUSPENDED': return 'bg-rose-500/10 text-rose-450 border border-rose-500/20';
      default: return 'bg-slate-800 text-slate-400 border border-slate-700';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <ShieldAlert className="h-7 w-7 text-primary" /> Platform Management
          </h1>
          <p className="text-sm text-slate-400">
            Multi-location franchise console. Approve newly registered tenants, oversee subscriptions, and track MRR growth.
          </p>
        </div>
        <button
          onClick={() => demoAction('create new tenant from CLI console')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Provision Tenant</span>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Tenants</p>
          <h3 className="text-2xl font-bold text-white font-display">{tenants.length} Brands</h3>
          <p className="text-[9px] text-slate-450">Across 12 metro cities</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Estimated MRR</p>
          <h3 className="text-2xl font-bold text-primary font-display">₹{currentMRR.toLocaleString('en-IN')}</h3>
          <p className="text-[9px] text-slate-450">Active monthly subscriptions</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Awaiting Approvals</p>
          <h3 className="text-2xl font-bold text-amber-500 font-display">{approvalsQueue.length} Salons</h3>
          <p className="text-[9px] text-slate-450">Requires franchise verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Platform Growth</p>
          <h3 className="text-2xl font-bold text-emerald-450 font-display">+14.2% MoM</h3>
          <p className="text-[9px] text-slate-400">June subscriber analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Active Tenants List (8 cols) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
          <div className="p-6 border-b border-slate-800">
            <h3 className="text-lg font-bold font-display text-white">Active Salon Tenants</h3>
            <p className="text-xs text-slate-400 mt-1">Directory of registered barber & wellness establishments</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-400 text-[10px] uppercase tracking-wider font-bold border-b border-slate-850">
                <tr>
                  <th className="px-5 py-4">Establishment Name</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Plan Type</th>
                  <th className="px-5 py-4">Created Date</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">MRR contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850 text-xs">
                {tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-white text-xs leading-normal">{t.name}</p>
                        <p className="text-[9px] text-slate-500 mt-0.5">Owner: {t.owner}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-300 font-semibold">{t.city}</td>
                    <td className="px-5 py-4 text-slate-400 font-bold">{t.subscription}</td>
                    <td className="px-5 py-4 text-slate-500 font-medium">{t.created}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusBadge(t.status)}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-200 text-sm">
                      ₹{t.mrr.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Approvals Queue List (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[32px] p-6 space-y-6">
          <div>
            <h3 className="text-lg font-bold font-display text-white">Approvals Queue</h3>
            <p className="text-xs text-slate-400 mt-1">Pending salon registration audits</p>
          </div>

          <div className="space-y-4">
            {approvalsQueue.map((app) => (
              <div key={app.id} className="bg-slate-950 p-4 border border-slate-850 rounded-2xl space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-xs text-white leading-normal">{app.salonName}</h4>
                  <p className="text-[9px] text-slate-400 font-medium">{app.city} • Requested Plan: <strong className="text-primary">{app.planRequested}</strong></p>
                  <p className="text-[9px] text-slate-500">Submitted: {app.date} by {app.owner}</p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleReject(app.id)}
                    className="flex-1 py-1.5 bg-slate-900 border border-slate-800 hover:border-rose-500 text-slate-400 hover:text-rose-500 rounded-xl font-bold uppercase transition-all tracking-wider text-[9px]"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="flex-1 py-1.5 bg-primary text-slate-950 rounded-xl font-bold uppercase transition-all tracking-wider text-[9px] flex items-center justify-center gap-1"
                  >
                    Approve
                  </button>
                </div>
              </div>
            ))}
            {approvalsQueue.length === 0 && (
              <div className="text-center py-10 space-y-3 bg-slate-950 border border-slate-850 rounded-2xl p-4">
                <ShieldCheck className="h-8 w-8 text-emerald-400 mx-auto animate-pulse" />
                <p className="text-xs text-slate-450 font-bold">Approvals Queue Empty</p>
                <p className="text-[9px] text-slate-500">All tenant registrations successfully audited.</p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
