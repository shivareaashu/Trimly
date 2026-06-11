import prisma from '../../../config/db.js';

export async function findFormsByTenant(tenantId) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return prisma.websiteForm.findMany({
    where: { websiteId: website.id },
    include: {
      fields: {
        orderBy: { sortOrder: 'asc' }
      }
    }
  });
}

export async function createForm(tenantId, formData) {
  const website = await prisma.website.findUnique({
    where: { tenantId }
  });

  if (!website) {
    throw new Error('Website not found.');
  }

  return prisma.websiteForm.create({
    data: {
      websiteId: website.id,
      name: formData.name,
      slug: formData.slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: formData.description || '',
      settings: formData.settings || {},
      isActive: formData.isActive !== undefined ? formData.isActive : true,
      fields: {
        create: (formData.fields || []).map((f, idx) => ({
          label: f.label,
          fieldKey: f.fieldKey,
          fieldType: f.fieldType,
          placeholder: f.placeholder || '',
          required: f.required || false,
          options: f.options || {},
          sortOrder: f.sortOrder !== undefined ? f.sortOrder : idx
        }))
      }
    },
    include: { fields: true }
  });
}

export async function updateForm(tenantId, formId, formData) {
  const form = await prisma.websiteForm.findFirst({
    where: {
      id: formId,
      website: { tenantId }
    }
  });

  if (!form) {
    throw new Error('Form not found.');
  }

  return prisma.$transaction(async (tx) => {
    // Clean old fields first
    await tx.websiteFormField.deleteMany({
      where: { formId }
    });

    return tx.websiteForm.update({
      where: { id: formId },
      data: {
        name: formData.name !== undefined ? formData.name : undefined,
        slug: formData.slug !== undefined ? formData.slug : undefined,
        description: formData.description !== undefined ? formData.description : undefined,
        settings: formData.settings !== undefined ? formData.settings : undefined,
        isActive: formData.isActive !== undefined ? formData.isActive : undefined,
        fields: {
          create: (formData.fields || []).map((f, idx) => ({
            label: f.label,
            fieldKey: f.fieldKey,
            fieldType: f.fieldType,
            placeholder: f.placeholder || '',
            required: f.required || false,
            options: f.options || {},
            sortOrder: f.sortOrder !== undefined ? f.sortOrder : idx
          }))
        }
      },
      include: { fields: true }
    });
  });
}

export async function deleteForm(tenantId, formId) {
  const form = await prisma.websiteForm.findFirst({
    where: {
      id: formId,
      website: { tenantId }
    }
  });

  if (!form) {
    throw new Error('Form not found.');
  }

  return prisma.websiteForm.delete({
    where: { id: formId }
  });
}
