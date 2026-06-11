'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { Plus, UserPlus, ArrowUpRight, MoreHorizontal, AlertTriangle, Wallet } from 'lucide-react';
import Link from 'next/link';

export default function DemoDashboard() {
  const { dashboard, demoAction } = useDemo();
  const [revenueTimeframe, setRevenueTimeframe] = useState('7D');

  const chartPoints = dashboard.chartData[revenueTimeframe];
  const maxChartVal = Math.max(...chartPoints.map(p => p.value));

  // Helper to format iso time string to HH:MM AM/PM
  const formatTime = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '12:00 PM';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Demo Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-white tracking-tight">
            Good Morning, Aanya
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Your atelier has <span className="text-primary font-bold">{dashboard.appointmentsTotal}</span> scheduled services today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/demo/customers"
            className="flex items-center gap-2 px-5 py-2.5 border border-slate-700 rounded-full text-slate-300 hover:text-white hover:bg-slate-900 transition-all text-xs font-semibold"
          >
            <UserPlus className="h-4 w-4 text-primary" />
            <span>Add Customer</span>
          </Link>
          <Link
            href="/demo/calendar"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>New Appointment</span>
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <MetricsGrid
        todayEarnings={dashboard.todayEarnings}
        appointmentsTotal={dashboard.appointmentsTotal}
        appointmentsRemaining={dashboard.appointmentsRemaining}
        newCustomersStr={dashboard.newCustomersStr}
        staffWorkingStr={dashboard.staffWorkingStr}
      />

      {/* Charts & Operational widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Trend chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-[32px] p-6">
          <RevenueChart
            revenueTimeframe={revenueTimeframe}
            setRevenueTimeframe={setRevenueTimeframe}
            chartPoints={chartPoints}
            maxChartVal={maxChartVal}
          />
        </div>

        {/* Inventory alerts & Pending payments */}
        <div className="space-y-6">
          {/* Inventory Alerts Box */}
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-[32px] border-l-[6px] border-rose-500">
            <div className="flex items-center gap-3 mb-4 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-lg text-white font-semibold">Inventory Alerts</h3>
            </div>
            <ul className="space-y-4">
              {dashboard.inventoryAlerts.map((alert, i) => (
                <li key={i} className="flex justify-between items-center text-sm border-b border-slate-850 pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-white">{alert.name}</p>
                    <p className="text-xs text-slate-400">
                      {alert.status === 'OUT_OF_STOCK' ? (
                        <span className="text-rose-500 font-bold uppercase text-[10px]">Out of Stock</span>
                      ) : (
                        `${alert.unitsLeft} units left`
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => demoAction(`reorder ${alert.name}`)}
                    className="text-primary hover:text-primary/80 transition-colors font-semibold text-xs border-b border-primary"
                  >
                    Reorder
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Pending Payments Box */}
          <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-[32px] border-l-[6px] border-primary">
            <div className="flex items-center gap-3 mb-4 text-primary">
              <Wallet className="h-5 w-5" />
              <h3 className="text-lg text-white font-semibold">Pending Payments</h3>
            </div>
            <div className="space-y-3">
              {dashboard.paymentsList.map((payment) => (
                <div
                  key={payment.id}
                  onClick={() => demoAction(`collect payment for ${payment.customer.firstName}`)}
                  className="flex justify-between items-center p-3.5 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer hover:bg-slate-800/80 hover:border-slate-700 transition-all"
                >
                  <div>
                    <p className="font-semibold text-white text-xs">Inv #{payment.id} - {payment.customer.firstName}</p>
                    <p className="text-[10px] text-slate-400">{payment.appointment.service.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary text-xs">₹{payment.amount.toLocaleString('en-IN')}</p>
                    <p className={
                      `text-[9px] font-bold uppercase tracking-wider ${
                        payment.paymentStatus === 'PARTIAL' ? 'text-amber-500' : 'text-rose-500'
                      }`
                    }>
                      {payment.paymentStatus}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Upcoming Appointments Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold font-display text-white">Today's Appointments</h2>
          <Link href="/demo/calendar" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
            View All Schedule <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-950 text-slate-400 text-xs uppercase tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-sm">
              {dashboard.todayBookings.map((booking, i) => {
                const initials = `${booking.customer.firstName[0]}${booking.customer.lastName[0] || ''}`;
                const borderColors = ['border-primary', 'border-amber-500', 'border-teal-500', 'border-rose-500'];
                const borderColor = borderColors[i % borderColors.length];

                return (
                  <tr key={booking.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase border border-primary/20">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{booking.customer.firstName} {booking.customer.lastName}</p>
                          <p className="text-[10px] text-slate-500">ID: {booking.customer.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-0.5 bg-slate-950 border-l-4 ${borderColor} rounded-r-lg text-xs font-medium text-slate-200 inline-block`}>
                        {booking.service.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{formatTime(booking.startTime)}</p>
                      <p className="text-[10px] text-slate-400">{booking.service.duration} mins</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={`h-2 w-2 rounded-full ${
                          booking.status === 'CONFIRMED' ? 'bg-primary animate-pulse' : 'bg-amber-400'
                        }`} />
                        <span className="capitalize text-slate-300 font-semibold">{booking.status.toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => demoAction(`manage booking ${booking.id}`)}
                        className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
