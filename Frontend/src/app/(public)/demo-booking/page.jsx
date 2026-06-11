'use client';

import { useState } from 'react';
import { 
  Sparkles, Calendar, User, Clock, ArrowRight, ArrowLeft,
  CheckCircle, Scissors, AlertCircle, ShieldCheck
} from 'lucide-react';

const MOCK_SERVICES = [
  { id: '1', name: 'Balayage Hair Painting', duration: '120 mins', price: '₹4,500', desc: 'Individually hand-painted highlights for a natural, sun-kissed look.' },
  { id: '2', name: 'Signature Cut & Blowout', duration: '60 mins', price: '₹1,800', desc: 'Custom creative scissor work followed by our signature volume blowout.' },
  { id: '3', name: 'Olplex Restructuring Treatment', duration: '45 mins', price: '₹2,200', desc: 'Bond-rebuilding treatment for damaged, chemically treated hair.' },
];

const MOCK_STAFF = [
  { id: '1', name: 'Vikram Mehta', role: 'Creative Director', image: 'V' },
  { id: '2', name: 'Riya Sen', role: 'Senior Stylist', image: 'R' },
  { id: '3', name: 'Karan Malhotra', role: 'Color Expert', image: 'K' },
];

const MOCK_TIMES = [
  '09:00 AM', '10:30 AM', '11:00 AM', '01:30 PM', '02:00 PM', '04:30 PM'
];

export default function DemoBooking() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [showDemoModal, setShowDemoModal] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleConfirmClick = (e) => {
    e.preventDefault();
    setShowDemoModal(true);
  };

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 py-12 px-6 flex items-center justify-center">
      <div className="w-full max-w-2xl bg-white border border-stone-200 shadow-xl rounded-[2.5rem] overflow-hidden flex flex-col min-h-[500px]">
        {/* Progress header */}
        <div className="bg-stone-50 border-b border-stone-200/60 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Scissors className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-stone-800 font-display">The Atelier Suite Booking</h2>
              <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest leading-none mt-1">Light Luxury Concept</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            Step {step} of 4
          </span>
        </div>

        {/* Booking Wizard content */}
        <div className="flex-1 p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-display font-semibold text-stone-800">Select Service</h3>
                <p className="text-xs text-stone-500 mt-1">Choose a premium treatment or style consultation.</p>
              </div>

              <div className="space-y-3">
                {MOCK_SERVICES.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedService(s)}
                    className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex justify-between items-center ${
                      selectedService?.id === s.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="space-y-1 pr-4">
                      <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">{s.duration}</span>
                      <span className="text-sm font-semibold text-stone-800 block">{s.name}</span>
                      <p className="text-xs text-stone-500">{s.desc}</p>
                    </div>
                    <span className="text-sm font-bold text-primary font-display whitespace-nowrap">{s.price}</span>
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedService}
                onClick={nextStep}
                className="w-full mt-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white font-medium py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-stone-800 hover:to-stone-700 transition disabled:opacity-50"
              >
                Choose Stylist <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-stone-500 hover:text-stone-800 cursor-pointer text-xs w-fit" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" /> Back to Services
              </div>

              <div>
                <h3 className="text-xl font-display font-semibold text-stone-800">Select Staff</h3>
                <p className="text-xs text-stone-500 mt-1">Choose a creative director or dedicated stylist.</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {MOCK_STAFF.map(st => (
                  <button
                    key={st.id}
                    onClick={() => setSelectedStaff(st)}
                    className={`p-5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-3 ${
                      selectedStaff?.id === st.id
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-stone-200 hover:border-stone-400 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {st.image}
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-stone-800 block">{st.name}</span>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider">{st.role}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button
                disabled={!selectedStaff}
                onClick={nextStep}
                className="w-full mt-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white font-medium py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-stone-800 hover:to-stone-700 transition disabled:opacity-50"
              >
                Select Time Slot <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-stone-500 hover:text-stone-800 cursor-pointer text-xs w-fit" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" /> Back to Staff
              </div>

              <div>
                <h3 className="text-xl font-display font-semibold text-stone-800">Choose Date & Time</h3>
                <p className="text-xs text-stone-500 mt-1">Select an open slot in the stylist's planner.</p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Select Date</span>
                  <input
                    type="date"
                    required
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:border-primary outline-none transition"
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Available Slots</span>
                  <div className="grid grid-cols-3 gap-2">
                    {MOCK_TIMES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTime(t)}
                        className={`py-3.5 rounded-xl border text-center text-xs font-semibold transition ${
                          selectedTime === t
                            ? 'border-primary bg-primary/5 text-primary'
                            : 'border-stone-200 hover:border-stone-400 text-stone-700'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                disabled={!selectedDate || !selectedTime}
                onClick={nextStep}
                className="w-full mt-6 bg-gradient-to-r from-stone-900 to-stone-800 text-white font-medium py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:from-stone-800 hover:to-stone-700 transition disabled:opacity-50"
              >
                Enter Personal Details <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {step === 4 && (
            <form onSubmit={handleConfirmClick} className="space-y-6">
              <div className="flex items-center gap-2 text-stone-500 hover:text-stone-800 cursor-pointer text-xs w-fit" onClick={prevStep}>
                <ArrowLeft className="h-4 w-4" /> Back to Time
              </div>

              <div>
                <h3 className="text-xl font-display font-semibold text-stone-800">Your Details</h3>
                <p className="text-xs text-stone-500 mt-1">Provide contact info to secure the appointment.</p>
              </div>

              <div className="space-y-4">
                <label className="block space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Full Name</span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Anya Roy"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:border-primary outline-none transition"
                  />
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Email Address</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="anya@example.com"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:border-primary outline-none transition"
                    />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Phone Number</span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-800 focus:border-primary outline-none transition"
                    />
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium py-4 px-4 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:from-amber-500 hover:to-amber-400 transition"
              >
                <ShieldCheck className="h-4.5 w-4.5" /> Confirm Appointment
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Demo overlay modal */}
      {showDemoModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className="bg-white border border-stone-200 rounded-[2.5rem] max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="h-16 w-16 bg-amber-500/10 text-amber-600 flex items-center justify-center rounded-full mx-auto">
              <Sparkles className="h-8 w-8 animate-bounce" />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-display font-semibold text-stone-800">Experience Trimly Live</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                This is a simulation of our customer-facing booking engine. In the real system, completing this booking sends WhatsApp confirmations, updates calendars, and schedules payouts instantly.
              </p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-left space-y-1">
              <span className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Mock Appointment Summary</span>
              <p className="text-xs font-semibold text-stone-800">{selectedService?.name} with {selectedStaff?.name}</p>
              <p className="text-[10px] text-stone-500">{selectedDate} at {selectedTime}</p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => window.location.assign('/register')}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium py-3 px-4 rounded-xl text-xs uppercase tracking-wider hover:from-amber-500 hover:to-amber-400 transition shadow-lg shadow-amber-500/10"
              >
                Start Free Trial
              </button>
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  setStep(1);
                }}
                className="w-full bg-stone-100 hover:bg-stone-200/80 text-stone-700 font-medium py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition"
              >
                Close Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
