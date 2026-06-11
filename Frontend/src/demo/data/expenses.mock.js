export const MOCK_EXPENSES = {
  summary: {
    totalExpenses: '₹1,42,800',
    highestCategory: 'Rent & Utilities',
    pendingReimbursements: '₹3,500'
  },
  categories: [
    { name: 'Rent & Utilities', amount: 75000, percentage: 52, color: '#f43f5e' },
    { name: 'Salon Inventory', amount: 35000, percentage: 25, color: '#0ea5e9' },
    { name: 'Marketing & Ads', amount: 18000, percentage: 13, color: '#10b981' },
    { name: 'Staff Welfare & Training', amount: 14800, percentage: 10, color: '#f59e0b' }
  ],
  expenses: [
    { id: 'EXP2001', category: 'Rent & Utilities', description: 'Monthly Rent - Bandra Branch', amount: 65000, date: '2026-06-01', status: 'PAID', merchant: 'Turner Properties' },
    { id: 'EXP2002', category: 'Rent & Utilities', description: 'Electricity Bill - Bandra Branch', amount: 10000, date: '2026-06-03', status: 'PAID', merchant: 'BEST Mumbai' },
    { id: 'EXP2003', category: 'Salon Inventory', description: 'Olaplex Retail Stock Order', amount: 20000, date: '2026-06-04', status: 'PAID', merchant: 'BeautyPro Supplies' },
    { id: 'EXP2004', category: 'Marketing & Ads', description: 'Instagram Ad Campaign - Hair Specials', amount: 12000, date: '2026-06-05', status: 'PAID', merchant: 'Meta Platforms' },
    { id: 'EXP2005', category: 'Staff Welfare & Training', description: 'Advanced Hair Styling Workshop', amount: 10000, date: '2026-06-02', status: 'PAID', merchant: 'L\'Oréal Academy' },
    { id: 'EXP2006', category: 'Salon Inventory', description: 'Disposable Towels & Capes', amount: 15000, date: '2026-06-06', status: 'PAID', merchant: 'Salon Wholesale India' },
    { id: 'EXP2007', category: 'Marketing & Ads', description: 'Local SEO Management Fee', amount: 6000, date: '2026-06-05', status: 'PAID', merchant: 'GrowLocal SEO' },
    { id: 'EXP2008', category: 'Staff Welfare & Training', description: 'Team Dinner & Rewards', amount: 4800, date: '2026-06-06', status: 'PAID', merchant: 'The Olive Bar' }
  ]
};
