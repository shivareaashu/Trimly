import prisma from '../../config/db.js';

export async function createExpense(tenantId, data) {
  if (!data.category || !data.amount || !data.date) {
    throw new Error('Category, amount, and date are required fields.');
  }

  return prisma.expense.create({
    data: {
      tenantId,
      category: data.category,
      amount: Number(data.amount),
      description: data.description || null,
      date: new Date(data.date)
    }
  });
}

export async function updateExpense(tenantId, id, data) {
  const existing = await prisma.expense.findFirst({
    where: { id, tenantId }
  });

  if (!existing) {
    throw new Error('Expense record not found.');
  }

  const updateData = {};
  if (data.category) updateData.category = data.category;
  if (data.amount !== undefined) updateData.amount = Number(data.amount);
  if (data.description !== undefined) updateData.description = data.description;
  if (data.date) updateData.date = new Date(data.date);

  return prisma.expense.update({
    where: { id },
    data: updateData
  });
}

export async function deleteExpense(tenantId, id) {
  const existing = await prisma.expense.findFirst({
    where: { id, tenantId }
  });

  if (!existing) {
    throw new Error('Expense record not found.');
  }

  return prisma.expense.delete({
    where: { id }
  });
}

export async function getExpenseList(tenantId, filters = {}) {
  const where = { tenantId };

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) {
      where.date.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      where.date.lte = new Date(filters.endDate);
    }
  }

  return prisma.expense.findMany({
    where,
    orderBy: { date: 'desc' }
  });
}
