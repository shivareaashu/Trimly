import * as serviceService from './service.service.js';
import { 
  createServiceSchema, updateServiceSchema,
  createCategorySchema, updateCategorySchema, 
  createAddonSchema, updateAddonSchema, 
  createBundleSchema, updateBundleSchema 
} from './service.validation.js';
import { z } from 'zod';

// =========================================================================
// SERVICE CATEGORY CONTROLLER
// =========================================================================

export async function handleListCategories(req, res) {
  try {
    const categories = await serviceService.getCategories(req.tenant.id);
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list categories.' });
  }
}

export async function handleGetCategory(req, res) {
  try {
    const category = await serviceService.getCategory(req.tenant.id, req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.status(200).json({ category });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve category.' });
  }
}

export async function handleCreateCategory(req, res) {
  try {
    const validatedData = createCategorySchema.parse(req.body);
    const category = await serviceService.createCategory(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Service category created successfully.',
      category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create category.' });
  }
}

export async function handleUpdateCategory(req, res) {
  try {
    const validatedData = updateCategorySchema.parse(req.body);
    const category = await serviceService.updateCategory(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Service category updated successfully.',
      category,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update category.' });
  }
}

export async function handleDeleteCategory(req, res) {
  try {
    await serviceService.deleteCategory(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Service category deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete category.' });
  }
}

// =========================================================================
// SERVICE CONTROLLER
// =========================================================================

export async function handleListServices(req, res) {
  try {
    const services = await serviceService.getServices(req.tenant.id, {
      isActive: req.query.isActive === undefined ? undefined : req.query.isActive === 'true',
    });
    return res.status(200).json({ services });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list services.' });
  }
}

export async function handleGetService(req, res) {
  try {
    const service = await serviceService.getService(req.tenant.id, req.params.id);
    if (!service) return res.status(404).json({ error: 'Service not found.' });
    return res.status(200).json({ service });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve service.' });
  }
}

export async function handleCreateService(req, res) {
  try {
    const validatedData = createServiceSchema.parse(req.body);
    const service = await serviceService.createService(req.tenant.id, validatedData);
    return res.status(201).json({ message: 'Service created successfully.', service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create service.' });
  }
}

export async function handleUpdateService(req, res) {
  try {
    const validatedData = updateServiceSchema.parse(req.body);
    const service = await serviceService.updateService(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({ message: 'Service updated successfully.', service });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update service.' });
  }
}

export async function handleDeleteService(req, res) {
  try {
    const service = await serviceService.deleteService(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Service deactivated successfully.', service });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to deactivate service.' });
  }
}

// =========================================================================
// SERVICE ADDON CONTROLLER
// =========================================================================

export async function handleListAddons(req, res) {
  try {
    const addons = await serviceService.getAddons(req.tenant.id);
    return res.status(200).json({ addons });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list addons.' });
  }
}

export async function handleGetAddon(req, res) {
  try {
    const addon = await serviceService.getAddon(req.tenant.id, req.params.id);
    if (!addon) {
      return res.status(404).json({ error: 'Addon not found.' });
    }
    return res.status(200).json({ addon });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve addon.' });
  }
}

export async function handleCreateAddon(req, res) {
  try {
    const validatedData = createAddonSchema.parse(req.body);
    const addon = await serviceService.createAddon(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Service addon created successfully.',
      addon,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create addon.' });
  }
}

export async function handleUpdateAddon(req, res) {
  try {
    const validatedData = updateAddonSchema.parse(req.body);
    const addon = await serviceService.updateAddon(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Service addon updated successfully.',
      addon,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update addon.' });
  }
}

export async function handleDeleteAddon(req, res) {
  try {
    await serviceService.deleteAddon(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Service addon deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete addon.' });
  }
}

// =========================================================================
// SERVICE BUNDLE CONTROLLER
// =========================================================================

export async function handleListBundles(req, res) {
  try {
    const bundles = await serviceService.getBundles(req.tenant.id);
    return res.status(200).json({ bundles });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list bundles.' });
  }
}

export async function handleGetBundle(req, res) {
  try {
    const bundle = await serviceService.getBundle(req.tenant.id, req.params.id);
    if (!bundle) {
      return res.status(404).json({ error: 'Bundle not found.' });
    }
    return res.status(200).json({ bundle });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve bundle.' });
  }
}

export async function handleCreateBundle(req, res) {
  try {
    const validatedData = createBundleSchema.parse(req.body);
    const bundle = await serviceService.createBundle(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Service bundle created successfully.',
      bundle,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create bundle.' });
  }
}

export async function handleUpdateBundle(req, res) {
  try {
    const validatedData = updateBundleSchema.parse(req.body);
    const bundle = await serviceService.updateBundle(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Service bundle updated successfully.',
      bundle,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update bundle.' });
  }
}

export async function handleDeleteBundle(req, res) {
  try {
    await serviceService.deleteBundle(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Service bundle deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete bundle.' });
  }
}
