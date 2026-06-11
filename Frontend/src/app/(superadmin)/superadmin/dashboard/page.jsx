import StitchScreenSlot from '@/components/stitch/StitchScreenSlot';
import SuperAdminDashboardFallback from '@/components/stitch-fallbacks/SuperAdminDashboardFallback';

export default function SuperAdminDashboardPage() {
  return (
    <StitchScreenSlot
      title="Trimly - Super Admin Dashboard (Control Tower)"
      src="/stitch-exports/super-admin-dashboard-control-tower/screen.html"
      fallbackImage="/stitch-exports/super-admin-dashboard-control-tower/screenshot.png"
      height={2048}
    >
      <SuperAdminDashboardFallback />
    </StitchScreenSlot>
  );
}
