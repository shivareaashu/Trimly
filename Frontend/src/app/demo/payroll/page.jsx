'use client';

import React from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Wallet, Sparkles, CheckCircle, Clock, Check, Award, AlertCircle } from 'lucide-react';

export default function DemoPayroll() {
  const { payroll, updatePayrollStatus, demoAction } = useDemo();

  // Summary counts
  const totalNet = payroll.reduce((sum, item) => sum + item.netSalary, 0);
  const pendingApprovalsCount = payroll.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Payroll Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Wallet className="h-7 w-7 text-primary" /> Staff Payroll
          </h1>
          <p className="text-sm text-slate-400">
            Verify calculated base salaries, commission splits, bonus parameters, and disburse payments.
          </p>
        </div>
        <button
          onClick={() => {
            if (pendingApprovalsCount === 0) return;
            // Bulk approve simulation
            payroll.forEach(p => {
              if (p.status === 'PENDING') updatePayrollStatus(p.id, 'APPROVED');
            });
          }}
          disabled={pendingApprovalsCount === 0}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs cursor-pointer disabled:cursor-not-allowed"
        >
          <Check className="h-4 w-4" />
          <span>Approve All Pending</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Total Net Disbursements</p>
          <h3 className="text-2xl font-bold text-white font-display">₹{totalNet.toLocaleString('en-IN')}</h3>
          <p className="text-[9px] text-slate-400">Calculated across 6 styling staff</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending Approvals</p>
          <h3 className="text-2xl font-bold text-primary font-display flex items-center gap-2">
            {pendingApprovalsCount} <span className="text-xs text-slate-400 font-medium">Drafts</span>
          </h3>
          <p className="text-[9px] text-slate-400">Needs partner verification</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-3xl space-y-1.5">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Next Salary Disbursal Date</p>
          <h3 className="text-2xl font-bold text-white font-display flex items-center gap-2">
            June 30 <span className="text-xs text-emerald-400 font-bold font-mono">10:00 AM</span>
          </h3>
          <p className="text-[9px] text-slate-400">Automated UPI bank transfer</p>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
        
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold font-display text-white">Salary & Commission Ledger</h2>
          <p className="text-xs text-slate-400 mt-1">May 2026 Pay Cycle (Current Billing Period)</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-850">
              <tr>
                <th className="px-6 py-4">Stylist Name</th>
                <th className="px-6 py-4">Base Salary</th>
                <th className="px-6 py-4">Commission</th>
                <th className="px-6 py-4">Bonus</th>
                <th className="px-6 py-4">Deductions</th>
                <th className="px-6 py-4">Net Payout</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850 text-xs">
              {payroll.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] border border-primary/20">
                        {p.staffName.split(' ')[0][0]}{p.staffName.split(' ')[1]?.[0] || ''}
                      </div>
                      <span className="font-bold text-white">{p.staffName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 font-semibold">₹{p.baseSalary.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-primary font-bold">₹{p.commission.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-emerald-450 font-semibold">+₹{p.bonus.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-rose-500 font-semibold">-₹{p.deductions.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 font-bold text-white text-sm">₹{p.netSalary.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider ${
                      p.status === 'APPROVED' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {p.status === 'PENDING' ? (
                      <button
                        onClick={() => updatePayrollStatus(p.id, 'APPROVED')}
                        className="px-3.5 py-1.5 bg-slate-950 border border-slate-850 hover:border-primary text-slate-300 hover:text-primary rounded-xl font-bold uppercase transition-all tracking-wider text-[9px]"
                      >
                        Approve
                      </button>
                    ) : (
                      <span className="flex items-center justify-center text-emerald-400 gap-1 font-bold text-[10px] font-mono">
                        <CheckCircle className="h-3.5 w-3.5" /> Disbursed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
