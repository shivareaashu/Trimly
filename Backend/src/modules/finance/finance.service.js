import prisma from '../../config/db.js';

export async function getFinancialSummary(tenantId, { startDate, endDate }) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  // 1. Calculate Gross Revenue from paid payments
  const payments = await prisma.payment.findMany({
    where: {
      tenantId,
      paymentStatus: 'PAID',
      paidAt: {
        gte: start,
        lte: end
      }
    }
  });
  
  const grossRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // 2. Query all expenses in this period
  const expenses = await prisma.expense.findMany({
    where: {
      tenantId,
      date: {
        gte: start,
        lte: end
      }
    }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  
  // Breakdown expenses
  const staffSalaryExpenses = expenses
    .filter(e => e.category === 'SALARY')
    .reduce((sum, e) => sum + Number(e.amount), 0);
    
  const otherExpenses = totalExpenses - staffSalaryExpenses;

  const netProfit = grossRevenue - totalExpenses;

  // 3. Category breakdown for charts
  const categories = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + Number(e.amount);
  });

  const categoryBreakdown = Object.entries(categories).map(([category, amount]) => ({
    category,
    amount: Number(amount.toFixed(2))
  }));

  return {
    period: {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    },
    metrics: {
      grossRevenue: Number(grossRevenue.toFixed(2)),
      totalExpenses: Number(totalExpenses.toFixed(2)),
      staffSalaryExpenses: Number(staffSalaryExpenses.toFixed(2)),
      otherExpenses: Number(otherExpenses.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      profitMarginPct: grossRevenue > 0 ? Number(((netProfit / grossRevenue) * 100).toFixed(2)) : 0
    },
    categoryBreakdown
  };
}
