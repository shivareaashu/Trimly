import * as financeService from './finance.service.js';

export async function handleGetFinancialSummary(req, res) {
  try {
    const startDate = req.query.startDate || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const endDate = req.query.endDate || new Date().toISOString();

    const summary = await financeService.getFinancialSummary(req.tenant.id, { startDate, endDate });
    return res.status(200).json({ summary });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to fetch financial summary.' });
  }
}
