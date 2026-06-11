import PlaceholderPage from '@/components/admin/PlaceholderPage.jsx';

export default function DeliveriesPage() {
  return (
    <PlaceholderPage
      eyebrow="Supply Chain"
      title="Deliveries"
      description="Track incoming supplier deliveries, receiving status, damaged items, and inventory updates."
      items={['Incoming deliveries', 'Receiving status', 'Inventory updates']}
    />
  );
}
