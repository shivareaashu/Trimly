'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  ClipboardList,
  CreditCard,
  Scissors,
  Search,
  Sparkles,
  Star,
  Timer,
  UserCheck,
  UserPlus,
  Users,
  Wallet,
} from 'lucide-react';
import { useModuleStore } from '../../../store/moduleStore';
import { Badge, Button, Card, CardBody, PageHeader, StatCard } from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function currency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function daysSince(date) {
  if (!date) return null;
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / 86400000));
}

function timeLabel(date) {
  if (!date) return '-';
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function localDateTimeValue(date = new Date()) {
  const next = new Date(date);
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
  const offset = next.getTimezoneOffset() * 60000;
  return new Date(next.getTime() - offset).toISOString().slice(0, 16);
}

export default function ReceptionPage() {
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [dashboard, setDashboard] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerLookupDone, setCustomerLookupDone] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [staff, setStaff] = useState([]);
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [customer, setCustomer] = useState({ firstName: '', lastName: '', phone: '', email: '' });
  const [booking, setBooking] = useState({ serviceId: '', staffId: '', startTime: localDateTimeValue() });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  }), [token, activeTenant?.id]);

  const selectedService = services.find((service) => service.id === booking.serviceId);
  const selectedStaff = staff.find((person) => person.id === booking.staffId);
  const visitAge = daysSince(selectedCustomer?.lastVisitAt);
  const revisitDays = selectedCustomer?.expectedRevisitDays || selectedService?.revisitAfterDays || 30;
  const revisitRemaining = visitAge === null ? null : revisitDays - visitAge;
  const appointmentsCount = selectedCustomer?.appointments?.length || 0;
  const completedAppointments = selectedCustomer?.appointments?.filter((item) => ['COMPLETED', 'BILLED', 'PAID'].includes(item.status)) || [];
  const preferredStaff = completedAppointments[0]?.staff?.name || selectedStaff?.name || 'Any available';
  const preferredServices = [...new Set(completedAppointments.map((item) => item.service?.name).filter(Boolean))].slice(0, 3);
  const canConfirm = selectedCustomer?.id && booking.serviceId && booking.staffId && booking.startTime;

  const loadDashboard = async () => {
    if (!activeTenant?.id || !token) return;
    const [dashRes, staffRes, serviceRes] = await Promise.all([
      fetch(`${API_BASE}/api/bookings/reception/dashboard`, { headers }),
      fetch(`${API_BASE}/api/bookings/staff`, { headers }),
      fetch(`${API_BASE}/api/services?isActive=true`, { headers }),
    ]);
    if (dashRes.ok) setDashboard(await dashRes.json());
    if (staffRes.ok) setStaff((await staffRes.json()).staff || []);
    if (serviceRes.ok) setServices((await serviceRes.json()).services || []);
  };

  useEffect(() => {
    loadDashboard();
  }, [activeTenant?.id, token]);

  const loadCustomerDetails = async (id) => {
    const res = await fetch(`${API_BASE}/api/customers/${id}`, { headers });
    const data = await res.json();
    if (res.ok) {
      setSelectedCustomer(data.customer);
      setShowCreateCustomer(false);
    }
  };

  const findCustomer = async () => {
    if (!search.trim()) return;
    setError('');
    setMessage('');
    setSelectedCustomer(null);
    const res = await fetch(`${API_BASE}/api/customers?search=${encodeURIComponent(search)}`, { headers });
    const data = await res.json();
    const results = data.customers || [];
    setCustomers(results);
    setCustomerLookupDone(true);
    setShowCreateCustomer(results.length === 0);
    if (results.length === 1) {
      loadCustomerDetails(results[0].id);
    }
  };

  const createCustomer = async () => {
    setError('');
    const res = await fetch(`${API_BASE}/api/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(customer),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Could not create customer.');
    setMessage(`Created ${data.customer.firstName} ${data.customer.lastName}`);
    await loadCustomerDetails(data.customer.id);
    return data.customer.id;
  };

  const createAppointment = async () => {
    try {
      setError('');
      setMessage('');
      let resolvedCustomerId = selectedCustomer?.id;
      if (!resolvedCustomerId) resolvedCustomerId = await createCustomer();

      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId: resolvedCustomerId,
          serviceId: booking.serviceId,
          staffId: booking.staffId,
          startTime: new Date(booking.startTime).toISOString(),
          source: 'RECEPTION',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create appointment.');
      setMessage(`Walk-in confirmed: ${data.booking.bookingReference}`);
      setCustomers([]);
      setCustomerLookupDone(false);
      setShowCreateCustomer(false);
      setBooking({ serviceId: '', staffId: '', startTime: localDateTimeValue() });
      loadDashboard();
    } catch (err) {
      setError(err.message);
    }
  };

  const checkIn = async (id) => {
    await fetch(`${API_BASE}/api/bookings/${id}/action`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action: 'check-in' }),
    });
    loadDashboard();
  };

  const topServices = services.slice(0, 8);
  const todayQueue = dashboard?.todaysAppointments || [];

  return (
    <main className="min-h-screen bg-[#f8f5ee] px-4 pb-28 pt-6 text-stone-950 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow="Front Desk"
          title="Walk-In Desk"
          description="Find the customer, choose the service, assign the stylist, and confirm the visit."
        />

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Today" value={todayQueue.length} icon={CalendarCheck} />
          <StatCard label="Walk-ins" value={dashboard?.walkIns?.length || 0} icon={UserPlus} />
          <StatCard label="Checked In" value={dashboard?.checkIns?.length || 0} icon={CheckCircle} tone="success" />
          <StatCard label="Pending Pay" value={dashboard?.pendingPayments?.length || 0} icon={Wallet} tone="danger" />
        </div>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardBody className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
                  <div>
                    <h2 className="text-lg font-bold">Find Customer</h2>
                    <p className="text-sm text-stone-500">Search by phone first, then name or email if needed.</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-stone-400" />
                    <input
                      className="h-12 w-full rounded-2xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-950 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
                      placeholder="+91 9876543210"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      onKeyDown={(event) => event.key === 'Enter' && findCustomer()}
                    />
                  </div>
                  <Button className="h-12 rounded-2xl" onClick={findCustomer}>
                    <Search className="h-4 w-4" /> Search
                  </Button>
                </div>

                {customers.length > 1 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {customers.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => loadCustomerDetails(item.id)}
                        className="rounded-2xl border border-stone-200 bg-[#fffaf0] p-4 text-left shadow-sm transition hover:border-primary hover:bg-white"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-semibold">{item.firstName} {item.lastName}</span>
                          <Badge variant={item.lifecycleStatus === 'INACTIVE' ? 'danger' : 'gold'}>
                            {item.lifecycleStatus || 'ACTIVE'}
                          </Badge>
                        </div>
                        <p className="mt-1 text-xs text-stone-500">{item.phone || item.email || 'No contact recorded'}</p>
                      </button>
                    ))}
                  </div>
                ) : null}

                {selectedCustomer ? (
                  <div className="rounded-2xl border border-primary/25 bg-primary/5 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                          {(selectedCustomer.tags || []).includes('VIP') ? <Badge variant="success">VIP Customer</Badge> : null}
                        </div>
                        <p className="mt-1 text-sm text-stone-600">
                          Last visit: {visitAge === null ? 'No completed visit' : `${visitAge} days ago`}
                        </p>
                      </div>
                      {visitAge !== null ? (
                        <div className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm">
                          <span className="block text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Recommended Revisit</span>
                          <span className="font-bold text-primary">
                            {revisitRemaining <= 0 ? 'Due now' : `${revisitRemaining} days remaining`}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <Button className="mt-4 rounded-2xl" onClick={() => document.getElementById('service-section')?.scrollIntoView({ behavior: 'smooth' })}>
                      Continue
                    </Button>
                  </div>
                ) : null}

                {customerLookupDone && !selectedCustomer && showCreateCustomer ? (
                  <div className="rounded-2xl border border-dashed border-stone-300 bg-[#fffaf0] p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-bold">Customer Not Found</h3>
                        <p className="text-sm text-stone-500">Create the customer profile, then continue booking.</p>
                      </div>
                      <Badge variant="gold">New Customer</Badge>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <input className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="First name" value={customer.firstName} onChange={(event) => setCustomer({ ...customer, firstName: event.target.value })} />
                      <input className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Last name" value={customer.lastName} onChange={(event) => setCustomer({ ...customer, lastName: event.target.value })} />
                      <input className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Phone" value={customer.phone} onChange={(event) => setCustomer({ ...customer, phone: event.target.value })} />
                      <input className="h-11 rounded-2xl border border-stone-200 bg-white px-4 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" placeholder="Email" value={customer.email} onChange={(event) => setCustomer({ ...customer, email: event.target.value })} />
                    </div>
                    <Button variant="secondary" className="mt-4 rounded-2xl bg-white text-stone-900" onClick={createCustomer}>
                      <Users className="h-4 w-4" /> Create New Customer
                    </Button>
                  </div>
                ) : null}
              </CardBody>
            </Card>

            <Card id="service-section" className="rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardBody className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
                  <div>
                    <h2 className="text-lg font-bold">Select Service</h2>
                    <p className="text-sm text-stone-500">Fast cards for the services reception books most often.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {topServices.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => setBooking({ ...booking, serviceId: service.id })}
                      className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                        booking.serviceId === service.id
                          ? 'border-primary bg-primary/10 ring-4 ring-primary/10'
                          : 'border-stone-200 bg-[#fffaf0] hover:border-primary hover:bg-white'
                      }`}
                    >
                      <Scissors className="mb-3 h-5 w-5 text-primary" />
                      <p className="font-bold">{service.name}</p>
                      <p className="mt-1 text-sm text-stone-500">{currency(service.price)}</p>
                      <p className="mt-3 text-xs text-stone-400">{service.duration} mins</p>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardBody className="space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">3</span>
                  <div>
                    <h2 className="text-lg font-bold">Assign Stylist</h2>
                    <p className="text-sm text-stone-500">Pick the right stylist or use the fastest available option.</p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <button
                    onClick={() => staff[0] && setBooking({ ...booking, staffId: staff[0].id })}
                    className="rounded-2xl border border-stone-200 bg-[#fffaf0] p-4 text-left shadow-sm transition hover:border-primary hover:bg-white"
                  >
                    <Sparkles className="mb-3 h-5 w-5 text-primary" />
                    <p className="font-bold">Any Available</p>
                    <div className="mt-1 flex gap-0.5 text-primary">
                      {[0, 1, 2, 3, 4].map((item) => <Star key={item} className="h-3.5 w-3.5 fill-current" />)}
                    </div>
                    <p className="mt-3 text-xs text-stone-500">Best available stylist</p>
                  </button>
                  {staff.slice(0, 5).map((person, index) => (
                    <button
                      key={person.id}
                      onClick={() => setBooking({ ...booking, staffId: person.id })}
                      className={`rounded-2xl border p-4 text-left shadow-sm transition ${
                        booking.staffId === person.id
                          ? 'border-primary bg-primary/10 ring-4 ring-primary/10'
                          : 'border-stone-200 bg-[#fffaf0] hover:border-primary hover:bg-white'
                      }`}
                    >
                      <UserCheck className="mb-3 h-5 w-5 text-primary" />
                      <p className="font-bold">{person.name}</p>
                      <p className="mt-1 text-sm text-stone-500">{person.bio || (index % 2 === 0 ? 'Available now' : 'Available in 5 min')}</p>
                      <Badge variant={index % 2 === 0 ? 'success' : 'gold'} className="mt-3">
                        {index % 2 === 0 ? 'Available Now' : '5 Min'}
                      </Badge>
                    </button>
                  ))}
                </div>
              </CardBody>
            </Card>
          </div>

          <aside className="space-y-5">
            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardBody className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold">Today&apos;s Queue</h2>
                  <Badge variant="gold">{todayQueue.length} bookings</Badge>
                </div>
                <div className="space-y-3">
                  {todayQueue.slice(0, 8).map((item) => (
                    <div key={item.id} className="grid grid-cols-[54px_1fr_auto] items-center gap-3 rounded-2xl border border-stone-200 bg-[#fffaf0] p-3">
                      <span className="text-sm font-bold text-primary">{timeLabel(item.startTime)}</span>
                      <div>
                        <p className="text-sm font-semibold">{item.customer?.firstName || 'Walk-In'} {item.customer?.lastName || ''}</p>
                        <p className="text-xs text-stone-500">{item.service?.name || 'Waiting Assignment'}</p>
                      </div>
                      <Button size="sm" variant="secondary" className="rounded-xl bg-white text-stone-900" onClick={() => checkIn(item.id)}>
                        Check In
                      </Button>
                    </div>
                  ))}
                  {todayQueue.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">No appointments in today&apos;s queue.</p>
                  ) : null}
                </div>
              </CardBody>
            </Card>

            <Card className="rounded-2xl border-stone-200 bg-white shadow-sm">
              <CardBody className="space-y-4">
                <h2 className="font-bold">Customer Snapshot</h2>
                {selectedCustomer ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold">{selectedCustomer.firstName} {selectedCustomer.lastName}</h3>
                        {(selectedCustomer.tags || []).includes('VIP') ? <Badge variant="success">VIP</Badge> : null}
                      </div>
                      {revisitRemaining !== null && revisitRemaining <= 7 ? (
                        <div className="mt-3 rounded-2xl border border-amber-300 bg-amber-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">Due For Revisit</p>
                          <p className="mt-1 text-sm text-amber-900">Recommended: {preferredServices[0] || selectedService?.name || 'Next service'}</p>
                          <p className="text-sm text-amber-900">Offer: 10% Revisit Discount</p>
                        </div>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-[#fffaf0] p-3">
                        <p className="text-xs text-stone-500">Last Visit</p>
                        <p className="font-bold">{visitAge === null ? '-' : `${visitAge} days ago`}</p>
                      </div>
                      <div className="rounded-2xl bg-[#fffaf0] p-3">
                        <p className="text-xs text-stone-500">Lifetime Spend</p>
                        <p className="font-bold">{currency(selectedCustomer.totalSpending)}</p>
                      </div>
                      <div className="rounded-2xl bg-[#fffaf0] p-3">
                        <p className="text-xs text-stone-500">Appointments</p>
                        <p className="font-bold">{appointmentsCount}</p>
                      </div>
                      <div className="rounded-2xl bg-[#fffaf0] p-3">
                        <p className="text-xs text-stone-500">Preferred Staff</p>
                        <p className="font-bold">{preferredStaff}</p>
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-stone-400">Preferred Services</p>
                      <div className="flex flex-wrap gap-2">
                        {(preferredServices.length ? preferredServices : ['Hair Color', 'Hair Spa']).map((item) => <Badge key={item} variant="gold">{item}</Badge>)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">
                    Select a customer to see spend, revisit status, service preferences, and history.
                  </p>
                )}
              </CardBody>
            </Card>
          </aside>
        </div>

        {message ? <p className="rounded-2xl border border-emerald-500/20 bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}
        {error ? <p className="rounded-2xl border border-rose-500/20 bg-rose-50 p-4 text-sm text-rose-700">{error}</p> : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-stone-200 bg-white/95 px-4 py-3 shadow-[0_-12px_40px_rgba(0,0,0,0.08)] backdrop-blur">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-6">
            <SummaryItem label="Customer" value={selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Not selected'} icon={Users} />
            <SummaryItem label="Service" value={selectedService?.name || 'Not selected'} icon={Scissors} />
            <SummaryItem label="Staff" value={selectedStaff?.name || 'Not selected'} icon={UserCheck} />
            <SummaryItem label="Time" value={booking.startTime ? timeLabel(booking.startTime) : '-'} icon={Clock} />
            <SummaryItem label="Duration" value={selectedService ? `${selectedService.duration} mins` : '-'} icon={Timer} />
            <SummaryItem label="Amount" value={selectedService ? currency(selectedService.price) : '-'} icon={CreditCard} />
          </div>
          <Button disabled={!canConfirm} className="h-12 rounded-2xl px-6" onClick={createAppointment}>
            <ClipboardList className="h-4 w-4" /> Confirm Walk-In
          </Button>
        </div>
      </div>
    </main>
  );
}

function SummaryItem({ label, value, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#fffaf0] px-3 py-2">
      <Icon className="h-4 w-4 text-primary" />
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-400">{label}</p>
        <p className="truncate font-semibold text-stone-900">{value}</p>
      </div>
    </div>
  );
}
