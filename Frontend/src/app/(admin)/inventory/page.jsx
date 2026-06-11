import StitchScreenSlot from '@/components/stitch/StitchScreenSlot';
import PlaceholderPage from '@/components/admin/PlaceholderPage.jsx';

export default function InventoryPage() {
  return (
    <StitchScreenSlot
      title="Trimly - Inventory Dashboard Master"
      src="/stitch-exports/inventory-dashboard-master/screen.html"
      fallbackImage="/stitch-exports/inventory-dashboard-master/screenshot.png"
      height={2048}
    >
      <PlaceholderPage
        eyebrow="Supply Chain"
        title="Inventory"
        description="Track retail stock, backbar products, low-stock alerts, and item movement across salon operations."
        items={['Stock overview', 'Low-stock alerts', 'Product movement']}
      />
    </StitchScreenSlot>
  );
}
