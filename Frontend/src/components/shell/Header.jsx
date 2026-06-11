'use client';

import { useState, useEffect } from 'react';
import { Bell, Languages, Moon, Search, UserCircle } from 'lucide-react';
import { Input } from '@/components/forms/Input';
import { Button } from '@/components/ui/Button';
import { useModuleStore } from '@/store/moduleStore';
import { cn } from '@/lib/utils';

import { useTranslation } from '../../hooks/useTranslation';

export function Header({ variant = 'admin' }) {
  const [mounted, setMounted] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const { currentLanguage, changeLanguage } = useTranslation();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!langDropdownOpen) return;
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#language-selector-container')) {
        setLangDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [langDropdownOpen]);

  const user = useModuleStore((s) => s.user);
  const activeTenant = useModuleStore((s) => s.activeTenant);
  const isPlatform = variant === 'superadmin';

  const languagesList = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
    { code: 'mr', label: 'Marathi', nativeLabel: 'मराठी' },
    { code: 'gu', label: 'Gujarati', nativeLabel: 'ગુજરાતી' },
    { code: 'kn', label: 'Kannada', nativeLabel: 'ಕನ್ನಡ' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
    { code: 'te', label: 'Telugu', nativeLabel: 'తెలుగు' },
    { code: 'ml', label: 'Malayalam', nativeLabel: 'മലയാളം' }
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-5 backdrop-blur-xl',
        isPlatform ? 'border-violet-500/10 bg-slate-950/85' : 'border-border/50 bg-background/85'
      )}
    >
      <div className="relative hidden w-full max-w-sm md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="h-10 rounded-xl pl-10" placeholder="Search Trimly" />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl p-0" title="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <div id="language-selector-container" className="relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "h-10 w-10 rounded-xl p-0 transition-colors",
              langDropdownOpen ? "bg-accent/25 text-primary" : ""
            )}
            title="Language"
            onClick={() => setLangDropdownOpen(!langDropdownOpen)}
          >
            <Languages className="h-4 w-4" />
          </Button>

          {langDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-border/80 bg-card p-2 shadow-2xl z-50">
              <div className="px-3 py-2 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Select Language
              </div>
              <div className="mt-1 max-h-64 overflow-y-auto custom-scrollbar space-y-0.5">
                {languagesList.map((lang) => {
                  const isActive = currentLanguage === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={async () => {
                        await changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-colors text-left focus:outline-none",
                        isActive 
                          ? "bg-[#bf8d30]/15 text-[#bf8d30]" 
                          : "text-foreground/85 hover:bg-white/5 hover:text-white"
                      )}
                    >
                      <div className="flex flex-col">
                        <span>{lang.nativeLabel}</span>
                        <span className="text-[10px] text-muted-foreground/80 font-normal">{lang.label}</span>
                      </div>
                      {isActive && (
                        <span className="material-symbols-outlined text-[#bf8d30] text-sm select-none font-bold">check</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl p-0" title="Theme">
          <Moon className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-white/5 px-3 py-2">
          <UserCircle className="h-5 w-5 text-muted-foreground" />
          <div className="hidden leading-tight sm:block">
            <p className="text-xs font-semibold text-foreground">
              {isPlatform ? 'Super Admin' : (mounted && user ? `${user.firstName} ${user.lastName || ''}` : 'Owner')}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {isPlatform ? 'Platform' : (mounted && activeTenant ? activeTenant.name : 'Lumiere Atelier')}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
