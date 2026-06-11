import { IndianRupee, Calendar, Users, Clock, TrendingUp } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export function MetricsGrid({ todayEarnings, appointmentsTotal, appointmentsRemaining, newCustomersStr, staffWorkingStr }) {
  const { t } = useTranslation();

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Earnings Card */}
      <div className="glass-card p-6 rounded-3xl group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <IndianRupee className="h-5 w-5" />
          </div>
          <span className="text-emerald-600 flex items-center gap-0.5 text-xs font-semibold">
            <TrendingUp className="h-3.5 w-3.5" /> +12.5%
          </span>
        </div>
        <p className="font-label-md text-xs text-muted-foreground uppercase tracking-widest font-sans font-semibold">
          {t('earnings_today')}
        </p>
        <h3 className="font-headline-lg text-3xl text-foreground font-display mt-2 font-bold">
          {todayEarnings}
        </h3>
      </div>

      {/* Appointments Card */}
      <div className="glass-card p-6 rounded-3xl group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Calendar className="h-5 w-5" />
          </div>
          <div className="text-primary text-xs font-semibold px-2.5 py-1 bg-primary/15 rounded-lg">
            {appointmentsRemaining} {t('dashboard_remaining')}
          </div>
        </div>
        <p className="font-label-md text-xs text-muted-foreground uppercase tracking-widest font-sans font-semibold">
          {t('nav_appointments')}
        </p>
        <h3 className="font-headline-lg text-3xl text-foreground font-display mt-2 font-bold">
          {appointmentsTotal} {t('dashboard_total')}
        </h3>
      </div>

      {/* New Customers Card */}
      <div className="glass-card p-6 rounded-3xl group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-primary text-xs font-semibold px-2.5 py-1 bg-primary/15 rounded-lg">
            +4 New
          </span>
        </div>
        <p className="font-label-md text-xs text-muted-foreground uppercase tracking-widest font-sans font-semibold">
          {t('customers_new')}
        </p>
        <h3 className="font-headline-lg text-3xl text-foreground font-display mt-2 font-bold">
          {newCustomersStr}
        </h3>
      </div>

      {/* Staff Working Card */}
      <div className="glass-card p-6 rounded-3xl group hover:border-primary/50 transition-all duration-300 relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 text-primary rounded-2xl">
            <Clock className="h-5 w-5" />
          </div>
          <div className="flex -space-x-2">
            <div className="h-6 w-6 rounded-full border border-background bg-slate-400 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwLkqEuQ1taMYcEkbLrIJj8vmJUuExlzLvA6HWOkgl6-1aLGUxhQp040p2LRSaQmJp7IXGcvTvUW_gCt4aC1gY0v90QmTySfxSGo7N4kYE9bdEKAmCZBgIl2R8sTHfsEHCazeqKuX7tj43ZTaG1VIou6VQvIcqzVBmhysHbHq3n2OhX_wOO__AI5EpxE73KmG2b_uJS0itxEwr7CjoR36p9KZD3IRoXEr1Z8mBNdUmrF0uW7Bw0qDIpQTBDTOVT9MIpljs0IlNg2__" className="h-full w-full object-cover" alt="Staff 1" />
            </div>
            <div className="h-6 w-6 rounded-full border border-background bg-slate-500 overflow-hidden">
              <img src="https://lh3.googleusercontent.com/aida-public/AB6AXu3ne7f3gj2k1x87lau-AEwQdDR3OpDcsrr57GmWeVS5queQtxYz7NSJ0WoFoOV30myyWXXHUokwyNR-wPYS-VJXPm_WaFZZ-hLui0SKEil2eT-xHkv3X5x1r6fpTNwzp5g_gbORNbSQMvDwiUw6LZB3E8AzkQLHIfCj8VYAHcXtD6H17d8PfYGtDjy5i3UZaBqFE96uiLH30s06zvSqC3zIsDEHG39l0OCOUgaTx2lwCjXy1cWnMCLrRvuUQ2TrpS5MDJzbhe6CDfp" className="h-full w-full object-cover" alt="Staff 2" />
            </div>
          </div>
        </div>
        <p className="font-label-md text-xs text-muted-foreground uppercase tracking-widest font-sans font-semibold">
          {t('home_staff_active')}
        </p>
        <h3 className="font-headline-lg text-3xl text-foreground font-display mt-2 font-bold">
          {staffWorkingStr}
        </h3>
      </div>
    </section>
  );
}

export default MetricsGrid;
