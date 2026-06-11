export const MOCK_FINANCE = {
  pnl: {
    revenue: 487500,
    expenses: 142800,
    payroll: 320500,
    profit: 24200, // revenue - (expenses + payroll)
    margin: '5.0%', // profit / revenue
    averageTicketSize: '₹3,250',
    occupancyCost: '15.4%'
  },
  monthlyTrends: [
    { month: 'Jan', revenue: 420000, expenses: 130000, payroll: 280000, profit: 10000 },
    { month: 'Feb', revenue: 450000, expenses: 135000, payroll: 290000, profit: 25000 },
    { month: 'Mar', revenue: 470000, expenses: 140000, payroll: 310000, profit: 20000 },
    { month: 'Apr', revenue: 510000, expenses: 145000, payroll: 315000, profit: 50000 },
    { month: 'May', revenue: 487500, expenses: 142800, payroll: 320500, profit: 24200 }
  ],
  revenueBySource: [
    { source: 'Hair Services', amount: 268000, percentage: 55 },
    { source: 'Skin Services', amount: 121800, percentage: 25 },
    { source: 'Retail Products', amount: 58500, percentage: 12 },
    { source: 'Nail Services', amount: 39200, percentage: 8 }
  ]
};
