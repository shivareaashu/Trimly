import * as leadsService from './leads.service.js';

export async function getLeads(req, res) {
  try {
    const tenantId = req.tenant.id;
    const leads = await leadsService.getLeads(tenantId);
    return res.status(200).json(leads);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list leads.' });
  }
}

export async function getLeadDetails(req, res) {
  try {
    const tenantId = req.tenant.id;
    const lead = await leadsService.getLeadDetails(tenantId, req.params.id);
    return res.status(200).json(lead);
  } catch (error) {
    return res.status(404).json({ error: error.message || 'Lead not found.' });
  }
}

export async function updateStatus(req, res) {
  try {
    const tenantId = req.tenant.id;
    const { status } = req.body;
    const lead = await leadsService.updateStatus(tenantId, req.params.id, status);
    return res.status(200).json({
      message: 'Lead status updated successfully.',
      lead
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update lead status.' });
  }
}
