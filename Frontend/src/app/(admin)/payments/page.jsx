'use client';

import { useEffect, useMemo, useState } from 'react';
import { CreditCard, DollarSign, RotateCcw, TriangleAlert, Wallet } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { useModuleStore } from '../../../store/moduleStore';
import { Badge, Button, Card, CardBody, DataTable, EmptyState, LoadingState, PageHeader, StatCard } from '../../../components/ui';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

function formatCurrency(value) {
  const number = Number(value || 0);
  return `Rs. ${number.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function toDateLabel(value) {
  if (!value) return '-';
  return new Date(value).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function computeStats(payments = []) {
  const today = new Date().toDateString();
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  return payments.reduce(
    (acc, payment) => {
      const amount = Number(payment.paidAmount || payment.amount || 0);
      const paidAt = payment.paidAt ? new Date(payment.paidAt) : null;

      if (payment.paymentStatus === 'PAID') {
        acc.totalPaid += amount;
        if (paidAt && paidAt.toDateString() === today) acc.today += amount;
        if (paidAt && paidAt >= startOfWeek) acc.week += amount;
        if (paidAt && paidAt >= startOfMonth) acc.month += amount;
      }

      if (payment.paymentStatus === 'PENDING' || payment.paymentStatus === 'PARTIALLY_PAID') {
        acc.outstanding += Math.max(0, Number(payment.amount || 0) - Number(payment.paidAmount || 0));
      }

      return acc;
    },
    { today: 0, week: 0, month: 0, outstanding: 0, totalPaid: 0 }
  );
}

export default function PaymentsPage() {
  const { t } = useTranslation();
  const activeTenant = useModuleStore((state) => state.activeTenant);
  const token = useModuleStore((state) => state.token);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    async function loadPayments() {
      if (!activeTenant?.id || !token) {
        setError(t('analytics_missing_context'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE}/api/payments`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'x-tenant-id': activeTenant.id,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || t('payment_dashboard_load_failed'));
        }

        setPayments(data.payments || []);
      } catch (err) {
        setError(err.message || t('payment_dashboard_load_failed'));
      } finally {
        setLoading(false);
      }
    }

    loadPayments();
  }, [activeTenant?.id, token, t]);

  const stats = useMemo(() => computeStats(payments), [payments]);

  const filteredPayments = useMemo(() => {
    if (statusFilter === 'ALL') return payments;
    return payments.filter((payment) => payment.paymentStatus === statusFilter);
  }, [payments, statusFilter]);

  const rows = filteredPayments.map((payment) => ({
    id: payment.id,
    customer: `${payment.customer?.firstName || ''} ${payment.customer?.lastName || ''}`.trim() || payment.customerId,
    amount: formatCurrency(payment.amount),
    paidAmount: formatCurrency(payment.paidAmount),
    paymentStatus: payment.paymentStatus,
    method: payment.paymentMethod || payment.method || '-',
    gateway: payment.gateway || '-',
    paidAt: toDateLabel(payment.paidAt),
    appointment: payment.appointmentId || '-',
  }));

  const columns = [
    { key: 'customer', header: t('payments_customer') },
    { key: 'appointment', header: t('payments_appointment') },
    { key: 'amount', header: t('payments_amount') },
    {
      key: 'paymentStatus',
      header: t('payments_status'),
      render: (row) => (
        <Badge variant={row.paymentStatus === 'PAID' ? 'success' : row.paymentStatus === 'REFUNDED' ? 'danger' : 'gold'}>
          {row.paymentStatus}
        </Badge>
      ),
    },
    { key: 'method', header: t('payments_method') },
    { key: 'paidAt', header: t('payments_paid_at') },
    { key: 'gateway', header: t('payments_gateway') },
  ];

  if (loading) {
    return <LoadingState label={t('analytics_loading')} />;
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8">
        <EmptyState
          title={t('payments_title')}
          description={error}
          actionLabel={t('portal_retry')}
          onAction={() => window.location.reload()}
          icon={TriangleAlert}
        />
      </div>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <PageHeader
          eyebrow={t('nav_earnings')}
          title={t('payments_title')}
          description={t('payments_description')}
          actionLabel={t('home_record_payment')}
          onAction={() => window.location.assign('/book')}
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t('payments_today_earnings')} value={formatCurrency(stats.today)} icon={CreditCard} tone="success" />
          <StatCard label={t('payments_this_week')} value={formatCurrency(stats.week)} icon={Wallet} />
          <StatCard label={t('payments_this_month')} value={formatCurrency(stats.month)} icon={DollarSign} />
          <StatCard label={t('payments_outstanding')} value={formatCurrency(stats.outstanding)} icon={RotateCcw} tone="danger" />
        </div>

        <Card>
          <CardBody className="flex flex-wrap gap-2">
            {['ALL', 'PAID', 'PENDING', 'REFUNDED', 'FAILED'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {status === 'ALL' ? t('payments_all') : status}
              </Button>
            ))}
          </CardBody>
        </Card>

        <DataTable
          columns={columns}
          rows={rows}
          emptyMessage={t('payments_no_records')}
        />
      </div>
    </main>
  );
}
