'use client';

import React, { useState } from 'react';
import { useDemo } from '@/demo/DemoContext';
import { Sparkles, Calendar, User, Clock, ArrowRight, ArrowLeft, CheckCircle, Info, Star } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DemoBooking() {
  const { salon, addAppointment, showToast } = useDemo();
  
  // Wizard steps: 'welcome', 'service', 'stylist', 'datetime', 'details', 'review', 'success'
  const [step, setStep] = useState('welcome');
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState('2026-06-08');
  const [selectedTime, setSelectedTime] = useState('11:00 AM');
  
  // Details form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Fast-path lookup simulated
  const [fastPathUsed, setFastPathUsed] = useState(false);

  const handleLookup = () => {
    if (phone.includes('98199') || phone.includes('98210') || firstName.toLowerCase() === 'aditi') {
      setFirstName('Aditi');
      setLastName('Rao');
      setEmail('aditi.rao@gmail.com');
      setPhone('+91 98199 87654');
      setFastPathUsed(true);
      showToast('Client Recognized', 'VIP Platinum Tier member profile loaded automatically!');
    } else {
      showToast('Client Lookup', 'No existing client found with that number. Creating new profile.');
    }
  };

  const handleConfirm = () => {
    // Add locally to demo context
    addAppointment({
      customerName: `${firstName} ${lastName}` || 'Guest Client',
      serviceName: selectedService?.name || 'Custom Care',
      price: selectedService?.price || 0,
      duration: selectedService?.duration || 30,
      staffId: selectedStylist?.id || 'st1',
      staffName: selectedStylist?.name || 'Any Stylist',
      startTime: selectedTime,
      date: selectedDate,
      status: 'CONFIRMED'
    });
    setStep('success');
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl p-6 md:p-8 space-y-6">
      
      {/* Wizard Step Progress bar */}
      {step !== 'welcome' && step !== 'success' && (
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <span>Step {step === 'service' ? '1' : step === 'stylist' ? '2' : step === 'datetime' ? '3' : step === 'details' ? '4' : '5'} of 5</span>
            <span className="text-primary font-mono capitalize">{step} Selection</span>
          </div>
          <div className="h-1.5 bg-slate-950 border border-slate-850 rounded-full flex overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{
                width: step === 'service' ? '20%' : 
                       step === 'stylist' ? '40%' : 
                       step === 'datetime' ? '60%' : 
                       step === 'details' ? '80%' : '100%'
              }}
            />
          </div>
        </div>
      )}

      {/* STEP 0: Welcome */}
      {step === 'welcome' && (
        <div className="text-center space-y-6 py-6">
          <div className="h-14 w-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mx-auto border border-primary/20">
            ✨
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold font-display text-white tracking-tight">Lumière Atelier Mumbai</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Experience the booking wizard flow. Book your salon service appointment in under 60 seconds.
            </p>
          </div>
          <button
            onClick={() => setStep('service')}
            className="w-full max-w-xs py-3 bg-primary text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 mx-auto"
          >
            Book Appointment <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* STEP 1: Choose Service */}
      {step === 'service' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Select Service</h3>
            <p className="text-xs text-slate-400">Choose from our signature haircutting, coloring or spa catalogs.</p>
          </div>
          
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {salon.services.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedService(s)}
                className={cn(
                  'p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center',
                  selectedService?.id === s.id 
                    ? 'border-primary bg-slate-950/60' 
                    : 'border-slate-800 hover:border-slate-700 bg-slate-950/20'
                )}
              >
                <div>
                  <h4 className="font-bold text-xs text-white">{s.name}</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">{s.description}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-primary text-xs">₹{s.price}</p>
                  <p className="text-[9px] text-slate-500 font-medium">{s.duration} min</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button onClick={() => setStep('welcome')} className="text-slate-500 hover:text-slate-350 text-xs font-bold uppercase tracking-wider">
              Cancel
            </button>
            <button
              onClick={() => setStep('stylist')}
              disabled={!selectedService}
              className="px-5 py-2.5 bg-primary text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-1"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Choose Stylist */}
      {step === 'stylist' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Select Stylist</h3>
            <p className="text-xs text-slate-400">Select a senior artist or opt for the first available stylist.</p>
          </div>

          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
            {/* Any Available option */}
            <div
              onClick={() => setSelectedStylist({ id: 'any', name: 'First Available Stylist' })}
              className={cn(
                'p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center',
                selectedStylist?.id === 'any' ? 'border-primary bg-slate-950/60' : 'border-slate-800 bg-slate-950/20'
              )}
            >
              <div>
                <h4 className="font-bold text-xs text-white">First Available Stylist</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Recommended for fast scheduling</p>
              </div>
              <Sparkles className="h-4.5 w-4.5 text-primary shrink-0" />
            </div>

            {salon.staff.map((s) => (
              <div
                key={s.id}
                onClick={() => setSelectedStylist(s)}
                className={cn(
                  'p-4 border rounded-2xl cursor-pointer transition-all flex justify-between items-center',
                  selectedStylist?.id === s.id ? 'border-primary bg-slate-950/60' : 'border-slate-800 bg-slate-950/20'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                    <img src={s.avatar} className="h-full w-full object-cover" alt={s.name} />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{s.name}</h4>
                    <p className="text-[10px] text-slate-450 mt-0.5">{s.role}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500 shrink-0">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> {s.rating.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button onClick={() => setStep('service')} className="text-slate-500 hover:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={() => setStep('datetime')}
              disabled={!selectedStylist}
              className="px-5 py-2.5 bg-primary text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-1"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Date & Time */}
      {step === 'datetime' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Select Date & Time</h3>
            <p className="text-xs text-slate-400">Choose your preferred timing for booking.</p>
          </div>

          <div className="space-y-4">
            {/* Simple date selection row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { date: '2026-06-08', day: 'Mon', label: 'June 8' },
                { date: '2026-06-09', day: 'Tue', label: 'June 9' },
                { date: '2026-06-10', day: 'Wed', label: 'June 10' }
              ].map(d => (
                <div
                  key={d.date}
                  onClick={() => setSelectedDate(d.date)}
                  className={cn(
                    'p-3.5 border rounded-2xl text-center cursor-pointer transition-all',
                    selectedDate === d.date ? 'border-primary bg-slate-950' : 'border-slate-850 bg-slate-950/20'
                  )}
                >
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{d.day}</p>
                  <p className="text-xs font-bold text-white mt-1">{d.label}</p>
                </div>
              ))}
            </div>

            {/* Time slots */}
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">Available Shifts</p>
              <div className="grid grid-cols-4 gap-2.5">
                {['10:00 AM', '11:30 AM', '01:00 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'].map((t) => (
                  <div
                    key={t}
                    onClick={() => setSelectedTime(t)}
                    className={cn(
                      'py-2 border rounded-xl text-center cursor-pointer transition-all text-[10px] font-bold',
                      selectedTime === t ? 'border-primary bg-slate-950 text-primary' : 'border-slate-850 text-slate-400 bg-slate-950/10'
                    )}
                  >
                    {t}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button onClick={() => setStep('stylist')} className="text-slate-500 hover:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={() => setStep('details')}
              disabled={!selectedTime}
              className="px-5 py-2.5 bg-primary text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-1"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Client Details */}
      {step === 'details' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Contact Details</h3>
            <p className="text-xs text-slate-400">Identify yourself. Enter phone ending in "87654" to trigger VIP lookup.</p>
          </div>

          {/* Details input form */}
          <div className="space-y-4">
            
            {/* Phone (with lookup option) */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Mobile Number</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. +91 98199 87654"
                  className="flex-1 bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary font-mono"
                />
                <button
                  type="button"
                  onClick={handleLookup}
                  className="px-4 bg-slate-950 border border-slate-800 hover:border-primary text-slate-300 text-xs font-bold rounded-xl uppercase transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>

            {/* Names */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase">First Name</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-slate-500 uppercase">Last Name</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-slate-500 uppercase">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-primary"
              />
            </div>

            {fastPathUsed && (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex gap-2 items-center text-[10px] text-primary">
                <Info className="h-4 w-4 shrink-0" />
                <span>Fast-path verified. VIP discounts will be automatically computed in summary.</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button onClick={() => setStep('datetime')} className="text-slate-500 hover:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={() => setStep('review')}
              disabled={!firstName || !phone}
              className="px-5 py-2.5 bg-primary text-slate-950 disabled:bg-slate-800 disabled:text-slate-600 rounded-xl font-bold uppercase tracking-wider text-xs flex items-center gap-1"
            >
              Review Booking <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Review */}
      {step === 'review' && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-white tracking-wide">Review & Confirm</h3>
            <p className="text-xs text-slate-400">Review selected details before reserving slot.</p>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-5 rounded-2xl space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <span className="text-slate-500 font-semibold">Service Selected</span>
              <span className="font-bold text-white">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <span className="text-slate-500 font-semibold">Stylist Assigned</span>
              <span className="font-bold text-white">{selectedStylist?.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <span className="text-slate-500 font-semibold">Schedule Time</span>
              <span className="font-bold text-primary font-mono">{selectedDate} @ {selectedTime}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <span className="text-slate-500 font-semibold">Client Name</span>
              <span className="font-bold text-white">{firstName} {lastName}</span>
            </div>
            
            <div className="flex justify-between items-center pt-2 text-sm">
              <span className="text-slate-300 font-bold uppercase text-xs">Total Bill Value</span>
              <span className="font-bold text-primary text-base">
                {fastPathUsed ? (
                  <>
                    <span className="line-through text-slate-600 text-xs mr-2">₹{selectedService?.price}</span>
                    ₹{(selectedService?.price * 0.9).toFixed(0)}
                  </>
                ) : (
                  `₹${selectedService?.price}`
                )}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <button onClick={() => setStep('details')} className="text-slate-500 hover:text-slate-350 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" /> Back
            </button>
            <button
              onClick={handleConfirm}
              className="px-6 py-2.5 bg-primary text-slate-950 rounded-xl font-bold uppercase tracking-wider text-xs shadow-md"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: Success */}
      {step === 'success' && (
        <div className="text-center space-y-6 py-6 animate-scale-up">
          <div className="h-16 w-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-3xl mx-auto border border-emerald-500/20">
            <CheckCircle className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-white font-display">Booking Complete!</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              Appointment scheduled for <span className="text-white font-bold">{selectedDate} @ {selectedTime}</span>.
              A simulated SMS confirmation receipt was sent to {phone}.
            </p>
          </div>

          <div className="bg-slate-950 p-4 border border-slate-850 rounded-2xl text-[10px] text-slate-400 text-center max-w-md mx-auto">
            🚀 <strong>Demo Mode only:</strong> Client booking details were successfully recorded to local React state ledger.
          </div>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => {
                // reset
                setStep('welcome');
                setSelectedService(null);
                setSelectedStylist(null);
                setFirstName('');
                setLastName('');
                setPhone('');
                setEmail('');
                setFastPathUsed(false);
              }}
              className="px-5 py-2.5 border border-slate-800 hover:border-slate-650 text-slate-300 text-xs font-bold rounded-xl uppercase transition-colors shrink-0"
            >
              Book Another
            </button>
            
            <Link
              href="/register"
              className="px-5 py-2.5 bg-primary text-slate-950 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg hover:opacity-90 active:scale-95 transition-all text-center shrink-0"
            >
              Start Free Trial Now
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
