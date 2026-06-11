import Link from 'next/link';
import { Plus, UserPlus } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export function DashboardHeader({ userName, appointmentsCount }) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary font-display tracking-tight">
          {t('dashboard_greeting')}, {userName || 'Salon Owner'}
        </h1>
        <p className="font-body-sm text-sm text-muted-foreground mt-1">
          {t('dashboard_subtitle', { count: appointmentsCount })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Link
          href="/customers"
          className="flex items-center gap-2 px-5 py-2.5 border border-border/60 rounded-full text-foreground hover:bg-primary/5 transition-all text-xs font-semibold"
        >
          <UserPlus className="h-4 w-4 text-primary" />
          <span>{t('crm_add_customer')}</span>
        </Link>
        <Link
          href="/appointments"
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-full font-bold shadow-md hover:opacity-90 active:scale-95 transition-all text-xs"
        >
          <Plus className="h-4 w-4" />
          <span>{t('home_new_booking')}</span>
        </Link>
        <div className="h-10 w-10 rounded-full border border-primary/20 overflow-hidden ml-2 hidden sm:block">
          <img 
            className="h-full w-full object-cover" 
            alt="Profile" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBwxXTnJ3NJdiHbRMoboo7s6qON2v2YMqAl4QPpAnQano36wJMeziLitKjRYqgbXpf8nOrUYlrdm7-4Fw-Ck3wMci6T6i7i4xwHqsRV87bO4J0rDjw4vN1M-V5O03b2mOWysxLoib1q_fZItCCGWhridq1rrn15eTvDyvnySvoZqBlZhqsvYXo3qc8BU0Il5Kv6LEduwrYyEBu13YFC0H_DMyAv3t3gKKT1pjPmdKEVIJXvShJFUcSAFrHrm3zpraP8R9mN1kYugGis"
          />
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;
