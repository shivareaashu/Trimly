'use client';

import { useEffect, useState } from 'react';
import { bookingApi } from './services/bookingApi';
import { getFilteredWorkflow } from './bookingWorkflow';
import BookingProgress from './components/BookingProgress';
import BookingSummary from './components/BookingSummary';
import BookingWizard from './BookingWizard';
import { useBookingStore } from './store/bookingStore';
import { AlertCircle } from 'lucide-react';
import { Badge, Card, CardBody, EmptyState, LoadingState, PageHeader } from '../../components/ui';
import { useTranslation } from '../../hooks/useTranslation';

export default function BookingRenderer() {
  const { t } = useTranslation();
  const [config, setConfig] = useState(null);
  const [workflowSteps, setWorkflowSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentStep = useBookingStore((state) => {
    // Determine step index based on current workflow steps
    if (state.createdBooking) {
      return workflowSteps.length - 1; // confirmation step
    }
    
    // We can infer current step index from Zustand state properties
    if (!state.service) return 0; // service selection
    if (!state.staff) return 1; // staff selection
    if (!state.slot) return 2; // date_slot selection
    return 3; // details form input step
  });

  useEffect(() => {
    async function loadTenantConfig() {
      try {
        setLoading(true);
        const data = await bookingApi.getConfig();
        setConfig(data);
        
        // Resolve steps dynamically using dynamic workflow engine configuration rules
        const resolvedSteps = getFilteredWorkflow(data.activeModules || []);
        setWorkflowSteps(resolvedSteps);
      } catch (err) {
        setError(err.message || 'Unable to retrieve booking layout details.');
      } finally {
        setLoading(false);
      }
    }
    loadTenantConfig();
  }, []);

  if (loading) {
    return <LoadingState label={t('booking_processing')} />;
  }

  if (error) {
    return (
      <div className="min-h-screen px-4 py-8">
        <EmptyState
          title={t('portal_unavailable')}
          description={
            error.includes('subscription')
              ? t('portal_subscription_message')
              : t('portal_connection_message')
          }
          actionLabel={t('portal_retry')}
          onAction={() => window.location.reload()}
          icon={AlertCircle}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28 lg:pb-14">
      <BookingProgress
        steps={workflowSteps}
        currentStepIndex={currentStep}
        labels={{
          service: t('booking_step_service'),
          staff: t('booking_step_stylist'),
          date_slot: t('booking_step_schedule'),
          coupon: t('booking_step_coupon'),
          membership: t('booking_step_membership'),
          payment: t('booking_step_payment'),
          details: t('booking_step_details'),
          confirmation: t('booking_step_done'),
        }}
      />

      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:py-12">
        <div className="space-y-6">
          <PageHeader
            eyebrow={t('booking_portal_title')}
            title={config?.name ? `${config.name} ${t('page_appointments_title')}` : t('page_appointments_title')}
            description={t('booking_portal_description')}
          >
            <Badge variant="gold">{t('app_name')}</Badge>
          </PageHeader>

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.5fr_0.8fr]">
            <Card>
              <CardBody className="p-0">
                <BookingWizard steps={workflowSteps} />
              </CardBody>
            </Card>

            <BookingSummary />
          </div>
        </div>
      </main>
    </div>
  );
}
