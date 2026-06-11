'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  IndianRupee,
  Plus,
  RefreshCw,
  Search,
  UserCheck,
  Users,
} from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '../../../store/moduleStore';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  PageHeader,
  Select,
  StatCard,
} from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const BUSINESS_HOURS = Array.from({ length: 10 }, (_, index) => 9 + index);

function isoDate(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function localDateTimeValue(date = new Date()) {
  const next = new Date(date);
  next.setMinutes(Math.ceil(next.getMinutes() / 15) * 15, 0, 0);
  const offset = next.getTimezoneOffset() * 60000;
  return new Date(next.getTime() - offset).toISOString().slice(0, 16);
}

function timeLabel(value) {
  if (!value) return '-';
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function currency(value) {
  return `Rs. ${Number(value || 0).toLocaleString('en-IN')}`;
}

function statusVariant(status) {
  if (['COMPLETED', 'BILLED', 'PAID'].includes(status)) return 'success';
  if (['CANCELLED', 'NO_SHOW'].includes(status)) return 'danger';
  return 'gold';
}

export default function AppointmentsPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [selectedDate, setSelectedDate] = useState(isoDate());
  const [bookings, setBookings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [customerSearch, setCustomerSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [form, setForm] = useState({
    customerId: '',
    serviceId: '',
    staffId: '',
    startTime: localDateTimeValue(),
    notes: '',
  });

  const headers = useMemo(() => ({
    Authorization: `Bearer ${token}`,
    'x-tenant-id': activeTenant?.id,
    'Content-Type': 'application/json',
  }), [token, activeTenant?.id]);

  const loadAppointments = async () => {
    if (!activeTenant?.id || !token) return;
    const params = new URLSearchParams({ date: selectedDate });
    if (staffFilter !== 'ALL') params.set('staffId', staffFilter);
    if (statusFilter !== 'ALL') params.set('status', statusFilter);

    const res = await fetch(`${API_BASE}/api/bookings?${params.toString()}`, { headers });
    const data = await res.json();
    if (res.ok) setBookings(data.bookings || []);
  };

  const loadLookups = async () => {
    if (!activeTenant?.id || !token) return;
    const [staffRes, serviceRes, customerRes] = await Promise.all([
      fetch(`${API_BASE}/api/bookings/staff`, { headers }),
      fetch(`${API_BASE}/api/services?isActive=true`, { headers }),
      fetch(`${API_BASE}/api/customers`, { headers }),
    ]);
    if (staffRes.ok) setStaff((await staffRes.json()).staff || []);
    if (serviceRes.ok) setServices((await serviceRes.json()).services || []);
    if (customerRes.ok) setCustomers((await customerRes.json()).customers || []);
  };

  useEffect(() => {
    loadAppointments();
  }, [activeTenant?.id, token, selectedDate, staffFilter, statusFilter]);

  useEffect(() => {
    loadLookups();
  }, [activeTenant?.id, token]);

  const selectedService = services.find((service) => service.id === form.serviceId);
  const selectedStaff = staff.find((member) => member.id === form.staffId);

  const filteredCustomers = customerSearch.trim()
    ? customers.filter((customer) => {
      const haystack = `${customer.firstName} ${customer.lastName} ${customer.phone || ''} ${customer.email || ''}`.toLowerCase();
      return haystack.includes(customerSearch.toLowerCase());
    })
    : customers.slice(0, 8);

  const totals = {
    all: bookings.length,
    completed: bookings.filter((item) => ['COMPLETED', 'BILLED', 'PAID'].includes(item.status)).length,
    pending: bookings.filter((item) => ['BOOKED', 'PENDING', 'CONFIRMED', 'CHECKED_IN', 'ASSIGNED'].includes(item.status)).length,
    earnings: bookings.reduce((sum, item) => sum + Number(item.totalAmount || item.service?.price || 0), 0),
  };

  const visibleBookings = bookings.filter((booking) => {
    if (staffFilter !== 'ALL' && booking.staffId !== staffFilter) return false;
    if (statusFilter !== 'ALL' && booking.status !== statusFilter) return false;
    return true;
  });

  const bookingsByHour = BUSINESS_HOURS.map((hour) => ({
    hour,
    bookings: visibleBookings.filter((booking) => new Date(booking.startTime).getHours() === hour),
  }));

  const updateForm = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const openNewAppointment = () => {
    setMessage({ type: '', text: '' });
    setForm({
      customerId: '',
      serviceId: '',
      staffId: '',
      startTime: localDateTimeValue(new Date(`${selectedDate}T09:00:00`)),
      notes: '',
    });
    setCustomerSearch('');
    setModalOpen(true);
  };

  const createAppointment = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerId: form.customerId,
          serviceId: form.serviceId,
          staffId: form.staffId,
          startTime: new Date(form.startTime).toISOString(),
          notes: form.notes || undefined,
          source: 'ADMIN',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t('appointments_save_failed'));

      setModalOpen(false);
      setMessage({ type: 'success', text: t('appointments_created') });
      loadAppointments();
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setSubmitting(false);
    }
  };

  const setAppointmentStatus = async (id, action) => {
    await fetch(`${API_BASE}/api/bookings/${id}/action`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ action }),
    });
    loadAppointments();
  };

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow={t('appointments_eyebrow')}
          title={t('page_appointments_title')}
          description={t('page_appointments_description')}
        >
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Button variant="secondary" size="sm" onClick={loadAppointments}>
              <RefreshCw className="h-4 w-4" /> {t('common_refresh')}
            </Button>
            <Button size="sm" onClick={openNewAppointment}>
              <Plus className="h-4 w-4" /> {t('appointments_new')}
            </Button>
          </div>
        </PageHeader>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('appointments_total_short')} value={totals.all} icon={CalendarCheck} />
          <StatCard label={t('appointments_completed_short')} value={totals.completed} icon={CheckCircle} tone="success" />
          <StatCard label={t('appointments_pending_short')} value={totals.pending} icon={Clock} />
          <StatCard label={t('appointments_earnings')} value={currency(totals.earnings)} icon={IndianRupee} tone="success" />
        </div>

        {message.text ? (
          <div className={`rounded-2xl border p-4 text-sm ${
            message.type === 'success'
              ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-500'
              : 'border-rose-400/20 bg-rose-500/10 text-rose-500'
          }`}>
            {message.text}
          </div>
        ) : null}

        <Card className="rounded-2xl">
          <CardBody className="space-y-5">
            <div className="grid gap-3 md:grid-cols-[180px_1fr_1fr]">
              <Input
                type="date"
                value={selectedDate}
                onChange={(event) => setSelectedDate(event.target.value)}
                aria-label={t('appointments_date')}
              />
              <Select value={staffFilter} onChange={(event) => setStaffFilter(event.target.value)}>
                <option value="ALL">{t('appointments_all_staff')}</option>
                {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
              </Select>
              <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="ALL">{t('appointments_all_statuses')}</option>
                {['BOOKED', 'CHECKED_IN', 'ASSIGNED', 'IN_SERVICE', 'COMPLETED', 'BILLED', 'PAID', 'CANCELLED'].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </Select>
            </div>

            <div className="hidden overflow-hidden rounded-2xl border border-border/70 lg:block">
              <div className="grid grid-cols-[92px_1fr] border-b border-border/70 bg-white/3">
                <div className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{t('analytics_time')}</div>
                <div className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">{t('appointments_schedule')}</div>
              </div>
              {bookingsByHour.map(({ hour, bookings: hourBookings }) => (
                <div key={hour} className="grid min-h-[96px] grid-cols-[92px_1fr] border-b border-border/40 last:border-b-0">
                  <div className="border-r border-border/40 px-4 py-4 text-sm text-muted-foreground">
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  <div className="grid gap-3 p-3 sm:grid-cols-2 xl:grid-cols-3">
                    {hourBookings.length > 0 ? hourBookings.map((booking) => (
                      <AppointmentCard
                        key={booking.id}
                        booking={booking}
                        t={t}
                        onCheckIn={() => setAppointmentStatus(booking.id, 'check-in')}
                        onComplete={() => setAppointmentStatus(booking.id, 'complete')}
                      />
                    )) : <span className="text-sm text-muted-foreground/60">{t('appointments_no_slot')}</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:hidden">
              {visibleBookings.length > 0 ? visibleBookings.map((booking) => (
                <AppointmentCard
                  key={booking.id}
                  booking={booking}
                  t={t}
                  onCheckIn={() => setAppointmentStatus(booking.id, 'check-in')}
                  onComplete={() => setAppointmentStatus(booking.id, 'complete')}
                />
              )) : (
                <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                  {t('appointments_empty')}
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={t('appointments_new')}
        subtitle={t('appointments_modal_subtitle')}
        topLabel={t('appointments_modal_label')}
        icon={CalendarCheck}
        width="acczite-modal-width-lg"
      >
        <form onSubmit={createAppointment} className="space-y-5 text-slate-900">
          <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
            <div className="space-y-4">
              <Field label={t('appointments_customer_search')}>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                  <input
                    className="staff-modal-input pl-10"
                    value={customerSearch}
                    onChange={(event) => setCustomerSearch(event.target.value)}
                    placeholder={t('appointments_customer_search_placeholder')}
                  />
                </div>
              </Field>

              <div className="max-h-[260px] space-y-2 overflow-y-auto pr-1">
                {filteredCustomers.map((customer) => (
                  <button
                    type="button"
                    key={customer.id}
                    onClick={() => updateForm('customerId', customer.id)}
                    className={`w-full rounded-2xl border p-3 text-left transition ${
                      form.customerId === customer.id
                        ? 'border-[#735c00] bg-amber-50'
                        : 'border-slate-200 bg-white hover:border-[#735c00]'
                    }`}
                  >
                    <p className="font-semibold text-slate-900">{customer.firstName} {customer.lastName}</p>
                    <p className="text-xs text-slate-500">{customer.phone || customer.email || t('appointments_no_contact')}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <Field label={t('booking_select_service')}>
                <select className="staff-modal-input" required value={form.serviceId} onChange={(event) => updateForm('serviceId', event.target.value)}>
                  <option value="">{t('booking_select_service')}</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>{service.name} - {currency(service.price)}</option>
                  ))}
                </select>
              </Field>

              <Field label={t('booking_select_staff')}>
                <select className="staff-modal-input" required value={form.staffId} onChange={(event) => updateForm('staffId', event.target.value)}>
                  <option value="">{t('booking_select_staff')}</option>
                  {staff.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}
                </select>
              </Field>

              <Field label={t('booking_start_time')}>
                <input
                  className="staff-modal-input"
                  type="datetime-local"
                  required
                  value={form.startTime}
                  onChange={(event) => updateForm('startTime', event.target.value)}
                />
              </Field>

              <Field label={t('booking_notes')}>
                <textarea
                  className="staff-modal-input resize-none"
                  rows={3}
                  value={form.notes}
                  onChange={(event) => updateForm('notes', event.target.value)}
                  placeholder={t('appointments_notes_placeholder')}
                />
              </Field>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t('booking_summary')}</p>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <Summary label={t('booking_service')} value={selectedService?.name || '-'} />
              <Summary label={t('booking_stylist')} value={selectedStaff?.name || '-'} />
              <Summary label={t('booking_total_price')} value={selectedService ? currency(selectedService.price) : '-'} />
            </div>
          </div>

          {message.text && message.type === 'error' ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">{message.text}</div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" size="lg" onClick={() => setModalOpen(false)} className="bg-white text-slate-900">
              {t('common_cancel')}
            </Button>
            <Button type="submit" size="lg" disabled={submitting || !form.customerId || !form.serviceId || !form.staffId}>
              {submitting ? t('booking_processing') : t('booking_confirm')}
            </Button>
          </div>
        </form>
      </Modal>
    </main>
  );
}

function AppointmentCard({ booking, t, onCheckIn, onComplete }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card/80 p-4 shadow-[0_1px_2px_rgba(15,23,42,0.05)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-semibold text-foreground">
            {booking.customer?.firstName} {booking.customer?.lastName}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{booking.service?.name}</p>
        </div>
        <Badge variant={statusVariant(booking.status)}>{booking.status}</Badge>
      </div>
      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <span className="inline-flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeLabel(booking.startTime)}</span>
        <span className="inline-flex items-center gap-1"><UserCheck className="h-3.5 w-3.5" /> {booking.staff?.name || '-'}</span>
        <span className="inline-flex items-center gap-1"><IndianRupee className="h-3.5 w-3.5" /> {currency(booking.totalAmount || booking.service?.price)}</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {!['CHECKED_IN', 'IN_SERVICE', 'COMPLETED', 'BILLED', 'PAID'].includes(booking.status) ? (
          <Button size="sm" variant="secondary" onClick={onCheckIn}>
            <Users className="h-3.5 w-3.5" /> {t('appointments_check_in')}
          </Button>
        ) : null}
        {!['COMPLETED', 'BILLED', 'PAID', 'CANCELLED'].includes(booking.status) ? (
          <Button size="sm" onClick={onComplete}>
            <CheckCircle className="h-3.5 w-3.5" /> {t('appointments_complete')}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Summary({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 truncate font-semibold text-slate-900">{value}</p>
    </div>
  );
}
