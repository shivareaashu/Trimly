'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, CreditCard } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Badge, Button, Card, CardBody, PageHeader, StatCard } from '../../../components/ui';

function formatCurrency(value) {
  const number = Number(value || 0);
  return `Rs. ${number.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function PaymentFailedPage() {
  const { t } = useTranslation();
  const [checkoutState, setCheckoutState] = useState(null);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    try {
      const stored = window.sessionStorage.getItem('trimly_checkout_state');
      if (stored) {
        setCheckoutState(JSON.parse(stored));
        return;
      }
    } catch {
      // Ignore storage issues and fall back to URL params.
    }

    setCheckoutState({
      type: 'failed',
      reason: searchParams.get('reason') || t('payment_failed_generic'),
      booking: searchParams.get('bookingId') ? { id: searchParams.get('bookingId') } : null,
      payment: searchParams.get('paymentId') ? { id: searchParams.get('paymentId') } : null,
      order: searchParams.get('orderId') ? { id: searchParams.get('orderId') } : null,
    });
  }, [t]);

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const bookingId = checkoutState?.booking?.id || searchParams.get('bookingId') || '-';
  const paymentId = checkoutState?.payment?.id || searchParams.get('paymentId') || '-';
  const orderId = checkoutState?.order?.id || searchParams.get('orderId') || '-';
  const amount = checkoutState?.payment?.amount || checkoutState?.order?.amount || 0;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <PageHeader
          eyebrow={t('payment_failed_title')}
          title={t('payment_failed_title')}
          description={t('payment_failed_description')}
        >
          <Badge variant="danger">{t('payment_status_failed')}</Badge>
        </PageHeader>

        <Card className="overflow-hidden">
          <div className="border-b border-border/60 bg-rose-500/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-rose-300">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-300/80">
                  {t('payment_failed_title')}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  {checkoutState?.reason || t('payment_failed_generic')}
                </h2>
              </div>
            </div>
          </div>

          <CardBody className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label={t('home_booking_id')} value={bookingId} icon={CreditCard} />
              <StatCard label={t('home_payment')} value={paymentId} icon={CreditCard} tone="danger" />
              <StatCard label={t('payments_amount')} value={formatCurrency(amount)} icon={CreditCard} tone="danger" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70 bg-background/40">
                <CardBody className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('payments_status')}</p>
                  <p className="text-sm font-semibold text-foreground">{t('payment_status_failed')}</p>
                </CardBody>
              </Card>
              <Card className="border-border/70 bg-background/40">
                <CardBody className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('payments_gateway')}</p>
                  <p className="text-sm font-semibold text-foreground">{checkoutState?.payment?.gateway || 'Razorpay'}</p>
                </CardBody>
              </Card>
              <Card className="border-border/70 bg-background/40">
                <CardBody className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('payments_order')}</p>
                  <p className="text-sm font-semibold text-foreground">{orderId}</p>
                </CardBody>
              </Card>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => window.location.assign('/booking')}>
                {t('payment_retry_checkout')}
              </Button>
              <Button variant="secondary" onClick={() => window.location.assign('/payments')}>
                {t('payments_view_dashboard')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
