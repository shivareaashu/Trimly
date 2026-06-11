import * as pagesService from './pages.service.js';

export async function listPages(req, res) {
  try {
    const tenantId = req.tenant.id;
    const pages = await pagesService.listPages(tenantId);
    return res.status(200).json(pages);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list pages.' });
  }
}

export async function createPage(req, res) {
  try {
    const tenantId = req.tenant.id;
    const page = await pagesService.createPage(tenantId, req.body);
    return res.status(201).json({
      message: 'Page created successfully.',
      page
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create page.' });
  }
}

export async function updatePage(req, res) {
  try {
    const tenantId = req.tenant.id;
    const page = await pagesService.updatePage(tenantId, req.params.id, req.body);
    return res.status(200).json({
      message: 'Page updated successfully.',
      page
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update page.' });
  }
}

export async function deletePage(req, res) {
  try {
    const tenantId = req.tenant.id;
    await pagesService.deletePage(tenantId, req.params.id);
    return res.status(200).json({
      message: 'Page deleted successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to delete page.' });
  }
}

export async function reorderPages(req, res) {
  try {
    const tenantId = req.tenant.id;
    await pagesService.reorderPages(tenantId, req.body.reorderList || req.body);
    return res.status(200).json({
      message: 'Pages reordered successfully.'
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to reorder pages.' });
  }
}
