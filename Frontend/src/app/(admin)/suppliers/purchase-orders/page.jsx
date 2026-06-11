import StitchScreenSlot from '@/components/stitch/StitchScreenSlot';
import PlaceholderPage from '@/components/admin/PlaceholderPage.jsx';

export default function PurchaseOrdersPage() {
  return (
    <StitchScreenSlot
      title="Trimly - Purchase Order Master (Inventory Workflow)"
      src="/stitch-exports/purchase-order-master-inventory-workflow/screen.html"
      fallbackImage="/stitch-exports/purchase-order-master-inventory-workflow/screenshot.png"
      height={2048}
    >
      <PlaceholderPage
        eyebrow="Supply Chain"
        title="Purchase Orders"
        description="Create and review purchase orders for salon inventory, products, and supplier fulfillment."
        items={['Draft orders', 'Approval flow', 'Supplier fulfillment']}
      />
    </StitchScreenSlot>
  );
}
