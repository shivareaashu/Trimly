'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Sparkles, Star, Calendar, Clock, DollarSign, Award, Percent, ClipboardCheck, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DemoStaff() {
  const { staff, demoAction } = useDemo();
  const [selectedStaffId, setSelectedStaffId] = useState(staff[0]?.id || null);

  const selectedMember = staff.find(s => s.id === selectedStaffId) || staff[0];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* Staff Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Award className="h-7 w-7 text-primary" /> Staff Profiles & Rosters
          </h1>
          <p className="text-sm text-slate-400">
            View stylist rankings, weekly performance targets, commissions, and shifts.
          </p>
        </div>
        <button
          onClick={() => demoAction('onboard new staff member')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <span>Onboard Stylist</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Directory Grid (6 cols) */}
        <div className="lg:col-span-6 space-y-4 h-[600px] overflow-y-auto pr-2 scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedStaffId(member.id)}
                className={cn(
                  'bg-slate-900 border rounded-3xl p-5 text-center space-y-3 cursor-pointer transition-all hover:scale-[1.02]',
                  selectedStaffId === member.id 
                    ? 'border-primary shadow-lg shadow-primary/5 bg-slate-900' 
                    : 'border-slate-800 bg-slate-900/50'
                )}
              >
                <div className="relative h-16 w-16 rounded-full overflow-hidden mx-auto border-2 border-primary/20">
                  <img src={member.avatar} className="h-full w-full object-cover" alt={member.name} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">{member.name}</h3>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">{member.role}</p>
                </div>
                
                <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-slate-300">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <span>{member.rating.toFixed(1)}</span>
                  <span className="text-slate-500 font-medium">({member.reviews} reviews)</span>
                </div>
                
                <div className="bg-slate-950 py-1.5 px-3 rounded-lg text-[9px] font-semibold text-primary truncate">
                  Available: {member.nextAvailable}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Performance Panel (6 cols) */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-[32px] p-6 h-[600px] flex flex-col justify-between">
          
          {selectedMember ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Profile card summary */}
              <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
                <div className="h-16 w-16 rounded-2xl overflow-hidden border border-slate-800 shrink-0">
                  <img src={selectedMember.avatar} className="h-full w-full object-cover" alt={selectedMember.name} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-wide">{selectedMember.name}</h3>
                  <p className="text-xs text-primary font-semibold">{selectedMember.role}</p>
                  <p className="text-[10px] text-slate-450 mt-0.5">Exp: {selectedMember.experience} | Specialty: {selectedMember.specialty}</p>
                </div>
              </div>

              {/* Scrollable details */}
              <div className="flex-1 overflow-y-auto scrollbar-hide py-4 space-y-6">
                
                {/* Weekly target progress */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Weekly Sales Target</span>
                    <span className="text-white font-bold">
                      ₹{selectedMember.weeklySales.toLocaleString('en-IN')} / ₹{selectedMember.weeklyTarget.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 p-0.5">
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-amber-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (selectedMember.weeklySales / selectedMember.weeklyTarget) * 100)}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium">
                    {((selectedMember.weeklySales / selectedMember.weeklyTarget) * 100).toFixed(0)}% of weekly goal achieved.
                  </p>
                </div>

                {/* Key Metrics grid */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl text-center space-y-1">
                    <DollarSign className="h-4 w-4 text-primary mx-auto" />
                    <p className="text-[8px] text-slate-500 font-bold uppercase">This Month</p>
                    <p className="text-xs font-bold text-white">₹{selectedMember.earningsThisMonth.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl text-center space-y-1">
                    <Percent className="h-4 w-4 text-primary mx-auto" />
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Commission</p>
                    <p className="text-xs font-bold text-white">{selectedMember.commissionRate}</p>
                  </div>
                  <div className="bg-slate-950/80 border border-slate-850 p-3 rounded-2xl text-center space-y-1">
                    <ClipboardCheck className="h-4 w-4 text-primary mx-auto" />
                    <p className="text-[8px] text-slate-500 font-bold uppercase">Attendance</p>
                    <p className="text-xs font-bold text-white">{selectedMember.attendanceRate}</p>
                  </div>
                </div>

                {/* Shifts details */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Weekly Roster & Shift Hours</h4>
                  <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Work Days</p>
                      <div className="flex gap-1.5 mt-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => {
                          const active = selectedMember.schedule.days.includes(day);
                          return (
                            <span 
                              key={day} 
                              className={cn(
                                'text-[8px] px-1.5 py-0.5 rounded font-bold uppercase', 
                                active ? 'bg-primary/25 text-primary' : 'bg-slate-900 text-slate-600'
                              )}
                            >
                              {day.slice(0, 1)}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-slate-500 font-bold uppercase">Shift Hours</p>
                      <p className="font-bold text-white flex items-center gap-1 justify-end mt-1 font-mono text-[10px]">
                        <Clock className="h-3.5 w-3.5 text-primary" /> {selectedMember.schedule.hours}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reviews */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Stylist Client Reviews</h4>
                  <div className="space-y-2">
                    {selectedMember.reviewsList.map((review, i) => (
                      <div key={i} className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-slate-300">{review.author}</span>
                          <span className="text-slate-500">{review.date}</span>
                        </div>
                        <div className="flex text-amber-500 py-0.5">
                          {Array.from({ length: review.rating }).map((_, rIdx) => (
                            <Star key={rIdx} className="h-3 w-3 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 italic">"{review.text}"</p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Roster management button */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <button
                  onClick={() => demoAction(`edit shift roster for ${selectedMember.name}`)}
                  className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Calendar className="h-4 w-4" /> Reschedule Working Shifts
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-500 py-10 text-xs">
              Select a staff member.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
