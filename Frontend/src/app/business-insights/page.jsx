'use client';

import { useEffect, useState } from 'react';
import { Activity, CalendarDays, ChevronRight, CreditCard, Users, UserRound } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useModuleStore } from '../../store/moduleStore';
import { Badge, Card, CardBody, CardHeader, DataTable, EmptyState, LoadingState, PageHeader, StatCard } from '../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function formatCurrency(value) {
  const number = Number(value || 0);
  return `Rs. ${number.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function RevenueTrend({ data = [] }) {
  const width = 640;
  const height = 220;
  const padding = 24;

  if (!data.length) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-[1.5rem] border border-border bg-background/40 text-sm text-muted-foreground">
        No revenue data yet.
      </div>
    );
  }

  const max = Math.max(...data.map((point) => Number(point.revenue) || 0), 1);
  const stepX = data.length > 1 ? (width - padding * 2) / (data.length - 1) : 0;

  const points = data
    .map((point, index) => {
      const x = padding + index * stepX;
      const y = height - padding - ((Number(point.revenue) || 0) / max) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="rounded-[1.5rem] border border-border bg-card p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">Revenue trend</p>
          <h3 className="mt-1 text-lg font-semibold text-foreground">Revenue trend</h3>
        </div>
        <Badge variant="gold">90 days</Badge>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
        <defs>
          <linearGradient id="trimlyRevenueStroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#f8e7a4" />
            <stop offset="50%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#9a741b" />
          </linearGradient>
        </defs>
        <polyline fill="none" stroke="url(#trimlyRevenueStroke)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" points={points} />
      </svg>
    </div>
  );
}

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [dashboard, setDashboard] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAnalytics() {
      if (!activeTenant?.id || !token) {
        setError(t('analytics_missing_context'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const headers = {
          Authorization: `Bearer ${token}`,
          'x-tenant-id': activeTenant.id,
        };

        const [dashboardResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_BASE}/api/analytics/dashboard`, { headers }),
          fetch(`${API_BASE}/api/bookings?date=${new Date().toISOString().split('T')[0]}`, { headers }),
        ]);

        const dashboardData = await dashboardResponse.json();
        const bookingsData = await bookingsResponse.json();

        if (!dashboardResponse.ok) throw new Error(dashboardData.error || t('analytics_dashboard_load_failed'));
        if (!bookingsResponse.ok) throw new Error(bookingsData.error || t('analytics_upcoming_load_failed'));

        setDashboard(dashboardData);
        setTodayBookings(bookingsData.bookings || []);
      } catch (err) {
        setError(err.message || t('analytics_generic_error'));
      } finally {
        setLoading(false);
      }
    }

    loadAnalytics();
  }, [activeTenant?.id, token, t]);

  if (loading) return <LoadingState label={t('analytics_loading')} />;

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8">
        <EmptyState
          title={t('analytics_unavailable')}
          description={error}
          actionLabel={t('portal_retry')}
          onAction={() => window.location.reload()}
          icon={Activity}
        />
      </div>
    );
  }

  const revenueTrend = dashboard?.charts?.revenue_30_days || [];
  const upcomingRows = todayBookings.slice(0, 5).map((booking) => ({
    id: booking.id,
    customer: `${booking.customer?.firstName || ''} ${booking.customer?.lastName || ''}`.trim(),
    service: booking.service?.name || '-',
    staff: booking.staff?.name || '-',
    time: new Date(booking.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    status: booking.status,
  }));

  const columns = [
    { key: 'customer', header: t('analytics_customer') },
    { key: 'service', header: t('analytics_service') },
    { key: 'staff', header: t('analytics_staff') },
    { key: 'time', header: t('analytics_time') },
    {
      key: 'status',
      header: t('analytics_status'),
      render: (row) => (
        <Badge variant={row.status === 'COMPLETED' ? 'success' : row.status === 'CANCELLED' ? 'danger' : 'gold'}>
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow={t('page_dashboard_title')}
          title={t('page_business_insights_title')}
          description={t('page_business_insights_description')}
          actionLabel={t('home_new_booking')}
          onAction={() => window.location.assign('/booking')}
        >
          <Badge variant="gold">{activeTenant?.name || t('app_name')}</Badge>
        </PageHeader>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('earnings_today')} value={formatCurrency(dashboard?.today?.earnings)} icon={CreditCard} tone="success" />
          <StatCard label={t('page_appointments_title')} value={dashboard?.today?.bookings ?? 0} hint={t('home_upcoming_appointments')} icon={CalendarDays} />
          <StatCard label={t('customers_new')} value={dashboard?.customers_new ?? 0} hint={t('home_new_visitors')} icon={Users} />
          <StatCard label={t('staff_workload')} value={`${dashboard?.average_staff_workload ?? 0}%`} hint={t('home_staff_active')} icon={UserRound} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <RevenueTrend data={revenueTrend} />
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('home_popular_services')}</p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{t('home_popular_services')}</h3>
                </div>
                <Badge variant="gold">Top 5</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {(dashboard?.top_services || []).map((service) => (
                <div key={service.serviceId || service.service} className="rounded-2xl border border-border bg-background/40 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">{service.service}</p>
                    <ChevronRight className="h-4 w-4 text-primary" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{service.bookings} {t('home_bookings_label')}</span>
                    <span>{formatCurrency(service.revenue)}</span>
                  </div>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>

        <DataTable columns={columns} rows={upcomingRows} emptyMessage={t('analytics_empty_upcoming')} />
      </div>
    </main>
  );
}

