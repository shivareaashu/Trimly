export const MOCK_PLATFORM = {
  stats: {
    totalTenants: 154,
    activeTenants: 142,
    mrr: '₹18,45,000',
    pendingApprovalsCount: 3,
    growthRate: '+14.2%'
  },
  tenants: [
    { id: 't101', name: 'Lumière Atelier', owner: 'Aanya Kapoor', city: 'Mumbai', subscription: 'Enterprise', mrr: 15000, status: 'ACTIVE', created: '2026-01-15' },
    { id: 't102', name: 'Barber & Co', owner: 'Rajeev Sen', city: 'Delhi', subscription: 'Growth', mrr: 8500, status: 'ACTIVE', created: '2026-02-10' },
    { id: 't103', name: 'The Nail Bar', owner: 'Pooja Hegde', city: 'Bangalore', subscription: 'Growth', mrr: 8500, status: 'ACTIVE', created: '2026-03-01' },
    { id: 't104', name: 'Aroma Wellness Spa', owner: 'Suresh Raina', city: 'Goa', subscription: 'Enterprise', mrr: 15000, status: 'ACTIVE', created: '2026-03-12' },
    { id: 't105', name: 'Mirror Mirror Salon', owner: 'Divya Dutta', city: 'Pune', subscription: 'Starter', mrr: 3500, status: 'ACTIVE', created: '2026-04-05' },
    { id: 't106', name: 'Cut & Dry Studio', owner: 'Vikram Seth', city: 'Kolkata', subscription: 'Growth', mrr: 8500, status: 'SUSPENDED', created: '2026-04-18' },
    { id: 't107', name: 'Glamour Zone', owner: 'Tina Munim', city: 'Chennai', subscription: 'Starter', mrr: 3500, status: 'ACTIVE', created: '2026-05-02' }
  ],
  approvals: [
    { id: 'app01', salonName: 'Nature\'s Touch Spa', owner: 'Harish Rao', city: 'Hyderabad', planRequested: 'Growth', date: '2026-06-06', status: 'PENDING' },
    { id: 'app02', salonName: 'Vogue Hair Experts', owner: 'Sonali Bendre', city: 'Mumbai', planRequested: 'Enterprise', date: '2026-06-07', status: 'PENDING' },
    { id: 'app03', salonName: 'Tress & Beyond', owner: 'Manish Malhotra', city: 'Delhi', planRequested: 'Growth', date: '2026-06-07', status: 'PENDING' }
  ],
  mrrGrowth: [
    { month: 'Jan', value: 1240000 },
    { month: 'Feb', value: 1380000 },
    { month: 'Mar', value: 1520000 },
    { month: 'Apr', value: 1680000 },
    { month: 'May', value: 1845000 }
  ],
  subscriptions: [
    { name: 'Enterprise Plan', price: '₹15,000/mo', activeCount: 38, revenue: 570000 },
    { name: 'Growth Plan', price: '₹8,500/mo', activeCount: 74, revenue: 629000 },
    { name: 'Starter Plan', price: '₹3,500/mo', activeCount: 42, revenue: 147000 }
  ]
};
