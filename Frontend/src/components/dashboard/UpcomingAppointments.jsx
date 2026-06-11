import Link from 'next/link';
import { ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

export function UpcomingAppointments({ todayBookings, showMockData, formatTime }) {
  const { t } = useTranslation();

  return (
    <div className="lg:col-span-2 glass-card rounded-[32px] overflow-hidden">
      <div className="p-6 border-b border-border/40 flex justify-between items-center">
        <h2 className="font-headline-md text-2xl text-foreground font-display font-medium">{t('home_upcoming_appointments')}</h2>
        <Link href="/appointments" className="text-primary text-xs font-semibold hover:underline flex items-center gap-1">
          {t('nav_appointments')} <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead className="bg-primary/5 text-muted-foreground text-xs uppercase tracking-wider font-semibold border-b border-border/40">
            <tr>
              <th className="px-6 py-4">{t('analytics_customer') || 'Client'}</th>
              <th className="px-6 py-4">{t('booking_service') || 'Service'}</th>
              <th className="px-6 py-4">{t('analytics_time') || 'Time'}</th>
              <th className="px-6 py-4">{t('analytics_status') || 'Status'}</th>
              <th className="px-6 py-4 text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-sm">
            {!showMockData && todayBookings.length > 0 ? (
              todayBookings.map((booking, i) => {
                const initials = `${booking.customer?.firstName?.[0] || 'C'}${booking.customer?.lastName?.[0] || 'U'}`;
                const borderColors = ['border-primary', 'border-amber-500', 'border-teal-500', 'border-rose-500'];
                const borderColor = borderColors[i % borderColors.length];

                return (
                  <tr key={booking.id} className="hover:bg-primary/5 transition-colors border-b border-border/10">
                    <td className="px-6 py-4.5">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{booking.customer?.firstName} {booking.customer?.lastName}</p>
                          <p className="text-xs text-muted-foreground">Client ID: #{booking.customer?.id?.slice(0, 5)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className={`px-3 py-1 bg-primary/5 border-l-4 ${borderColor} rounded-r-lg text-xs font-medium text-foreground inline-block`}>
                        {booking.service?.name || 'Custom Care'}
                      </span>
                    </td>
                    <td className="px-6 py-4.5">
                      <p className="font-bold text-foreground">{formatTime(booking.startTime)}</p>
                      <p className="text-xs text-muted-foreground">{booking.service?.duration || 30} mins</p>
                    </td>
                    <td className="px-6 py-4.5">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className={`h-2.5 w-2.5 rounded-full ${
                          booking.status === 'COMPLETED' ? 'bg-emerald-400' :
                          booking.status === 'CONFIRMED' ? 'bg-primary shadow-[0_0_8px_rgba(212,175,55,0.4)]' :
                          booking.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-amber-400'
                        }`} />
                        <span className="capitalize text-muted-foreground font-semibold">{booking.status?.toLowerCase()}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg">
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <>
                <tr className="hover:bg-primary/5 transition-colors border-b border-border/10">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        AM
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Ananya Malhotra</p>
                        <p className="text-xs text-muted-foreground">Membership: Elite</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="px-3 py-1 bg-primary/5 border-l-4 border-primary rounded-r-lg text-xs font-medium text-foreground inline-block">
                      Global Color + Spa
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <p className="font-bold text-foreground">11:30 AM</p>
                    <p className="text-xs text-muted-foreground">2h 30m</p>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="flex items-center gap-1.5 text-xs text-primary">
                      <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> Confirmed
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors border-b border-border/10">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-slate-500/10 text-slate-700 flex items-center justify-center font-bold text-xs">
                        RK
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Rohan Kapoor</p>
                        <p className="text-xs text-muted-foreground">First-time Visit</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="px-3 py-1 bg-primary/5 border-l-4 border-slate-500 rounded-r-lg text-xs font-medium text-foreground inline-block">
                      Signature Haircut
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <p className="font-bold text-foreground">12:45 PM</p>
                    <p className="text-xs text-muted-foreground">45m</p>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="h-2 w-2 rounded-full bg-muted-foreground/40" /> Checked In
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
                <tr className="hover:bg-primary/5 transition-colors">
                  <td className="px-6 py-4.5">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                        SP
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Sana Patel</p>
                        <p className="text-xs text-muted-foreground">Membership: Silver</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="px-3 py-1 bg-primary/5 border-l-4 border-amber-500 rounded-r-lg text-xs font-medium text-foreground inline-block">
                      Bridal Consultation
                    </span>
                  </td>
                  <td className="px-6 py-4.5">
                    <p className="font-bold text-foreground">02:15 PM</p>
                    <p className="text-xs text-muted-foreground">1h</p>
                  </td>
                  <td className="px-6 py-4.5">
                    <span className="flex items-center gap-1.5 text-xs text-amber-500">
                      <span className="h-2 w-2 rounded-full bg-amber-500" /> Pending
                    </span>
                  </td>
                  <td className="px-6 py-4.5 text-right">
                    <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UpcomingAppointments;
