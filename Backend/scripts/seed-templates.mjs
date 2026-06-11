import prisma from '../src/config/db.js';

const THEMES = [
  {
    code: 'luxury',
    name: 'Luxury Gold',
    description: 'Sophisticated design with gold accents and elegant typography',
    tokens: {
      colors: {
        primary: '#735c00',
        secondary: '#5f5e5e',
        background: '#fbf9f9',
        surface: '#ffffff',
        accent: '#d4af37',
      },
      fonts: {
        heading: 'Bodoni Moda',
        body: 'Hanken Grotesk',
      },
      spacing: {
        section: '64px',
        container: '1200px',
      },
      buttons: {
        radius: '12px',
        weight: '700',
      },
      cards: {
        radius: '8px',
        border: '1px solid rgba(127,118,99,0.25)',
      },
    },
  },
  {
    code: 'minimal',
    name: 'Minimal Charcoal',
    description: 'Clean, spacious design with sharp contrast',
    tokens: {
      colors: {
        primary: '#1b1c1c',
        secondary: '#6b7280',
        background: '#ffffff',
        surface: '#f8fafc',
        accent: '#111827',
      },
      fonts: {
        heading: 'Hanken Grotesk',
        body: 'Hanken Grotesk',
      },
      spacing: {
        section: '56px',
        container: '1120px',
      },
      buttons: {
        radius: '8px',
        weight: '700',
      },
      cards: {
        radius: '8px',
        border: '1px solid #e5e7eb',
      },
    },
  },
  {
    code: 'beauty',
    name: 'Beauty Blossom',
    description: 'Soft pastel pinks and curved buttons for a premium feminine feel',
    tokens: {
      colors: {
        primary: '#9d174d',
        secondary: '#6b7280',
        background: '#fff7fb',
        surface: '#ffffff',
        accent: '#f9a8d4',
      },
      fonts: {
        heading: 'Bodoni Moda',
        body: 'Hanken Grotesk',
      },
      spacing: {
        section: '64px',
        container: '1180px',
      },
      buttons: {
        radius: '999px',
        weight: '700',
      },
      cards: {
        radius: '8px',
        border: '1px solid #fbcfe8',
      },
    },
  },
  {
    code: 'barber',
    name: 'Classic Barber',
    description: 'Industrial dark colors with amber highlight tones',
    tokens: {
      colors: {
        primary: '#111827',
        secondary: '#9ca3af',
        background: '#f9fafb',
        surface: '#ffffff',
        accent: '#b45309',
      },
      fonts: {
        heading: 'Hanken Grotesk',
        body: 'Hanken Grotesk',
      },
      spacing: {
        section: '60px',
        container: '1180px',
      },
      buttons: {
        radius: '6px',
        weight: '800',
      },
      cards: {
        radius: '6px',
        border: '1px solid #d1d5db',
      },
    },
  },
  {
    code: 'spa',
    name: 'Zen Forest',
    description: 'Tranquil greens and soft organic spacing for absolute relaxation',
    tokens: {
      colors: {
        primary: '#166534',
        secondary: '#64748b',
        background: '#f7fbf7',
        surface: '#ffffff',
        accent: '#86efac',
      },
      fonts: {
        heading: 'Bodoni Moda',
        body: 'Hanken Grotesk',
      },
      spacing: {
        section: '72px',
        container: '1160px',
      },
      buttons: {
        radius: '999px',
        weight: '700',
      },
      cards: {
        radius: '8px',
        border: '1px solid #bbf7d0',
      },
    },
  },
];

