import * as inventoryService from './inventory.service.js';
import { 
  createCategorySchema, updateCategorySchema, 
  createItemSchema, updateItemSchema, 
  createAdjustmentSchema 
} from './inventory.validation.js';
import { z } from 'zod';

// =========================================================================
// CATEGORY CONTROLLER
// =========================================================================

export async function handleListCategories(req, res) {
  try {
    const categories = await inventoryService.getCategories(req.tenant.id);
    return res.status(200).json({ categories });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list categories.' });
  }
}

export async function handleGetCategory(req, res) {
  try {
    const category = await inventoryService.getCategory(req.tenant.id, req.params.id);
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
    const category = await inventoryService.createCategory(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Inventory category created successfully.',
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
    const category = await inventoryService.updateCategory(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Inventory category updated successfully.',
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
    await inventoryService.deleteCategory(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Inventory category deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete category.' });
  }
}

// =========================================================================
// ITEM CONTROLLER
// =========================================================================

export async function handleListItems(req, res) {
  try {
    const filters = {
      branchId: req.query.branchId,
      categoryId: req.query.categoryId,
      search: req.query.search,
      lowStock: req.query.lowStock,
    };
    const items = await inventoryService.getItems(req.tenant.id, filters);
    return res.status(200).json({ items });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list items.' });
  }
}

export async function handleGetItem(req, res) {
  try {
    const item = await inventoryService.getItem(req.tenant.id, req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found.' });
    }
    return res.status(200).json({ item });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to retrieve item.' });
  }
}

export async function handleCreateItem(req, res) {
  try {
    const validatedData = createItemSchema.parse(req.body);
    const item = await inventoryService.createItem(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Inventory item created successfully.',
      item,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to create item.' });
  }
}

export async function handleUpdateItem(req, res) {
  try {
    const validatedData = updateItemSchema.parse(req.body);
    const item = await inventoryService.updateItem(req.tenant.id, req.params.id, validatedData);
    return res.status(200).json({
      message: 'Inventory item updated successfully.',
      item,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to update item.' });
  }
}

export async function handleDeleteItem(req, res) {
  try {
    await inventoryService.deleteItem(req.tenant.id, req.params.id);
    return res.status(200).json({ message: 'Inventory item deleted successfully.' });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete item.' });
  }
}

// =========================================================================
// ADJUSTMENT CONTROLLER
// =========================================================================

export async function handleAdjustStock(req, res) {
  try {
    const validatedData = createAdjustmentSchema.parse(req.body);
    const adjustment = await inventoryService.adjustStock(req.tenant.id, validatedData);
    return res.status(201).json({
      message: 'Stock adjusted successfully.',
      adjustment,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Failed to adjust stock.' });
  }
}
