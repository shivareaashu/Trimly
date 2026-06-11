import { z } from 'zod';
import { TEMPLATES, THEMES } from './website.constants.js';

export const updateConfigSchema = z.object({
  name: z.string().trim().min(1).optional(),
  themeId: z.string().uuid().nullable().optional(),
  templateId: z.string().uuid().nullable().optional(),
  bookingSettingsId: z.string().uuid().nullable().optional(),
  templateCode: z.enum(TEMPLATES).optional(),
  themeCode: z.enum(THEMES).optional(),
  customDomain: z.string().nullable().optional(),
});

export const updateLayoutSchema = z.object({
  layout: z.array(z.object({
    sectionId: z.string().uuid(),
    order: z.number().int(),
    enabled: z.boolean(),
  })),
});

// Content validators for sections
const galleryContentSchema = z.object({
  images: z.array(z.object({
    url: z.string().url('Must be a valid media URL.'),
    alt: z.string().optional().default(''),
    order: z.number().int(),
  })),
});

const servicesContentSchema = z.object({
  source: z.literal('database', { message: 'Services source must be set to "database" to query the service table.' }),
});

export const updateSectionSchema = z.object({
  order: z.number().int().optional(),
  sortOrder: z.number().int().optional(),
  enabled: z.boolean().optional(),
  settings: z.record(z.any()).optional(),
  content: z.record(z.any()).optional().refine((data) => {
    // Custom refinements can be added depending on sectionType.
    // For general content we allow key-value json dictionaries.
    return true;
  }, { message: 'Invalid section content.' }),
});
