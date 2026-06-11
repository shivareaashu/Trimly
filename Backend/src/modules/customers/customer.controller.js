import * as customerService from './customer.service.js';
import * as customerRepo from './customer.repository.js';
import { createCustomerSchema, updateCustomerSchema } from './customer.validation.js';
import { z } from 'zod';

/**
 * Express handler to list customers.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleListCustomers(req, res) {
  try {
    const filters = {
      search: req.query.search,
      tag: req.query.tag,
      lifecycleStatus: req.query.lifecycleStatus,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    };
    
    const customers = await customerRepo.findCustomers(req.tenant.id, filters);
    return res.status(200).json({ customers });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list customers.' });
  }
}

export async function handleCustomersDueForRevisit(req, res) {
  try {
    const range = req.query.range || '30';
    const filters = {
      horizonDays: ['today', '0'].includes(String(range).toLowerCase()) ? 0 : Number(range),
      inactive: String(range).toLowerCase() === 'inactive',
      lifecycleStatus: req.query.lifecycleStatus,
    };

    const customers = await customerService.getCustomersDueForRevisit(req.tenant.id, filters);
    return res.status(200).json({ customers });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to load revisit customers.' });
  }
}

export async function handleRefreshLifecycle(req, res) {
  try {
    const result = await customerService.refreshLifecycleForTenant(req.tenant.id);
    return res.status(200).json({ message: 'Customer lifecycle refreshed.', ...result });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to refresh lifecycle.' });
  }
}

/**
 * Express handler to get customer details with visit history.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetCustomer(req, res) {
  try {
    const customer = await customerRepo.findCustomerWithVisitHistory(req.tenant.id, req.params.id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found.' });
    }
    return res.status(200).json({ customer });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve customer.' });
  }
}

/**
 * Express handler to create a new customer.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleCreateCustomer(req, res) {
  try {
    const validatedData = createCustomerSchema.parse(req.body);
    const customer = await customerService.createCustomer(req.tenant.id, validatedData);
    
    return res.status(201).json({
      message: 'Customer profile created successfully.',
      customer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create customer.' });
  }
}

/**
 * Express handler to update a customer.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleUpdateCustomer(req, res) {
  try {
    const validatedData = updateCustomerSchema.parse(req.body);
    const customer = await customerService.updateCustomer(req.tenant.id, req.params.id, validatedData);
    
    return res.status(200).json({
      message: 'Customer profile updated successfully.',
      customer,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update customer.' });
  }
}

/**
 * Express handler to force recalculate customer metrics.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleRecalculateCustomer(req, res) {
  try {
    const customer = await customerService.recalculateCustomerMetrics(req.tenant.id, req.params.id);
    return res.status(200).json({
      message: 'Customer metrics recalculated successfully.',
      customer,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to recalculate metrics.' });
  }
}

export async function handleGetCustomerTimeline(req, res) {
  try {
    const events = await customerService.getCustomerTimeline(req.tenant.id, req.params.id);
    return res.status(200).json({ events });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch customer timeline.' });
  }
}

export async function handleGetLoyalty(req, res) {
  try {
    const account = await customerService.getLoyaltyAccount(req.tenant.id, req.params.id);
    return res.status(200).json({ loyalty: account });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch loyalty account.' });
  }
}

export async function handleAdjustLoyalty(req, res) {
  try {
    const { points, type, description } = req.body;
    if (!points || !type) {
      return res.status(400).json({ error: 'Points and transaction type are required.' });
    }
    const result = await customerService.adjustLoyaltyPoints(req.tenant.id, req.params.id, { points, type, description });
    return res.status(200).json({
      message: 'Loyalty balance updated successfully.',
      ...result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to adjust loyalty points.' });
  }
}

export async function handleGetMembershipPlans(req, res) {
  try {
    const plans = await customerService.getMembershipPlans(req.tenant.id);
    return res.status(200).json({ plans });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve membership plans.' });
  }
}

export async function handlePurchaseMembership(req, res) {
  try {
    const { planId, startsAt, endsAt, notes } = req.body;
    if (!planId) {
      return res.status(400).json({ error: 'Membership Plan ID is required.' });
    }
    const membership = await customerService.purchaseMembership(req.tenant.id, req.params.id, { planId, startsAt, endsAt, notes });
    return res.status(201).json({
      message: 'Membership purchased successfully.',
      membership
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to purchase membership.' });
  }
}
