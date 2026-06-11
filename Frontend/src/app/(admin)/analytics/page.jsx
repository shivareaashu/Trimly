'use client';

import { useState, useEffect } from 'react';
import { Award, DollarSign, Calendar, TrendingUp, Users, RefreshCw, BarChart2, Star, Trophy, Clock } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '../../../store/moduleStore';
import {
  Badge,
  Card,
  CardBody,
  CardHeader,
  DataTable,
  PageHeader,
  Button,
  StatCard,
} from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export default function AnalyticsPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);

  const [performance, setPerformance] = useState([]);
  const [services, setServices] = useState({ top_services: [], least_used_services: [] });
  const [loading, setLoading] = useState(true);

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadAnalytics = async () => {
    if (!activeTenant?.id || !token) return;
    try {
      setLoading(true);
      const [perfRes, svcRes] = await Promise.all([
        fetch(`${API_BASE}/api/analytics/staff-performance`, { headers }),
        fetch(`${API_BASE}/api/analytics/services`, { headers }),
      ]);

      if (perfRes.ok) {
        const perfData = await perfRes.json();
        setPerformance(perfData.staff_performance || []);
      }
      if (svcRes.ok) {
        const svcData = await svcRes.json();
        setServices(svcData || { top_services: [], least_used_services: [] });
      }
    } catch (err) {
      console.error('Error loading analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [activeTenant?.id, token]);

  const formatCurrency = (val) => `Rs. ${Number(val || 0).toLocaleString('en-IN')}`;

  // Find top stylist based on revenue
  const topRevenueStylist = [...performance].sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue)[0];
  // Find top stylist based on attendance (presentDays)
  const topAttendanceStylist = [...performance].sort((a, b) => b.metrics.attendance.presentDays - a.metrics.attendance.presentDays)[0];
  // Find top average ticket size
  const topAvgBillStylist = [...performance].sort((a, b) => b.metrics.averageBillValue - a.metrics.averageBillValue)[0];

  const tableColumns = [
    { key: 'staffName', header: 'Stylist', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs uppercase">
          {row.staffName.substring(0, 2)}
        </div>
        <div>
          <span className="font-semibold block text-stone-200">{row.staffName}</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
            {row.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    )},
    { key: 'totalRevenue', header: 'Total Revenue', render: (row) => formatCurrency(row.metrics.totalRevenue) },
    { key: 'appointmentsCount', header: 'Bookings Serviced', render: (row) => `${row.metrics.appointmentsCount} bookings` },
    { key: 'averageBillValue', header: 'Average Ticket', render: (row) => formatCurrency(row.metrics.averageBillValue) },
    { 
      key: 'attendance', 
      header: 'Attendance Summary', 
      render: (row) => (
        <div className="flex gap-1.5 flex-wrap">
          <Badge variant="success">Pres: {row.metrics.attendance.presentDays}</Badge>
          {row.metrics.attendance.lateDays > 0 && <Badge variant="gold">Late: {row.metrics.attendance.lateDays}</Badge>}
          {row.metrics.attendance.absentDays > 0 && <Badge variant="danger">Abs: {row.metrics.attendance.absentDays}</Badge>}
          {row.metrics.attendance.leaveDays > 0 && <Badge variant="default">Leave: {row.metrics.attendance.leaveDays}</Badge>}
        </div>
      )
    },
    { key: 'workingHours', header: 'Hours Logged', render: (row) => `${row.metrics.attendance.totalHours} hrs` },
  ];

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow={t('performance_insights')}
          title={t('stylist_performance_rankings')}
          description="Track staff performance, gross revenues generated, client tickets, and active schedule utilization."
        >
          <Button variant="outline" size="sm" onClick={loadAnalytics} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Sync Stats
          </Button>
        </PageHeader>

        {/* Top Performers Highlights */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topRevenueStylist ? (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/10 to-transparent relative overflow-hidden">
              <CardBody className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/20 text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-widest block">{t('revenue_leader')}</span>
                  <span className="text-lg font-bold text-white mt-0.5 block font-display">{topRevenueStylist.staffName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Generated {formatCurrency(topRevenueStylist.metrics.totalRevenue)}
                  </span>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-border/60"><CardBody className="text-xs text-muted-foreground">No revenue details yet</CardBody></Card>
          )}

          {topAvgBillStylist ? (
            <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent relative overflow-hidden">
              <CardBody className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                  <Star className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">{t('highest_ticket_size')}</span>
                  <span className="text-lg font-bold text-white mt-0.5 block font-display">{topAvgBillStylist.staffName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    Avg. ticket of {formatCurrency(topAvgBillStylist.metrics.averageBillValue)}
                  </span>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-border/60"><CardBody className="text-xs text-muted-foreground">No average bill details yet</CardBody></Card>
          )}

          {topAttendanceStylist ? (
            <Card className="border-zinc-500/20 bg-gradient-to-br from-zinc-500/5 to-transparent relative overflow-hidden">
              <CardBody className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-500/20 text-stone-300">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest block">{t('attendance_champion')}</span>
                  <span className="text-lg font-bold text-white mt-0.5 block font-display">{topAttendanceStylist.staffName}</span>
                  <span className="text-xs text-muted-foreground mt-0.5 block">
                    {topAttendanceStylist.metrics.attendance.presentDays} days present ({topAttendanceStylist.metrics.attendance.totalHours} hrs)
                  </span>
                </div>
              </CardBody>
            </Card>
          ) : (
            <Card className="border-border/60"><CardBody className="text-xs text-muted-foreground">No attendance logs yet</CardBody></Card>
          )}
        </div>

        {/* Performance Leaderboard Table */}
        <div className="grid gap-6">
          <DataTable
            columns={tableColumns}
            rows={[...performance].sort((a, b) => b.metrics.totalRevenue - a.metrics.totalRevenue)}
            emptyMessage="No stylist statistics available. Make sure stylists are clocked in and bookings are paid."
          />
        </div>

        {/* Popular Services Insights */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Services */}
          <Card>
            <CardHeader className="border-b border-border/60 bg-white/3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> {t('most_popular_services')}
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {(services.top_services || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">No service metrics recorded.</p>
              ) : (
                services.top_services.map((item, idx) => (
                  <div key={item.serviceId} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-stone-200">{item.serviceName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">{item.bookings_count} bookings</span>
                      <span className="text-[10px] text-muted-foreground">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>

          {/* Least Used Services */}
          <Card>
            <CardHeader className="border-b border-border/60 bg-white/3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Award className="h-4 w-4 text-primary" /> {t('services_needing_promotion')}
              </h3>
            </CardHeader>
            <CardBody className="space-y-4">
              {(services.least_used_services || []).length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-4 text-center">No service promotion metrics needed.</p>
              ) : (
                services.least_used_services.map((item, idx) => (
                  <div key={item.serviceId} className="flex justify-between items-center py-2 border-b border-border/40 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-muted-foreground">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-stone-200">{item.serviceName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-white block">{item.bookings_count} bookings</span>
                      <span className="text-[10px] text-muted-foreground">{formatCurrency(item.revenue)}</span>
                    </div>
                  </div>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </main>
  );
}
