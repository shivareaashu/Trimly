import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Globe,
  Package,
  Truck,
  FileText,
  Wallet,
  Receipt,
  TrendingUp,
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export const DEMO_NAVIGATION = [
  {
    title: 'Overview',
    items: [
      { label: 'Dashboard', href: '/demo/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Operations',
    items: [
      { label: 'Appointments', href: '/demo/calendar', icon: CalendarCheck },
      { label: 'Customers (CRM)', href: '/demo/customers', icon: Users },
      { label: 'Website Builder', href: '/demo/website-builder', icon: Globe },
      { label: 'Booking Widget', href: '/demo/booking', icon: Sparkles },
    ],
  },
  {
    title: 'Supply Chain',
    items: [
      { label: 'Inventory', href: '/demo/inventory', icon: Package },
      { label: 'Suppliers', href: '/demo/suppliers', icon: Truck },
      { label: 'Purchase Orders', href: '/demo/purchase-orders', icon: FileText },
    ],
  },
  {
    title: 'Staff & Finance',
    items: [
      { label: 'Staff Settings', href: '/demo/staff', icon: Users },
      { label: 'Payroll', href: '/demo/payroll', icon: Wallet },
      { label: 'Expenses', href: '/demo/expenses', icon: Receipt },
      { label: 'Finance P&L', href: '/demo/finance', icon: TrendingUp },
      { label: 'Payments History', href: '/demo/payments', icon: Wallet },
    ],
  },
  {
    title: 'Platform Management',
    items: [
      { label: 'Platform (SuperAdmin)', href: '/demo/platform', icon: ShieldAlert },
    ],
  },
];
