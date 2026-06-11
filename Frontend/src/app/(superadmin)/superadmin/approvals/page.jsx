'use client';

import { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  XCircle,
  Building2,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react';

export default function ApprovalsPage() {
  const [filter, setFilter] = useState('PENDING');

  // Mock data — in production, this comes from superadmin API
  const [approvals, setApprovals] = useState([
    {
      id: '1',
      salonName: 'Golden Scissors Parlour',
      ownerName: 'Rajesh Verma',
      email: 'rajesh@goldscissors.in',
      phone: '+91 98765 43210',
      plan: 'Growth',
      submittedAt: '2026-06-01T10:30:00Z',
      status: 'PENDING',
    },
    {
      id: '2',
      salonName: 'Bloom Beauty Studio',
      ownerName: 'Neha Kapoor',
      email: 'neha@bloombeauty.in',
      phone: '+91 99887 76655',
      plan: 'Premium',
      submittedAt: '2026-05-30T14:15:00Z',
      status: 'PENDING',
    },
    {
      id: '3',
      salonName: 'Urban Edge Barbershop',
      ownerName: 'Amit Patil',
      email: 'amit@urbanedge.in',
      phone: '+91 88776 55443',
      plan: 'Starter',
      submittedAt: '2026-05-28T09:00:00Z',
      status: 'PENDING',
    },
    {
      id: '4',
      salonName: 'Luxe Hair & Nails',
      ownerName: 'Priya Deshmukh',
      email: 'priya@luxehair.in',
      phone: '+91 77665 44332',
      plan: 'Growth',
      submittedAt: '2026-05-25T16:45:00Z',
      status: 'APPROVED',
    },
  ]);

  const handleAction = (id, action) => {
    setApprovals((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: action } : a))
    );
  };

  const filtered = approvals.filter(
    (a) => filter === 'ALL' || a.status === filter
  );

  const statusStyles = {
    PENDING: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
    APPROVED: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    REJECTED: 'bg-rose-500/15 text-rose-400 border-rose-500/20',
  };

  const planColors = {
    Starter: 'bg-slate-800 text-slate-300',
    Growth: 'bg-blue-500/15 text-blue-400',
    Premium: 'bg-amber-500/15 text-amber-400',
  };

  return (
    <main className="min-h-screen px-6 py-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        {/* Header */}
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-violet-400/80">
            Platform Governance
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-white">
            Salon Registration Approvals
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Review and approve new salon registrations before they gain access to the platform.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
                filter === f
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-300 border border-transparent'
              }`}
            >
              {f}
              {f !== 'ALL' && (
                <span className="ml-1.5 text-[10px] opacity-60">
                  ({approvals.filter((a) => a.status === f).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Approval Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 py-16 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-700" />
              <p className="mt-3 text-sm text-slate-500">
                No {filter.toLowerCase()} registrations found.
              </p>
            </div>
          ) : (
            filtered.map((app) => (
              <div
                key={app.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden"
              >
                <div className="px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{app.salonName}</h3>
                        <p className="text-[11px] text-slate-500">{app.ownerName}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5" /> {app.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="h-3.5 w-3.5" /> {app.phone}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(app.submittedAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`rounded-lg px-2.5 py-1 text-[10px] font-bold ${planColors[app.plan]}`}>
                      {app.plan}
                    </span>
                    <span className={`rounded-lg border px-2.5 py-1 text-[10px] font-bold ${statusStyles[app.status]}`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {app.status === 'PENDING' && (
                  <div className="flex items-center justify-end gap-3 border-t border-slate-800 px-6 py-3 bg-slate-900/30">
                    <button
                      onClick={() => handleAction(app.id, 'REJECTED')}
                      className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-4 py-2 text-xs font-semibold text-rose-400 transition-all hover:bg-rose-500/15"
                    >
                      <XCircle className="h-4 w-4" /> Reject
                    </button>
                    <button
                      onClick={() => handleAction(app.id, 'APPROVED')}
                      className="flex items-center gap-2 rounded-xl bg-emerald-500/15 px-4 py-2 text-xs font-semibold text-emerald-400 transition-all hover:bg-emerald-500/25"
                    >
                      <CheckCircle className="h-4 w-4" /> Approve
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
