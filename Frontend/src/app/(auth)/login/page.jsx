'use client';

import { useState } from 'react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '@/store/moduleStore';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const login = useModuleStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      // Save session inside store & localStorage
      login(data);

      // Redirect to workspace dashboard
      window.location.assign('/dashboard');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex flex-col md:flex-row min-h-screen w-full bg-surface-bright text-on-surface">
      {/* Left Side: Immersive Visual Panel */}
      <section className="relative w-full md:w-1/2 h-[35vh] md:h-screen overflow-hidden flex flex-col justify-end p-8 md:p-16 lg:p-24">
        <div className="absolute inset-0 z-0">
          <img
            alt="Luxury Salon Service"
            className="w-full h-full object-cover"
            src="/images/salon_interior.png"
          />
          {/* Gold Overlay & Vignette */}
          <div className="absolute inset-0 bg-primary/25 mix-blend-multiply"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        </div>
        <div className="relative z-10 space-y-4">
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white leading-tight font-medium max-w-lg">
            Elevate your atelier experience.
          </h1>
          <p className="font-sans text-sm md:text-base lg:text-lg text-white/90 max-w-md">
            Seamless management for the world's most distinguished salons and spas.
          </p>
        </div>
      </section>

      {/* Right Side: Login Form */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-6 sm:p-12 md:p-16 lg:p-24 bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-[420px] space-y-10">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.assign('/')}>
              <img alt="Trimly Logo" className="h-8 w-8 object-contain" src="/logo.svg" />
              <span className="font-display text-2xl font-bold text-primary">Trimly</span>
            </div>
            <h2 className="font-display text-3xl font-medium text-on-surface pt-4">Welcome back</h2>
            <p className="font-sans text-sm text-on-surface-variant">Please enter your credentials to access your dashboard.</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-2xl text-rose-400 text-xs font-semibold leading-relaxed">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="email">
                Email Address
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
                  placeholder="atelier@trimly.com"
                  className="w-full pl-12 pr-4 py-4 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-sans text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/80" htmlFor="password">
                  Password
                </label>
                <a className="font-sans text-[11px] font-bold text-primary hover:underline transition-all" href="#">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px] select-none">
                  lock
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-4 bg-surface border-b border-outline-variant focus:border-primary focus:ring-0 transition-colors duration-300 font-sans text-on-surface outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors flex items-center justify-center"
                >
                  <span className="material-symbols-outlined text-[20px] select-none">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <input
                id="remember"
                type="checkbox"
                className="peer h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary/20 transition-all cursor-pointer bg-surface"
              />
              <label
                htmlFor="remember"
                className="font-sans text-xs text-on-surface-variant cursor-pointer group-hover:text-on-surface transition-colors select-none"
              >
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-md shadow-primary/10 flex items-center justify-center gap-2.5 disabled:opacity-50"
              >
                {isSubmitting ? 'Verifying Credentials...' : 'Login to Dashboard'}
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="pt-6 text-center space-y-6 border-t border-outline-variant/30">
            <p className="font-sans text-xs text-on-surface-variant">
              Don't have an account?{' '}
              <a className="text-primary font-bold hover:underline" href="/register">
                Start Free Trial
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
