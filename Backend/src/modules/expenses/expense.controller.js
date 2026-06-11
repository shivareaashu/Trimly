import * as expenseService from './expense.service.js';

export async function handleCreateExpense(req, res) {
  try {
    const log = await expenseService.createExpense(req.tenant.id, req.body);
    return res.status(201).json({
      message: 'Expense recorded successfully.',
      expense: log
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to record expense.' });
  }
}

export async function handleUpdateExpense(req, res) {
  try {
    const { id } = req.params;
    const log = await expenseService.updateExpense(req.tenant.id, id, req.body);
    return res.status(200).json({
      message: 'Expense record updated successfully.',
      expense: log
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update expense.' });
  }
}

export async function handleDeleteExpense(req, res) {
  try {
    const { id } = req.params;
    await expenseService.deleteExpense(req.tenant.id, id);
    return res.status(200).json({
      message: 'Expense record deleted successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete expense.' });
  }
}

export async function handleListExpenses(req, res) {
  try {
    const filters = {
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate
    };
    const logs = await expenseService.getExpenseList(req.tenant.id, filters);
    return res.status(200).json({ expenses: logs });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to fetch expense records.' });
  }
}
