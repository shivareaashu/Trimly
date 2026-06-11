import * as payrollService from './payroll.service.js';

export async function handleGeneratePayroll(req, res) {
  try {
    const month = parseInt(req.body.month || new Date().getMonth() + 1);
    const year = parseInt(req.body.year || new Date().getFullYear());

    const records = await payrollService.generateMonthlyPayroll(req.tenant.id, { month, year });
    return res.status(201).json({
      message: 'Monthly payroll run generated successfully.',
      payroll: records
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to generate payroll.' });
  }
}

export async function handleApprovePayroll(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Payroll record ID is required.' });
    }

    const record = await payrollService.approvePayroll(req.tenant.id, id);
    return res.status(200).json({
      message: 'Payroll record approved successfully.',
      payroll: record
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to approve payroll.' });
  }
}

export async function handlePayPayroll(req, res) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Payroll record ID is required.' });
    }

    const record = await payrollService.processPayrollPayout(req.tenant.id, id);
    return res.status(200).json({
      message: 'Payroll payout marked as PAID and filed to Expense register.',
      payroll: record
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to pay payroll.' });
  }
}

export async function handleListPayroll(req, res) {
  try {
    const filters = {
      month: req.query.month,
      year: req.query.year,
      status: req.query.status,
      staffId: req.query.staffId
    };
    const records = await payrollService.listPayrollRecords(req.tenant.id, filters);
    return res.status(200).json({ payroll: records });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to fetch payroll list.' });
  }
}
