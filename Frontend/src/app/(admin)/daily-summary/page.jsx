'use client';

import { useState, useEffect } from 'react';
import { useModuleStore } from '@/store/moduleStore';
import { useTranslation } from '@/hooks/useTranslation';
import {
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  Users,
  UserCheck,
  Scissors,
  CreditCard,
  AlertCircle,
  Lightbulb,
  Lock,
  FileText,
  Clock,
  Sparkles
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export default function DailySummaryPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((s) => s.activeTenant);
  const token = useModuleStore((s) => s.token);
  const user = useModuleStore((s) => s.user);

  const showMockData = !token || !activeTenant?.id;

  // Loading & Data state
  const [loading, setLoading] = useState(!showMockData);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [financeData, setFinanceData] = useState(null);
  const [bookingsToday, setBookingsToday] = useState([]);
  const [attendanceToday, setAttendanceToday] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [paymentsList, setPaymentsList] = useState([]);

  // Close Day UI state
  const [isDayClosed, setIsDayClosed] = useState(false);

  const loadData = async () => {
    if (showMockData) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const headers = {
      Authorization: `Bearer ${token}`,
      'x-tenant-id': activeTenant?.id,
      'Content-Type': 'application/json',
    };

    try {
      const [
        analyticsRes,
        financeRes,
        bookingsRes,
        attendanceRes,
        staffRes,
        inventoryRes,
        paymentsRes
      ] = await Promise.allSettled([
        fetch(`${API_BASE}/api/analytics/dashboard`, { headers }),
        fetch(`${API_BASE}/api/finance/summary?startDate=${today}&endDate=${today}`, { headers }),
        fetch(`${API_BASE}/api/bookings?date=${today}`, { headers }),
        fetch(`${API_BASE}/api/attendance?startDate=${today}&endDate=${today}`, { headers }),
        fetch(`${API_BASE}/api/bookings/staff`, { headers }),
        fetch(`${API_BASE}/api/inventory/items`, { headers }),
        fetch(`${API_BASE}/api/payments`, { headers }),
      ]);

      if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
        setAnalyticsData(await analyticsRes.value.json());
      }
      if (financeRes.status === 'fulfilled' && financeRes.value.ok) {
        setFinanceData(await financeRes.value.json());
      }
      if (bookingsRes.status === 'fulfilled' && bookingsRes.value.ok) {
        const data = await bookingsRes.value.json();
        setBookingsToday(data.bookings || []);
      }
      if (attendanceRes.status === 'fulfilled' && attendanceRes.value.ok) {
        const data = await attendanceRes.value.json();
        setAttendanceToday(data.attendance || []);
      }
      if (staffRes.status === 'fulfilled' && staffRes.value.ok) {
        const data = await staffRes.value.json();
        setStaffList(data.staff || []);
      }
      if (inventoryRes.status === 'fulfilled' && inventoryRes.value.ok) {
        const data = await inventoryRes.value.json();
        setInventoryItems(data.items || []);
      }
      if (paymentsRes.status === 'fulfilled' && paymentsRes.value.ok) {
        const data = await paymentsRes.value.json();
        setPaymentsList(data.payments || []);
      }
    } catch (err) {
      console.error('Error fetching daily summary data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTenant?.id, token]);

  const currency = (val) => {
    return `₹${Number(val || 0).toLocaleString('en-IN')}`;
  };

  // 1. Core KPIs calculations
  const todayEarningsVal = financeData?.summary?.metrics?.grossRevenue || analyticsData?.today?.earnings || 0;
  const todayEarningsStr = showMockData ? currency(42850) : currency(todayEarningsVal);
  const todayExpensesVal = financeData?.summary?.metrics?.totalExpenses || 0;
  const todayNetProfitVal = financeData?.summary?.metrics?.netProfit || (todayEarningsVal - todayExpensesVal);

  const totalBookingsCount = showMockData ? 24 : bookingsToday.length;
  const completedBookingsCount = showMockData 
    ? 18 
    : bookingsToday.filter(b => b.status === 'COMPLETED' || b.status === 'BILLED' || b.status === 'PAID').length;

  const totalCustomersCount = showMockData 
    ? 22 
    : new Set(bookingsToday.map(b => b.customerId).filter(Boolean)).size || analyticsData?.today?.customers || 0;
  const walkInsCount = showMockData 
    ? 4 
    : bookingsToday.filter(b => b.source === 'RECEPTION').length;

  const averageBillVal = showMockData 
    ? 1947 
    : analyticsData?.average_bill_value || (completedBookingsCount > 0 ? todayEarningsVal / completedBookingsCount : 0);
  const averageBillStr = currency(averageBillVal);

  const staffWorkingCount = showMockData 
    ? 8 
    : attendanceToday.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
  const staffTotalCount = showMockData ? 10 : staffList.length || 5;

  // 2. Live Operations details
  const dailyProgressPercent = totalBookingsCount > 0 ? Math.round((completedBookingsCount / totalBookingsCount) * 100) : 0;
  const capacityUtilizationPercent = showMockData ? 82 : Math.min(100, Math.round((totalBookingsCount / Math.max(staffWorkingCount * 4, 1)) * 100));
  const cancellationsCount = showMockData ? 2 : bookingsToday.filter(b => b.status === 'CANCELLED').length;

  // 3. Customer segment breakdown
  const returningCount = showMockData ? 14 : bookingsToday.filter(b => b.customer && b.customer.lifecycleStatus !== 'NEW').length;
  const newCount = showMockData ? 8 : bookingsToday.filter(b => b.customer && b.customer.lifecycleStatus === 'NEW').length;
  const segmentTotal = returningCount + newCount || 1;
  const returningPct = Math.round((returningCount / segmentTotal) * 100);

  // 4. Top Staff Rankings
  const topStaff = showMockData ? [
    { name: 'Priya Kapoor', amount: 12400, percent: 90, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCIPMt77r6T7Tb8WMJtT01vFDfXKpckOoZRKYcO7vpurBooZie69N-jVPEZmVq7PUE98KsHzD23QYnVWiaQMoSSBv0WJUlacZVYI9ruThVsqZnePXMTtrGe9mKw2i6HSFhYSnGa6XjbFjYfwHvBLovXffEYuezLYqWMOxvcNe63t8C5Y48_r22jkzRcMx5py-CwoVLIBli850sc3mUS7A7YjkjTGEPI2BN0e0AOPVVU-XoKPdk7HqLykDiEF949NxVHn-pkF3tHqOHi' },
    { name: 'Rahul Varma', amount: 9800, percent: 75, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDV-TMcJpIRmhNhT3KvVhzn7d9VhUctUAuyFS4OGEiR6ek_oHdbvVv-rKsx9R608QtNAV_z71PjpUknPEMG-adi7YVIpGfC-xk4lCyetVQwA8WG6-wOXLujyrOMYPKZnPMxYG6bpcABZcNLj3uOhGZWMUiZGz7ms8B3GyujPZRXTOuJhReRgslYRNPlK4k_7MPzV5IY6Rf6aOq68mWrLsExU7lbUofJypVOErQvTv2urHpErf-DISFJjGhTxXHLnG_Che5qKyKW4yKp' },
    { name: 'Siddharth N.', amount: 7200, percent: 60, avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwI_tfFrX1a1f-oEkZBvUDOw97TPUl1PW2nsFEcz8BdqeKpu4HYKe4XIWz6jqqmt9osJQ7yCKwy36hGfrTOJxDgc7Jr0v-XkphtVlzoQg8pFiTCrrvw3EUEn5BzbaTwJOf4I6XcOxZPiL3ayQgqDFSbQIGKc639zzNvbvZBvwD8Mga5lElJQlxOAJi06gSXQdGifkFyD5yK14j6sVrAscES7FoVcqsujIVEZPMM1_B8VPTOXAc_5x1cwnxPWSqUIcXjiN6Vs_qMIJb' }
  ] : (analyticsData?.top_staff || []).slice(0, 3).map((s, index) => ({
    name: s.staffName || 'Staff Member',
    amount: s.revenue || s.appointments_count * 1200,
    percent: index === 0 ? 90 : index === 1 ? 75 : 60,
    avatar: s.avatar || null
  }));

  // 5. Top Services
  const topServices = showMockData ? [
    { name: 'Keratin Treatment', count: 8 },
    { name: 'Global Hair Color', count: 6 },
    { name: 'Classic Pedicure', count: 5 }
  ] : (analyticsData?.top_services || []).slice(0, 3).map(s => ({
    name: s.serviceName || 'Service',
    count: s.bookings_count || 1
  }));

  // 6. Financial breakdown
  let cashCollections = showMockData ? 12400 : 0;
  let upiCollections = showMockData ? 24150 : 0;
  let cardCollections = showMockData ? 6300 : 0;
  let outstandingBalances = showMockData ? 4200 : 0;

  if (!showMockData && paymentsList.length > 0) {
    const todayStr = new Date().toISOString().split('T')[0];
    paymentsList.forEach(p => {
      const isPaidToday = p.paidAt && p.paidAt.split('T')[0] === todayStr && p.paymentStatus === 'PAID';
      const amountVal = Number(p.amount || 0);

      if (isPaidToday) {
        if (p.paymentMethod === 'CASH') cashCollections += amountVal;
        else if (p.paymentMethod === 'CARD') cardCollections += amountVal;
        else upiCollections += amountVal; // Default online UPI/Razorpay
      }
      
      if (p.paymentStatus === 'PENDING' || p.paymentStatus === 'FAILED') {
        outstandingBalances += amountVal;
      }
    });
  }

  // 7. Alerts
  const lowStockList = showMockData 
    ? [{ name: 'Salon Shampoo Gold', quantity: 4 }]
    : inventoryItems.filter(item => item.quantity <= (item.minStockLevel || 5));

  const alerts = [
    ...(lowStockList.map(item => `Low Inventory: ${item.name} (${item.quantity} units left)`)),
    showMockData ? 'Staff Leave: Manish (Salon Assistant) on leave tomorrow.' : null,
    showMockData ? '2 Pending Online payments from yesterday.' : null
  ].filter(Boolean);

  // 8. End of Day totals
  const totalExpensesVal = showMockData ? 8420 : todayExpensesVal;
  const netProfitVal = showMockData ? 34430 : todayNetProfitVal;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  if (loading) {
    return (
      <main className="flex h-[80vh] w-full flex-col items-center justify-center gap-4 text-muted-foreground bg-[#fbf9f9]">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="font-label-md text-sm uppercase tracking-widest text-primary/80 animate-pulse">
          Loading Daily Summary...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ee] px-4 pb-28 pt-6 text-stone-950 sm:px-6 lg:px-8">
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
          background: rgba(255, 255, 255, 0.75);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(127, 118, 99, 0.15);
          border-radius: 24px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px rgba(115, 92, 0, 0.06);
        }
        .custom-progressbar {
          background-color: #efeded;
          height: 8px;
          border-radius: 9999px;
          overflow: hidden;
        }
      `}} />

      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        
        {/* Title bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
          <div>
            <h2 className="text-3xl font-display font-bold tracking-tight text-primary">Salon Pulse</h2>
            <p className="text-sm text-stone-500 font-medium">
              {t('nav_daily_summary')} • {todayFormatted}
            </p>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border-stone-300 bg-white/50 text-stone-700 hover:bg-white transition-all text-xs font-semibold h-10">
              <Calendar className="h-4 w-4" /> {t('Select Date') || 'Select Date'}
            </Button>
            <Button variant="outline" className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border-stone-300 bg-white/50 text-stone-700 hover:bg-white transition-all text-xs font-semibold h-10">
              <Download className="h-4 w-4" /> {t('Export PDF') || 'Export PDF'}
            </Button>
            {!showMockData && (
              <Button onClick={loadData} variant="ghost" className="h-10 w-10 p-0 rounded-xl bg-white/40 hover:bg-white/70 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Top KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          
          <div className="glass-card p-6 border-l-4 border-primary">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('earnings_today')}</p>
            <h3 className="text-2xl font-display font-bold text-stone-900">{todayEarningsStr}</h3>
            <p className="text-[11px] font-bold text-primary flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3.5 w-3.5" /> +12% from avg
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-stone-400">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('appointments_total')}</p>
            <h3 className="text-2xl font-display font-bold text-stone-900">{totalBookingsCount}</h3>
            <p className="text-xs text-stone-500 mt-1">{completedBookingsCount} {t('appointments_completed') || 'Completed'}</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-amber-600">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('customers_total')}</p>
            <h3 className="text-2xl font-display font-bold text-stone-900">{totalCustomersCount}</h3>
            <p className="text-xs text-stone-500 mt-1">{walkInsCount} Walk-ins</p>
          </div>

          <div className="glass-card p-6 border-l-4 border-stone-600">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('average_bill_value')}</p>
            <h3 className="text-2xl font-display font-bold text-stone-900">{averageBillStr}</h3>
            <p className="text-[11px] font-bold text-rose-500 flex items-center gap-0.5 mt-1">
              <TrendingDown className="h-3.5 w-3.5" /> -2% from avg
            </p>
          </div>

          <div className="glass-card p-6 border-l-4 border-amber-500/60">
            <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('home_staff_active') || 'Staff Active'}</p>
            <h3 className="text-2xl font-display font-bold text-stone-900">0{staffWorkingCount} / 0{staffTotalCount}</h3>
            <div className="flex -space-x-1.5 mt-2">
              <div className="w-5 h-5 rounded-full border border-white bg-amber-200 text-[9px] flex items-center justify-center font-bold text-amber-900">P</div>
              <div className="w-5 h-5 rounded-full border border-white bg-emerald-200 text-[9px] flex items-center justify-center font-bold text-emerald-900">R</div>
              <div className="w-5 h-5 rounded-full border border-white bg-sky-200 text-[9px] flex items-center justify-center font-bold text-sky-900">S</div>
              <div className="w-5 h-5 rounded-full border border-white bg-[#efeded] text-[8px] flex items-center justify-center font-bold text-stone-600">+{(Math.max(staffWorkingCount - 3, 0))}</div>
            </div>
          </div>

        </div>

        {/* Live Operations Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Live Progress Card */}
          <div className="lg:col-span-8 glass-card overflow-hidden flex flex-col h-full min-h-[420px]">
            <div className="p-6 border-b border-stone-200/50 flex justify-between items-center">
              <h4 className="text-base font-bold text-stone-900">{t('booking_live_status') || 'Live Operations'}</h4>
              <span className="flex items-center gap-2 text-primary font-bold text-xs bg-primary/10 px-3 py-1 rounded-full animate-pulse">
                <span className="w-2 h-2 rounded-full bg-primary"></span>
                Live Now
              </span>
            </div>
            
            <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Daily Progress</p>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>{t('appointments_completed') || 'Completed Appointments'}</span>
                      <span className="font-bold text-stone-900">{completedBookingsCount} / {totalBookingsCount}</span>
                    </div>
                    <div className="custom-progressbar">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${dailyProgressPercent}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1.5">
                      <span>Capacity Utilization</span>
                      <span className="font-bold text-stone-900">{capacityUtilizationPercent}%</span>
                    </div>
                    <div className="custom-progressbar">
                      <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${capacityUtilizationPercent}%` }}></div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-stone-100">
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/40">
                    <p className="text-[10px] font-bold text-stone-500 uppercase">Walk-ins</p>
                    <h5 className="text-xl font-bold mt-1 text-stone-900">0{walkInsCount}</h5>
                  </div>
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/40">
                    <p className="text-[10px] font-bold text-stone-500 uppercase">Cancellations</p>
                    <h5 className="text-xl font-bold mt-1 text-rose-500">0{cancellationsCount}</h5>
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-t md:border-t-0 md:border-l border-stone-200/40 pt-6 md:pt-0 md:pl-8">
                <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Customer Segment Breakdown</p>
                
                <div className="relative h-44 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-[10px] border-primary/20 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-[10px] border-primary" style={{ clipPath: `polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 ${100 - returningPct}%)` }}></div>
                    <div className="text-center">
                      <p className="text-2xl font-bold font-display text-stone-900">{totalCustomersCount}</p>
                      <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest">Total Today</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between gap-4 mt-4 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary"></span>
                    <span className="text-stone-700">{t('customers_returning') || 'Returning'} ({returningCount})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary/20"></span>
                    <span className="text-stone-700">{t('customers_new') || 'New / VIP'} ({newCount})</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Performance Lists */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Top Staff */}
            <div className="glass-card flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">{t('home_top_staff') || 'Top Staff Performance'}</h4>
                </div>
                <div className="space-y-4">
                  {topStaff.map((staff, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      {staff.avatar ? (
                        <img className="w-9 h-9 rounded-full object-cover border border-stone-200" src={staff.avatar} alt={staff.name} />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                          {staff.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-bold text-stone-900">{staff.name}</p>
                        <div className="w-full bg-stone-100 h-1.5 rounded-full mt-1.5">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${staff.percent}%` }}></div>
                        </div>
                      </div>
                      <p className="text-xs font-bold text-stone-950">{currency(staff.amount)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Services */}
            <div className="glass-card flex-1 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4 border-b border-stone-100 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800">{t('home_popular_services') || 'Top Booked Services'}</h4>
                </div>
                <div className="space-y-3">
                  {topServices.map((service, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 rounded-xl bg-stone-50 border border-stone-200/25">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                        <p className="text-xs font-semibold text-stone-800">{service.name}</p>
                      </div>
                      <p className="text-xs font-bold text-stone-900">{service.count} Bookings</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Collections and Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Financial collections */}
          <div className="lg:col-span-7 glass-card p-6 h-full flex flex-col justify-between">
            <div>
              <h4 className="text-base font-bold text-stone-900 mb-5">Financial Collections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3.5">
                  <div className="p-4 rounded-xl bg-stone-50 flex justify-between items-center border border-stone-200/30">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4.5 w-4.5 text-primary" />
                      <span className="text-xs font-bold text-stone-700">Cash</span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{currency(cashCollections)}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-50 flex justify-between items-center border border-stone-200/30">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4.5 w-4.5 text-primary" />
                      <span className="text-xs font-bold text-stone-700">UPI / GPay</span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{currency(upiCollections)}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-stone-50 flex justify-between items-center border border-stone-200/30">
                    <div className="flex items-center gap-3">
                      <CreditCard className="h-4.5 w-4.5 text-primary" />
                      <span className="text-xs font-bold text-stone-700">Card / POS</span>
                    </div>
                    <span className="text-sm font-bold text-stone-900">{currency(cardCollections)}</span>
                  </div>
                </div>

                <div className="p-5 bg-stone-100/50 rounded-2xl border border-stone-200/40 shadow-sm flex flex-col justify-center items-center text-center">
                  <AlertCircle className="h-8 w-8 text-rose-500 mb-1.5" />
                  <h5 className="text-[10px] font-bold text-stone-500 uppercase mb-1">{t('payments_outstanding') || 'Outstanding Balances'}</h5>
                  <p className="text-3xl font-display font-bold text-stone-950">{currency(outstandingBalances)}</p>
                  <p className="text-[10px] text-stone-500 mt-1 font-semibold">Across Pending Invoices</p>
                  <button className="mt-3.5 text-primary font-bold text-xs underline underline-offset-4 hover:opacity-80 transition-all">
                    Send Reminders
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Insights & Alerts */}
          <div className="lg:col-span-5 flex flex-col gap-6 h-full">
            
            {/* Business Insights */}
            <div className="glass-card p-6 flex-1 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3.5 border-b border-stone-100 pb-2">
                <Lightbulb className="h-4.5 w-4.5 text-primary" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-850">{t('home_business_insights') || 'Business Insights'}</h4>
              </div>
              <p className="text-xs font-medium text-stone-600 italic leading-relaxed">
                "Revenue is up by 15% compared to last Tuesday. High traction in premium hair treatments today—consider offering a complementary scalp massage to VIPs for further upselling."
              </p>
            </div>

            {/* Operational Alerts */}
            <div className="glass-card p-6 bg-rose-500/5 border-rose-500/10 border flex-1">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">Operational Alerts</h4>
              </div>
              {alerts.length === 0 ? (
                <p className="text-xs text-stone-500 italic mt-3">All operational systems are stable today.</p>
              ) : (
                <ul className="space-y-2.5">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-rose-800 text-xs font-semibold leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0"></span>
                      {alert}
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>

        </div>

        {/* End of Day Final Summary Card */}
        <div className="glass-card p-8 bg-white/85 border-t-4 border-primary relative overflow-hidden group">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/5 rounded-full group-hover:scale-110 transition-transform duration-700"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
            <div className="text-center lg:text-left">
              <h3 className="text-xl font-display font-bold text-primary mb-1">End of Day Final Summary</h3>
              <p className="text-xs text-stone-500 font-medium">Review all figures carefully before closing the books for today.</p>
            </div>

            <div className="flex flex-wrap justify-center gap-6 lg:gap-8 my-2">
              <div className="text-center px-4">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">Total Revenue</p>
                <p className="text-lg font-bold text-stone-900">{todayEarningsStr}</p>
              </div>
              <div className="w-[1px] h-10 bg-stone-200 self-center hidden md:block"></div>
              <div className="text-center px-4">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{t('nav_expenses') || 'Expenses'}</p>
                <p className="text-lg font-bold text-rose-500">{currency(totalExpensesVal)}</p>
              </div>
              <div className="w-[1px] h-10 bg-stone-200 self-center hidden md:block"></div>
              <div className="text-center px-4">
                <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-1">{t('net_operating_profit') || 'Net Profit'}</p>
                <p className="text-lg font-bold text-primary font-bold">{currency(netProfitVal)}</p>
              </div>
            </div>

            <div className="flex gap-4 w-full lg:w-auto">
              <Button variant="outline" className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl border-stone-300 text-stone-700 bg-white/50 hover:bg-white text-xs font-bold transition-all">
                Export
              </Button>
              <Button 
                onClick={() => setIsDayClosed(true)}
                disabled={isDayClosed}
                className="flex-1 lg:flex-none px-6 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:opacity-90 shadow-lg shadow-primary/10 transition-all flex items-center justify-center gap-2"
              >
                <Lock className="h-4 w-4" /> 
                {isDayClosed ? 'Day Closed Successfully!' : 'Close Day'}
              </Button>
            </div>
          </div>
        </div>

        <footer className="mt-8 pb-8 text-center">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest opacity-60">
            © 2026 Trimly Salon Management Ecosystem • Powered by Lumière Cloud
          </p>
        </footer>

      </div>
    </main>
  );
}