const DEFAULT_PAGES_LAYOUT = [
  {
    title: 'Home',
    slug: 'home',
    isHome: true,
    sortOrder: 0,
    sections: [
      {
        sectionType: 'hero',
        sortOrder: 0,
        content: {
          title: 'Welcome to Lumière Atelier',
          subtitle: 'Experience ultimate luxury in the heart of Mumbai.',
          imageId: 'default-hero-img-id',
        },
        settings: {
          alignment: 'center',
          height: 'standard',
        },
      },
      {
        sectionType: 'services',
        sortOrder: 1,
        content: {
          source: 'database',
          entity: 'services',
          limit: 8,
        },
        settings: {},
      },
      {
        sectionType: 'team',
        sortOrder: 2,
        content: {
          source: 'database',
          entity: 'staff',
          limit: 6,
        },
        settings: {},
      },
      {
        sectionType: 'booking_cta',
        sortOrder: 3,
        content: {
          title: 'Ready for a transformation?',
          buttonText: 'Book an Appointment Now',
        },
        settings: {
          style: 'floating',
          mode: 'link',
        },
      },
    ],
  },
  {
    title: 'Services',
    slug: 'services',
    isHome: false,
    sortOrder: 1,
    sections: [
      {
        sectionType: 'services',
        sortOrder: 0,
        content: {
          source: 'database',
          entity: 'services',
          limit: 12,
        },
        settings: {},
      },
      {
        sectionType: 'booking_cta',
        sortOrder: 1,
        content: {
          title: 'Secure your slot online',
          buttonText: 'Book Now',
        },
        settings: {
          style: 'inline',
        },
      },
    ],
  },
  {
    title: 'Team',
    slug: 'team',
    isHome: false,
    sortOrder: 2,
    sections: [
      {
        sectionType: 'team',
        sortOrder: 0,
        content: {
          source: 'database',
          entity: 'staff',
          limit: 10,
        },
        settings: {},
      },
    ],
  },
  {
    title: 'Gallery',
    slug: 'gallery',
    isHome: false,
    sortOrder: 3,
    sections: [
      {
        sectionType: 'gallery',
        sortOrder: 0,
        content: {
          imageIds: ['g1', 'g2', 'g3', 'g4'],
        },
        settings: {},
      },
    ],
  },
  {
    title: 'Contact',
    slug: 'contact',
    isHome: false,
    sortOrder: 4,
    sections: [
      {
        sectionType: 'contact',
        sortOrder: 0,
        content: {
          phone: '+91 22 2640 1234',
          email: 'contact@lumiereatelier.com',
          address: '12 Turner Rd, Bandra West, Mumbai',
        },
        settings: {},
      },
      {
        sectionType: 'map',
        sortOrder: 1,
        content: {
          source: 'database',
          entity: 'branches',
        },
        settings: {},
      },
    ],
  },
];

async function seed() {
  console.log('Cleaning existing templates and themes...');
  await prisma.websiteTemplate.deleteMany();
  await prisma.websiteTheme.deleteMany();

  console.log('Seeding Website Themes...');
  const createdThemes = [];
  for (const th of THEMES) {
    const theme = await prisma.websiteTheme.create({
      data: th,
    });
    createdThemes.push(theme);
    console.log(`Created theme: ${theme.name} (${theme.code})`);
  }

  const templates = [
    {
      name: 'Luxury Atelier Template',
      category: 'luxury',
      allowedSections: ['hero', 'services', 'team', 'gallery', 'reviews', 'booking_cta', 'contact', 'map'],
      layout: DEFAULT_PAGES_LAYOUT,
      defaultThemeId: createdThemes.find((t) => t.code === 'luxury').id,
    },
    {
      name: 'Minimal Studio Template',
      category: 'minimal',
      allowedSections: ['hero', 'services', 'team', 'booking_cta', 'contact'],
      layout: DEFAULT_PAGES_LAYOUT,
      defaultThemeId: createdThemes.find((t) => t.code === 'minimal').id,
    },
    {
      name: 'Barber & Co. Template',
      category: 'barber',
      allowedSections: ['hero', 'services', 'team', 'gallery', 'booking_cta', 'contact', 'map'],
      layout: DEFAULT_PAGES_LAYOUT,
      defaultThemeId: createdThemes.find((t) => t.code === 'barber').id,
    },
    {
      name: 'Blossom Beauty Template',
      category: 'beauty',
      allowedSections: ['hero', 'services', 'team', 'gallery', 'booking_cta', 'contact'],
      layout: DEFAULT_PAGES_LAYOUT,
      defaultThemeId: createdThemes.find((t) => t.code === 'beauty').id,
    },
    {
      name: 'Sutra Zen Spa Template',
      category: 'spa',
      allowedSections: ['hero', 'services', 'gallery', 'booking_cta', 'contact', 'map'],
      layout: DEFAULT_PAGES_LAYOUT,
      defaultThemeId: createdThemes.find((t) => t.code === 'spa').id,
    },
  ];

  console.log('Seeding Website Templates...');
  for (const tmpl of templates) {
    const template = await prisma.websiteTemplate.create({
      data: tmpl,
    });
    console.log(`Created template: ${template.name}`);
  }

  console.log('Seeding complete!');
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => process.exit(0));
