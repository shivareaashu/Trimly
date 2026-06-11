import StitchScreenSlot from '@/components/stitch/StitchScreenSlot';
import TenantManagementFallback from '@/components/stitch-fallbacks/TenantManagementFallback';

export default function TenantManagementPage() {
  return (
    <StitchScreenSlot
      title="Trimly - Tenant Management Master (CRM)"
      src="/stitch-exports/tenant-management-master-crm/screen.html"
      fallbackImage="/stitch-exports/tenant-management-master-crm/screenshot.png"
      height={2048}
    >
      <TenantManagementFallback />
    </StitchScreenSlot>
  );
}
