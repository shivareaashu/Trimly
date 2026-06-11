import * as leadsRepo from './leads.repository.js';

const VALID_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST'];

export async function getLeads(tenantId) {
  return leadsRepo.findLeadsByTenant(tenantId);
}

export async function getLeadDetails(tenantId, id) {
  const lead = await leadsRepo.findLeadById(tenantId, id);
  if (!lead) {
    throw new Error('Lead not found.');
  }
  return lead;
}

export async function updateStatus(tenantId, id, status) {
  if (!VALID_STATUSES.includes(status)) {
    throw new Error(`Invalid status '${status}'. Allowed statuses are: ${VALID_STATUSES.join(', ')}`);
  }
  return leadsRepo.updateLeadStatus(tenantId, id, status);
}
