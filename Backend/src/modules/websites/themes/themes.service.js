import * as themesRepo from './themes.repository.js';
import { resolveTheme } from '../engines/theme.engine.js';

export async function listThemes() {
  const dbThemes = await themesRepo.findThemes();
  if (dbThemes.length > 0) {
    return dbThemes;
  }

  // Fallback to static engine registry if db is empty
  const staticThemes = [
    resolveTheme('luxury'),
    resolveTheme('minimal'),
    resolveTheme('beauty'),
    resolveTheme('barber'),
    resolveTheme('spa'),
  ];
  return staticThemes;
}

export async function selectTheme(tenantId, themeData) {
  return themesRepo.updateWebsiteTheme(tenantId, themeData);
}
