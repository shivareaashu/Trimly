'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, ReceiptText, Sparkles } from 'lucide-react';
import { useTranslation } from '../../../hooks/useTranslation';
import { Badge, Button, Card, CardBody, PageHeader, StatCard, LoadingState, EmptyState } from '../../../components/ui';

function formatCurrency(value) {
  const number = Number(value || 0);
  return `Rs. ${number.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export default function PaymentSuccessPage() {
  const { t } = useTranslation();
  const [checkoutState, setCheckoutState] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationError, setVerificationError] = useState('');

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const orderIdFromUrl = searchParams.get('order_id') || searchParams.get('orderId');
    const bookingIdFromUrl = searchParams.get('bookingId');
    const tenantSlugFromUrl = searchParams.get('tenant') || localStorage.getItem('trimly_public_slug') || 'luxury-salon';

    if (orderIdFromUrl && orderIdFromUrl.startsWith('CF_')) {
      async function verifyCashfree() {
        try {
          setLoading(true);
          const response = await fetch(`${API_BASE}/api/payments/cashfree/status/${orderIdFromUrl}`, {
            headers: {
              'x-tenant-slug': tenantSlugFromUrl,
            }
          });
          const data = await response.json();
          if (!response.ok) {
            throw new Error(data.error || 'Payment verification failed.');
          }

          setCheckoutState({
            type: 'success',
            booking: bookingIdFromUrl ? { id: bookingIdFromUrl } : (data.payment?.appointmentId ? { id: data.payment.appointmentId } : null),
            payment: data.payment,
            order: { id: orderIdFromUrl, amount: data.payment?.amount },
          });
        } catch (err) {
          setVerificationError(err.message || 'Payment verification failed.');
        } finally {
          setLoading(false);
        }
      }
      verifyCashfree();
      return;
    }

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
      type: 'success',
      booking: searchParams.get('bookingId') ? { id: searchParams.get('bookingId') } : null,
      payment: searchParams.get('paymentId') ? { id: searchParams.get('paymentId') } : null,
      order: searchParams.get('orderId') ? { id: searchParams.get('orderId') } : null,
    });
  }, []);


  if (loading) {
    return <LoadingState label={t('payment_processing')} />;
  }

  if (verificationError) {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto flex max-w-5xl flex-col gap-6">
          <EmptyState
            title={t('payment_failed_title')}
            description={verificationError}
            actionLabel={t('portal_retry')}
            onAction={() => window.location.reload()}
          />
        </div>
      </main>
    );
  }

  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const bookingId = checkoutState?.booking?.id || searchParams.get('bookingId') || '-';
  const paymentId = checkoutState?.payment?.id || searchParams.get('paymentId') || '-';
  const orderId = checkoutState?.order?.id || searchParams.get('orderId') || '-';
  const amount = checkoutState?.payment?.amount || checkoutState?.order?.amount || 0;


  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <PageHeader
          eyebrow={t('payment_success_title')}
          title={t('payment_success_title')}
          description={t('payment_success_description')}
        >
          <Badge variant="gold">{t('app_name')}</Badge>
        </PageHeader>

        <Card className="overflow-hidden">
          <div className="border-b border-border/60 bg-emerald-500/10 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-300">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-300/80">
                  {t('payment_success_title')}
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-foreground">
                  {checkoutState?.booking?.id ? t('booking_created_payment_prepared') : t('payment_success_title')}
                </h2>
              </div>
            </div>
          </div>

          <CardBody className="space-y-6 p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <StatCard label={t('home_booking_id')} value={bookingId} icon={Sparkles} />
              <StatCard label={t('home_payment')} value={paymentId} icon={CreditCard} tone="success" />
              <StatCard label={t('payments_amount')} value={formatCurrency(amount)} icon={ReceiptText} tone="success" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-border/70 bg-background/40">
                <CardBody className="space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">{t('payments_status')}</p>
                  <p className="text-sm font-semibold text-foreground">{t('payment_status_paid')}</p>
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
              <Button variant="primary" onClick={() => window.location.assign('/payments')}>
                {t('payments_view_dashboard')}
              </Button>
              <Button variant="secondary" onClick={() => window.location.assign('/booking')}>
                {t('home_new_booking')}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}
