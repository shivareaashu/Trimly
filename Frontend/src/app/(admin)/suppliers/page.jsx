import StitchScreenSlot from '@/components/stitch/StitchScreenSlot';
import PlaceholderPage from '@/components/admin/PlaceholderPage.jsx';

export default function SuppliersPage() {
  return (
    <StitchScreenSlot
      title="Trimly - Supplier Management Master (CRM)"
      src="/stitch-exports/supplier-management-master-crm/screen.html"
      fallbackImage="/stitch-exports/supplier-management-master-crm/screenshot.png"
      height={2048}
    >
      <PlaceholderPage
        eyebrow="Supply Chain"
        title="Suppliers"
        description="Manage vendor profiles, product catalogs, billing terms, and preferred salon suppliers."
        items={['Supplier directory', 'Vendor terms', 'Product catalog']}
      />
    </StitchScreenSlot>
  );
}
