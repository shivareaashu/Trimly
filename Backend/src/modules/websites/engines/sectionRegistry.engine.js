import { DATA_SOURCE_ENTITIES } from '../constants/dataSourceTypes.js';
import { SECTION_CATEGORIES, SECTION_TYPES } from '../constants/sectionTypes.js';

function createDefinition(definition) {
  return {
    schema: {},
    settings: {},
    sources: [],
    defaultContent: {},
    defaultSettings: {},
    ...definition,
  };
}

export const SECTION_REGISTRY = {
  [SECTION_TYPES.HERO]: createDefinition({
    type: SECTION_TYPES.HERO,
    icon: 'sparkles',
    category: SECTION_CATEGORIES.BRAND,
    schema: { title: 'string', subtitle: 'string', imageId: 'media' },
    settings: { alignment: ['left', 'center'], height: ['compact', 'standard', 'full'] },
    defaultContent: { title: 'Welcome', subtitle: 'Premium salon experience' },
    defaultSettings: { alignment: 'left', height: 'standard' },
  }),
  [SECTION_TYPES.GALLERY]: createDefinition({
    type: SECTION_TYPES.GALLERY,
    icon: 'images',
    category: SECTION_CATEGORIES.CONTENT,
    schema: { imageIds: 'media[]' },
    sources: [DATA_SOURCE_ENTITIES.MEDIA],
  }),
  [SECTION_TYPES.SERVICES]: createDefinition({
    type: SECTION_TYPES.SERVICES,
    icon: 'scissors',
    category: SECTION_CATEGORIES.COMMERCE,
    schema: { source: 'dataSource', entity: DATA_SOURCE_ENTITIES.SERVICES },
    sources: [DATA_SOURCE_ENTITIES.SERVICES],
    defaultContent: { source: 'database', entity: DATA_SOURCE_ENTITIES.SERVICES, limit: 8 },
  }),
  [SECTION_TYPES.TEAM]: createDefinition({
    type: SECTION_TYPES.TEAM,
    icon: 'users',
    category: SECTION_CATEGORIES.CONTENT,
    schema: { source: 'dataSource', entity: DATA_SOURCE_ENTITIES.STAFF },
    sources: [DATA_SOURCE_ENTITIES.STAFF],
    defaultContent: { source: 'database', entity: DATA_SOURCE_ENTITIES.STAFF, limit: 6 },
  }),
  [SECTION_TYPES.REVIEWS]: createDefinition({
    type: SECTION_TYPES.REVIEWS,
    icon: 'star',
    category: SECTION_CATEGORIES.SOCIAL,
    sources: [DATA_SOURCE_ENTITIES.REVIEWS, DATA_SOURCE_ENTITIES.TESTIMONIALS],
  }),
  [SECTION_TYPES.FAQ]: createDefinition({
    type: SECTION_TYPES.FAQ,
    icon: 'circle-help',
    category: SECTION_CATEGORIES.CONTENT,
    schema: { items: 'faq[]' },
  }),
  [SECTION_TYPES.CONTACT]: createDefinition({
    type: SECTION_TYPES.CONTACT,
    icon: 'mail',
    category: SECTION_CATEGORIES.CONVERSION,
    schema: { phone: 'string', email: 'string', address: 'string' },
  }),
  [SECTION_TYPES.BOOKING_CTA]: createDefinition({
    type: SECTION_TYPES.BOOKING_CTA,
    icon: 'calendar-check',
    category: SECTION_CATEGORIES.CONVERSION,
    settings: { style: ['inline', 'floating'], mode: ['link', 'modal'] },
    defaultSettings: { style: 'floating', mode: 'link', target: '/booking', buttonText: 'Book Now' },
  }),
  [SECTION_TYPES.OFFERS]: createDefinition({
    type: SECTION_TYPES.OFFERS,
    icon: 'badge-percent',
    category: SECTION_CATEGORIES.COMMERCE,
    sources: [DATA_SOURCE_ENTITIES.OFFERS, DATA_SOURCE_ENTITIES.CAMPAIGNS],
  }),
  [SECTION_TYPES.BLOGS]: createDefinition({
    type: SECTION_TYPES.BLOGS,
    icon: 'newspaper',
    category: SECTION_CATEGORIES.CONTENT,
    sources: [DATA_SOURCE_ENTITIES.BLOGS],
  }),
  [SECTION_TYPES.INSTAGRAM]: createDefinition({
    type: SECTION_TYPES.INSTAGRAM,
    icon: 'instagram',
    category: SECTION_CATEGORIES.SOCIAL,
  }),
  [SECTION_TYPES.MAP]: createDefinition({
    type: SECTION_TYPES.MAP,
    icon: 'map-pin',
    category: SECTION_CATEGORIES.LOCATION,
    sources: [DATA_SOURCE_ENTITIES.BRANCHES],
  }),
  [SECTION_TYPES.BRANCHES]: createDefinition({
    type: SECTION_TYPES.BRANCHES,
    icon: 'building-2',
    category: SECTION_CATEGORIES.LOCATION,
    sources: [DATA_SOURCE_ENTITIES.BRANCHES],
    defaultContent: { source: 'database', entity: DATA_SOURCE_ENTITIES.BRANCHES, limit: 6 },
  }),
  [SECTION_TYPES.BEFORE_AFTER]: createDefinition({
    type: SECTION_TYPES.BEFORE_AFTER,
    icon: 'image',
    category: SECTION_CATEGORIES.CONTENT,
    schema: { pairs: 'beforeAfter[]' },
  }),
};

export function getSectionDefinition(sectionType) {
  return SECTION_REGISTRY[sectionType] || null;
}

export function assertRegisteredSection(sectionType) {
  const definition = getSectionDefinition(sectionType);
  if (!definition) {
    throw new Error(`Unknown website section type '${sectionType}'. Register it before rendering.`);
  }
  return definition;
}

export function listRegisteredSections() {
  return Object.values(SECTION_REGISTRY);
}
