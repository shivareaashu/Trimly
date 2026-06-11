'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { cn } from '@/lib/utils';
import { Users, Search, Filter, Plus, Star, Calendar, CreditCard, Clock, MessageSquare, Edit3 } from 'lucide-react';

export default function DemoCustomers() {
  const { customers, demoAction, showToast } = useDemo();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || null);
  const [activeTab, setActiveTab] = useState('overview');
  const [newNote, setNewNote] = useState('');

  // Selected customer details
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  // Filtering
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.phone.includes(searchQuery) || 
                          c.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    // Mutate locally
    if (selectedCustomer) {
      if (!selectedCustomer.notesList) selectedCustomer.notesList = [];
      selectedCustomer.notes = `${newNote}\n\n${selectedCustomer.notes || ''}`;
      selectedCustomer.timeline.unshift({
        id: `t-note-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        type: 'Note Added',
        desc: `Added note: "${newNote}"`
      });
      setNewNote('');
      showToast('Note Added', 'Note saved to customer timeline locally!');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'VIP': return 'bg-primary/20 text-primary border border-primary/30';
      case 'Active': return 'bg-emerald-500/20 text-emerald-400 border border-emerald-550/30';
      case 'Inactive': return 'bg-slate-800 text-slate-400 border border-slate-700';
      case 'New': return 'bg-blue-500/20 text-blue-400 border border-blue-550/30';
      default: return 'bg-slate-700 text-slate-300';
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* CRM Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold font-display text-white tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 text-primary" /> Customer CRM
          </h1>
          <p className="text-sm text-slate-400">
            View loyalty tiers, spent analytics, timeline events, and save client notes.
          </p>
        </div>
        <button
          onClick={() => demoAction('create new customer profile')}
          className="flex items-center gap-2 px-5 py-2 bg-primary text-slate-950 rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Main Splitscreen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Directory List (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden flex flex-col h-[650px]">
          
          {/* List Controls */}
          <div className="p-5 border-b border-slate-850 space-y-4">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search customers by name, phone or email..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:border-primary placeholder-slate-500"
              />
            </div>
            
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {['ALL', 'VIP', 'Active', 'New', 'Inactive'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={cn(
                    'px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all duration-200',
                    statusFilter === status
                      ? 'bg-primary text-slate-950 border-primary'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                  )}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Table Directory */}
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950 text-slate-500 text-[10px] uppercase tracking-wider font-bold border-b border-slate-850 sticky top-0">
                <tr>
                  <th className="px-5 py-3">Client</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Visits</th>
                  <th className="px-5 py-3 text-right">Spend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredCustomers.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomerId(c.id);
                      setActiveTab('overview');
                    }}
                    className={cn(
                      'hover:bg-slate-850/40 cursor-pointer transition-colors',
                      selectedCustomerId === c.id ? 'bg-slate-800/40 border-l-4 border-primary' : ''
                    )}
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-semibold text-white text-xs">{c.name}</p>
                        <p className="text-[10px] text-slate-500">{c.phone}</p>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs font-semibold text-slate-300">
                      {c.visits}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-slate-200 text-xs">
                      ₹{c.totalSpend.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-10 text-slate-500 text-xs">
                      No customers match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Side: Customer Details Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-[32px] p-6 h-[650px] flex flex-col justify-between">
          
          {selectedCustomer ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* Header profile info */}
              <div className="flex justify-between items-start border-b border-slate-800 pb-5">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white tracking-wide">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400 font-medium">{selectedCustomer.email}</p>
                  <p className="text-xs text-slate-500">{selectedCustomer.phone}</p>
                </div>
                
                <div className="flex flex-col items-end gap-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold ${getStatusBadge(selectedCustomer.status)}`}>
                    {selectedCustomer.status}
                  </span>
                  <div className="flex items-center gap-0.5 text-amber-500 font-bold text-xs">
                    <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" /> {selectedCustomer.rating.toFixed(1)}
                  </div>
                </div>
              </div>

              {/* Sub tabs */}
              <div className="flex border-b border-slate-800 my-4 text-xs">
                {['overview', 'timeline', 'appointments', 'payments'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'flex-1 text-center py-2.5 font-bold uppercase tracking-wider border-b-2 transition-all',
                      activeTab === tab 
                        ? 'border-primary text-primary' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    )}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content (Scrollable) */}
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-4 pr-1">
                
                {activeTab === 'overview' && (
                  <div className="space-y-5">
                    
                    {/* Key Stats Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Membership Tier</p>
                        <p className="text-xs font-bold text-white mt-1">{selectedCustomer.membership}</p>
                      </div>
                      <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Loyalty Balance</p>
                        <p className="text-xs font-bold text-primary mt-1">{selectedCustomer.loyaltyPoints} Points</p>
                      </div>
                    </div>

                    {/* Customer Notes */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Styling Preferences & Notes</h4>
                      <div className="bg-slate-950/80 border border-slate-850 rounded-2xl p-4 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-line min-h-[100px]">
                        {selectedCustomer.notes || 'No notes added for this client yet.'}
                      </div>
                    </div>

                    {/* Add note form */}
                    <form onSubmit={handleAddNote} className="space-y-2">
                      <textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add styling notes or service remarks..."
                        rows="3"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3.5 focus:outline-none focus:border-primary placeholder-slate-650 resize-none font-sans"
                      />
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white transition-all text-xs font-bold rounded-xl text-slate-300 uppercase tracking-wider"
                      >
                        Save Note to Profile
                      </button>
                    </form>

                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div className="relative border-l-2 border-slate-800 ml-3.5 pl-6 space-y-6 py-2">
                    {selectedCustomer.timeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        {/* Dot */}
                        <div className="absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full bg-slate-900 border-2 border-primary" />
                        <div className="leading-tight">
                          <span className="text-[10px] text-slate-500 font-bold font-mono">{item.date}</span>
                          <h5 className="font-bold text-xs text-white mt-0.5">{item.type}</h5>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                          {item.amount && (
                            <span className="inline-block mt-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                              ₹{item.amount}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'appointments' && (
                  <div className="space-y-3">
                    {selectedCustomer.appointments.map((ap) => (
                      <div key={ap.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">{ap.service}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {ap.date} with {ap.staff}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                          {ap.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'payments' && (
                  <div className="space-y-3">
                    {selectedCustomer.payments.map((py) => (
                      <div key={py.id} className="p-4 bg-slate-950 border border-slate-850 rounded-2xl flex justify-between items-center">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-white">Invoice #{py.id}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <CreditCard className="h-3 w-3" /> {py.date} via {py.method}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary text-xs">₹{py.amount}</p>
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">{py.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>

              {/* Detail footer conversion button */}
              <div className="border-t border-slate-800 pt-4 mt-2">
                <button
                  onClick={() => demoAction(`dispatch SMS campaign to ${selectedCustomer.name}`)}
                  className="w-full py-3 bg-primary text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" /> Send SMS Promo Notification
                </button>
              </div>

            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs py-10">
              Select a customer to view logs.
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
