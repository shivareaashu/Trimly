'use client';

import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';

export default function RegisterPage() {
  const { t } = useTranslation();
  const [salonName, setSalonName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate creation, trial activation, and redirection
    setTimeout(() => {
      window.location.assign('/dashboard');
    }, 1800);
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full bg-surface-bright text-on-surface">
      {/* Left Side: Immersive Visual Panel */}
      <section className="relative w-full md:w-1/2 h-[35vh] md:h-screen overflow-hidden flex flex-col justify-end p-8 md:p-16 lg:p-24">
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury Salon Reception"
            className="w-full h-full object-cover"
            src="/images/reception.png"
          />
          {/* Gold Overlay & Vignette */}
          <div className="absolute inset-0 bg-primary/25 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-medium max-w-lg">
            Start Your 14-Day Free Trial
          </h1>
          <p className="font-sans text-sm md:text-base lg:text-lg text-white/90 max-w-md">
            Activate your luxury digital storefront in minutes. Experience the serenity of world-class salon operations.
          </p>
        </div>
      </section>

      {/* Right Side: Registration Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-[480px] space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.assign('/')}>
              <img alt="Trimly Logo" className="h-8 w-8 object-contain" src="/logo.svg" />
              <span className="font-display text-2xl font-bold text-primary">Trimly</span>
            </div>
            <h2 className="font-display text-3xl font-medium text-on-surface pt-2">Begin Your Journey</h2>
            <p className="font-sans text-sm text-on-surface-variant">No credit card required to experience luxury workspace.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Salon Name */}
              <div className="space-y-2">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="salonName">
                  Salon Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">
                    store
                  </span>
                  <input
                    id="salonName"
                    type="text"
                    required
                    value={salonName}
                    onChange={(e) => setSalonName(e.target.value)}
                    placeholder="The Royal Atelier"
                    className="w-full pl-12 pr-4 py-3 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                  />
                </div>
              </div>

              {/* Owner Full Name */}
              <div className="space-y-2">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="ownerName">
                  Owner Full Name
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">
                    person
                  </span>
                  <input
                    id="ownerName"
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="Vikram Mehta"
                    className="w-full pl-12 pr-4 py-3 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Business Email */}
              <div className="space-y-2">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="email">
                  Business Email
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">
                    mail
                  </span>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="vikram@royalatelier.in"
                    className="w-full pl-12 pr-4 py-3 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                  />
                </div>
              </div>

              {/* Contact Phone */}
              <div className="space-y-2">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="phone">
                  Contact Phone
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">
                    phone
                  </span>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-12 pr-4 py-3 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Create Password */}
            <div className="space-y-2">
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="password">
                Create Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                />
              </div>
            </div>

            {/* Legal terms & notice */}
            <div className="text-[11px] text-on-surface-variant leading-relaxed space-y-1">
              <p>
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </p>
              <p className="text-primary font-medium">
                * Trial status will be set to TRIAL instantly. Verification checks are performed in the background.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/10 flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isSubmitting ? 'Activating Your Trial...' : 'Activate Free Trial'}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="pt-6 text-center space-y-6 border-t border-outline-variant/30">
            <p className="font-sans text-xs text-on-surface-variant">
              Already have a salon registered?{' '}
              <a className="text-primary font-bold hover:underline" href="/login">
                Sign In
              </a>
            </p>
            <div className="flex items-center justify-center gap-6 text-[11px] text-outline">
              <a className="hover:text-on-surface-variant transition-colors" href="#">Privacy Policy</a>
              <span className="w-1 h-1 bg-outline-variant rounded-full"></span>
              <a className="hover:text-on-surface-variant transition-colors" href="#">Support</a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
