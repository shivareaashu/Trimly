'use client';

import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { useModuleStore } from '@/store/moduleStore';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { AlertsAndPayments } from '@/components/dashboard/AlertsAndPayments';
import { PerformanceGrid } from '@/components/dashboard/PerformanceGrid';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function DashboardPage() {
  const activeTenant = useModuleStore((s) => s.activeTenant);
  const token = useModuleStore((s) => s.token);
  const user = useModuleStore((s) => s.user);

  const showMockData = !token || !activeTenant?.id;

  // Loading and stats state
  const [loading, setLoading] = useState(!showMockData);
  const [financeToday, setFinanceToday] = useState(null);
  const [financeMonth, setFinanceMonth] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [revenueTimeframe, setRevenueTimeframe] = useState('30D'); // '7D', '30D', '90D'

  const headers = {
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  };

  const loadDashboard = async () => {
    if (showMockData) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];

    try {
      // 1. Fetch dashboard analytics if the module is enabled/accessible
      try {
        const analyticsRes = await fetch(`${API_BASE}/api/analytics/dashboard`, { headers });
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          setAnalyticsData(data);
        }
      } catch (e) {
        console.warn('Analytics module fetch skipped or failed:', e);
      }

      // 2. Fetch other core modules data
      const [
        financeTodayRes,
        financeMonthRes,
        bookingsTodayRes,
        bookingsRecentRes,
        attendanceRes,
        staffRes,
        paymentsRes
      ] = await Promise.allSettled([
        fetch(`${API_BASE}/api/finance/summary?startDate=${today}&endDate=${today}`, { headers }),
        fetch(`${API_BASE}/api/finance/summary?startDate=${startOfMonth}&endDate=${today}`, { headers }),
        fetch(`${API_BASE}/api/bookings?date=${today}`, { headers }),
        fetch(`${API_BASE}/api/bookings?limit=5`, { headers }),
        fetch(`${API_BASE}/api/attendance?startDate=${today}&endDate=${today}`, { headers }),
        fetch(`${API_BASE}/api/bookings/staff`, { headers }),
        fetch(`${API_BASE}/api/payments`, { headers }),
      ]);

      if (financeTodayRes.status === 'fulfilled' && financeTodayRes.value.ok) {
        const data = await financeTodayRes.value.json();
        setFinanceToday(data.summary);
      }
      if (financeMonthRes.status === 'fulfilled' && financeMonthRes.value.ok) {
        const data = await financeMonthRes.value.json();
        setFinanceMonth(data.summary);
      }
      if (bookingsTodayRes.status === 'fulfilled' && bookingsTodayRes.value.ok) {
        const data = await bookingsTodayRes.value.json();
        setTodayBookings(data.bookings || []);
      }
      if (bookingsRecentRes.status === 'fulfilled' && bookingsRecentRes.value.ok) {
        const data = await bookingsRecentRes.value.json();
        setRecentBookings(data.bookings || []);
      }
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.ok) {
        const data = await attendanceRes.value.json();
        setTodayAttendance(data.attendance || []);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value.ok) {
        const data = await staffRes.value.json();
        setStaffList(data.staff || []);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const data = await paymentsRes.value.json();
        setPaymentsList(data.payments || []);
      }
    } catch (err) {
      console.error('Dashboard components fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [activeTenant?.id, token]);

  // Calculations & Fallbacks
  const todayEarningsVal = financeToday?.metrics?.grossRevenue || analyticsData?.today?.earnings || 0;
  const todayEarningsStr = showMockData 
    ? '₹42,850'
    : (todayEarningsVal > 0 ? `₹${Number(todayEarningsVal).toLocaleString('en-IN')}` : '₹0');

  const appointmentsTotal = showMockData 
    ? 24 
    : (todayBookings.length > 0 ? todayBookings.length : 0);
  const appointmentsRemaining = showMockData 
    ? 8 
    : (todayBookings.length > 0 ? todayBookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING').length : 0);

  const newCustomersStr = showMockData 
    ? '18 this week' 
    : (analyticsData?.customers_new ? `${analyticsData.customers_new} this week` : '0 this week');

  const presentToday = todayAttendance.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const staffWorkingStr = showMockData 
    ? '09 / 12' 
    : (presentToday > 0 && staffList.length > 0 ? `0${presentToday} / 0${staffList.length}` : '00 / 00');

  // Revenue chart setup
  const getChartData = () => {
    let rawData = null;
    if (revenueTimeframe === '7D') {
      rawData = analyticsData?.charts?.revenue_7_days;
    } else if (revenueTimeframe === '90D') {
      rawData = analyticsData?.charts?.revenue_90_days;
    } else {
      rawData = analyticsData?.charts?.revenue_30_days;
    }

    if (Array.isArray(rawData) && rawData.length > 0) {
      return rawData.map((p, index) => {
        if (typeof p === 'number') {
          return { label: `Day ${index + 1}`, value: p };
        }
        if (p && typeof p === 'object') {
          const val = Number(p.revenue !== undefined ? p.revenue : (p.value !== undefined ? p.value : 0));
          const label = String(p.date || p.label || `Day ${index + 1}`);
          return { label, value: val };
        }
        return { label: `Day ${index + 1}`, value: 0 };
      });
    }

    // Default Fallbacks
    if (revenueTimeframe === '7D') {
      return [
        { label: 'Mon', value: 12000 },
        { label: 'Tue', value: 18000 },
        { label: 'Wed', value: 14000 },
        { label: 'Thu', value: 24000 },
        { label: 'Fri', value: 29000 },
        { label: 'Sat', value: 19000 },
        { label: 'Sun', value: 15000 }
      ];
    } else if (revenueTimeframe === '90D') {
      return [
        { label: 'Month 1', value: 180000 },
        { label: 'Month 2', value: 220000 },
        { label: 'Month 3', value: 290000 }
      ];
    } else {
      return [
        { label: 'Oct 1', value: 15000 },
        { label: 'Oct 4', value: 24000 },
        { label: 'Oct 8', value: 19000 },
        { label: 'Oct 12', value: 31000 },
        { label: 'Oct 16', value: 42850 },
        { label: 'Oct 20', value: 22000 },
        { label: 'Oct 24', value: 17000 },
        { label: 'Oct 28', value: 26000 },
        { label: 'Oct 31', value: 33000 }
      ];
    }
  };

  const chartPoints = getChartData();
  const maxChartVal = Math.max(...chartPoints.map(p => p.value), 1);

  // Time formatting helper
  const formatTime = (timeStr) => {
    try {
      return new Date(timeStr).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return timeStr;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-muted-foreground bg-[#fbf9f9]">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="font-label-md text-sm uppercase tracking-widest text-primary/80 animate-pulse">
          Polishing Atelier Dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 space-y-8 max-w-[1440px] mx-auto">
      <DashboardHeader 
        userName={user?.firstName ? `${user.firstName} ${user.lastName || ''}` : 'Salon Owner'} 
        appointmentsCount={appointmentsTotal} 
      />
      
      <MetricsGrid 
        todayEarnings={todayEarningsStr}
        appointmentsTotal={appointmentsTotal}
        appointmentsRemaining={appointmentsRemaining}
        newCustomersStr={newCustomersStr}
        staffWorkingStr={staffWorkingStr}
      />

      <RevenueChart 
        revenueTimeframe={revenueTimeframe}
        setRevenueTimeframe={setRevenueTimeframe}
        chartPoints={chartPoints}
        maxChartVal={maxChartVal}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <UpcomingAppointments 
          todayBookings={todayBookings}
          showMockData={showMockData}
          formatTime={formatTime}
        />
        <AlertsAndPayments 
          paymentsList={paymentsList}
          showMockData={showMockData}
        />
      </div>

      <PerformanceGrid />
    </div>
  );
}
