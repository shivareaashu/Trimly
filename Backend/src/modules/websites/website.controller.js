import * as websiteService from './website.service.js';
import { updateConfigSchema, updateLayoutSchema, updateSectionSchema } from './website.validation.js';
import { z } from 'zod';

/**
 * Controller to fetch draft editor configuration.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleGetEditorData(req, res) {
  try {
    const data = await websiteService.getEditorData(req.tenant.id);
    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch editor data.' });
  }
}

/**
 * Controller to update template and theme configs.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleUpdateConfig(req, res) {
  try {
    const validatedData = updateConfigSchema.parse(req.body);
    const result = await websiteService.updateConfig(req.tenant.id, validatedData);
    
    return res.status(200).json({
      message: 'Website configuration updated.',
      website: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Update failed.' });
  }
}

/**
 * Controller to reorder / toggle page layout.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleUpdateLayout(req, res) {
  try {
    const validatedData = updateLayoutSchema.parse(req.body);
    const result = await websiteService.updateLayout(req.tenant.id, req.params.pageId, validatedData.layout);
    
    return res.status(200).json({
      message: 'Layout configurations updated.',
      page: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Update failed.' });
  }
}

/**
 * Controller to update a specific section content block.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleUpdateSection(req, res) {
  try {
    const validatedData = updateSectionSchema.parse(req.body);
    const result = await websiteService.updateSection(req.tenant.id, req.params.sectionId, validatedData);
    
    return res.status(200).json({
      message: 'Section content updated.',
      section: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Update failed.' });
  }
}

/**
 * Controller to deploy drafts live.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handlePublishWebsite(req, res) {
  try {
    const result = await websiteService.publishWebsite(req.tenant.id, req.user?.id || 'system');
    return res.status(200).json({
      message: 'Website published live successfully.',
      website: result,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to publish website.' });
  }
}

export async function handleCreatePreviewToken(req, res) {
  try {
    const result = await websiteService.createWebsitePreviewToken(req.tenant.id, req.user?.id || 'system');
    return res.status(201).json({
      message: 'Website preview token created successfully.',
      ...result,
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to create preview token.' });
  }
}

export default {
  handleGetEditorData,
  handleUpdateConfig,
  handleUpdateLayout,
  handleUpdateSection,
  handlePublishWebsite,
  handleCreatePreviewToken,
};
