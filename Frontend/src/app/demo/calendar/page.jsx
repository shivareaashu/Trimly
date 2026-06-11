'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Calendar as CalendarIcon, Clock, User, Plus, Filter, RefreshCw, Check } from 'lucide-react';

export default function DemoCalendar() {
  const { calendar, salon, addAppointment, updateAppointmentStatus, demoAction, showToast } = useDemo();
  const [selectedBranch, setSelectedBranch] = useState('b1');
  const [draggedAppId, setDraggedAppId] = useState(null);

  // Filter appointments for the active date and branch if needed (demo has 1 day)
  const appointments = calendar.appointments;
  const staff = salon.staff;
  const slots = calendar.timeSlots;

  // Handle HTML5 Drag and Drop
  const handleDragStart = (e, appId) => {
    setDraggedAppId(appId);
    e.dataTransfer.setData('text/plain', appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Required to allow drop
  };

  const handleDrop = (e, targetStaffId, targetTimeSlot) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (!appId) return;

    // Find the appointment
    const appointment = appointments.find(a => a.id === appId);
    if (!appointment) return;

    const targetStaff = staff.find(s => s.id === targetStaffId);

    // Update locally
    appointment.staffId = targetStaffId;
    appointment.staffName = targetStaff?.name || 'Unassigned';
    appointment.startTime = targetTimeSlot;

    // Trigger state refresh (we mutate directly here because it is a demo mock, but we also show a toast)
    setDraggedAppId(null);
    showToast(
      'Schedule Updated',
      `Moved ${appointment.customerName} to ${targetStaff.name} at ${targetTimeSlot} (SMS Alert Sim)`
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-primary/20 border-primary text-primary';
      case 'PENDING': return 'bg-amber-500/20 border-amber-500 text-amber-400';
      case 'CANCELLED': return 'bg-rose-500/20 border-rose-500 text-rose-400';
      default: return 'bg-slate-700/20 border-slate-650 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Calendar Control Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="h-7 w-7 text-primary" /> Daily Scheduler
          </h1>
          <p className="text-sm text-slate-400">
            Drag and drop appointments to reschedule stylists and times instantly.
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold rounded-xl px-4 py-2 focus:outline-none focus:border-primary cursor-pointer"
          >
            {salon.branches.map(b => (
              <option key={b.id} value={b.id}>{b.name} Branch</option>
            ))}
          </select>

          <button
            onClick={() => demoAction('schedule new appointment')}
            className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Stylist Columns Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 overflow-x-auto scrollbar-hide">
        <div className="min-w-[800px]">
          
          {/* Top Row: Stylist Cards */}
          <div className="grid grid-cols-7 gap-4 mb-6 text-center border-b border-slate-800 pb-4">
            <div className="flex items-center justify-center font-bold text-xs text-slate-500 uppercase tracking-wider">
              Time
            </div>
            {staff.map(s => (
              <div key={s.id} className="space-y-2">
                <div className="h-9 w-9 rounded-full overflow-hidden mx-auto border border-primary/20">
                  <img src={s.avatar} className="h-full w-full object-cover" alt={s.name} />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{s.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-slate-500 font-medium">{s.role.split(' ')[0]}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Schedule Grid */}
          <div className="space-y-2">
            {slots.map(slot => (
              <div key={slot} className="grid grid-cols-7 gap-4 items-center min-h-[72px]">
                
                {/* Time Label */}
                <div className="text-right pr-4 text-xs font-semibold text-slate-500">
                  {slot}
                </div>

                {/* Drop Zones for each stylist */}
                {staff.map(stylist => {
                  // Find appointment for this stylist and time
                  const activeApp = appointments.find(
                    a => a.staffId === stylist.id && a.startTime === slot
                  );

                  return (
                    <div
                      key={stylist.id}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, stylist.id, slot)}
                      className={cn(
                        'h-full rounded-2xl border border-dashed transition-all p-2 flex flex-col justify-center relative group',
                        activeApp 
                          ? 'border-transparent bg-slate-950/20' 
                          : 'border-slate-800 hover:border-primary/30 hover:bg-slate-900/40'
                      )}
                    >
                      {activeApp ? (
                        <div
                          draggable
                          onDragStart={(e) => handleDragStart(e, activeApp.id)}
                          className={cn(
                            'rounded-xl border p-2.5 cursor-grab active:cursor-grabbing text-xs space-y-1.5 shadow-md transition-all hover:brightness-110 flex flex-col justify-between h-full select-none',
                            getStatusColor(activeApp.status)
                          )}
                        >
                          <div className="leading-tight">
                            <p className="font-bold tracking-wide truncate">{activeApp.customerName}</p>
                            <p className="text-[9px] opacity-80 font-medium truncate">{activeApp.serviceName}</p>
                          </div>
                          
                          <div className="flex items-center justify-between text-[9px] opacity-85">
                            <span className="flex items-center gap-1 font-semibold">
                              <Clock className="h-2.5 w-2.5" /> {activeApp.duration}m
                            </span>
                            <span className="font-bold">₹{activeApp.price}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center h-full cursor-pointer text-[10px] font-bold text-primary gap-1">
                          <Plus className="h-3.5 w-3.5" /> Book
                        </div>
                      )}
                    </div>
                  );
                })}

              </div>
            ))}
          </div>

        </div>
      </div>

    </div>
  );
}
