import * as themesService from './themes.service.js';

export async function getThemes(req, res) {
  try {
    const themes = await themesService.listThemes();
    return res.status(200).json(themes);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to list themes.' });
  }
}

export async function selectTheme(req, res) {
  try {
    const tenantId = req.tenant.id;
    const result = await themesService.selectTheme(tenantId, req.body);
    return res.status(200).json({
      message: 'Website theme updated successfully.',
      website: result
    });
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Failed to update theme.' });
  }
}
