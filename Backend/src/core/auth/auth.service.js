import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';
import { PLANS } from '../../shared/constants/plans.js'; // We will create this constants file next

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-trimly-saas';

/**
 * Service to handle registration of new Tenants and User Owner accounts.
 * Seeds standard roles and permissions for the tenant.
 * 
 * @param {Object} registrationData
 * @param {string} registrationData.salonName - Name of the salon
 * @param {string} registrationData.slug - Subdomain or URL slug (e.g. 'golden-cuts')
 * @param {string} registrationData.email - Owner's email
 * @param {string} registrationData.password - Owner's password
 * @param {string} registrationData.firstName - Owner's first name
 * @param {string} registrationData.lastName - Owner's last name
 * @returns {Promise<Object>} The registered tenant, user, and authorization token
 */
export async function registerTenant({ salonName, slug, email, password, firstName, lastName }) {
  // 1. Validate if tenant slug already exists
  const existingTenant = await prisma.tenant.findUnique({ where: { slug } });
  if (existingTenant) {
    throw new Error(`The slug '${slug}' is already taken.`);
  }

  // 2. Validate if user email already exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new Error(`The email '${email}' is already registered.`);
  }

  // 3. Ensure Plans are seeded in the database
  // In a real database run, we will make sure starter plan is available
  let starterPlan = await prisma.plan.findUnique({ where: { code: 'starter' } });
  if (!starterPlan) {
    starterPlan = await prisma.plan.create({
      data: {
        name: PLANS.STARTER.name,
        code: PLANS.STARTER.code,
        priceMonthly: 29.00,
        maxUsers: 5,
        maxBranches: 1,
      },
    });
  }

  for (const moduleCode of PLANS.STARTER.modules) {
    const module = await prisma.module.upsert({
      where: { code: moduleCode },
      update: { name: moduleCode },
      create: { code: moduleCode, name: moduleCode },
    });

    await prisma.planModule.upsert({
      where: {
        planId_moduleId: {
          planId: starterPlan.id,
          moduleId: module.id,
        },
      },
      update: { enabled: true },
      create: {
        planId: starterPlan.id,
        moduleId: module.id,
        enabled: true,
      },
    });
  }

  // 4. Hash user password
  const passwordHash = await bcrypt.hash(password, 10);

  // 5. Run transactional creation of tenant, owner user, default roles, permissions, and membership
  return await prisma.$transaction(async (tx) => {
    // A. Create Tenant
    const tenant = await tx.tenant.create({
      data: {
        name: salonName,
        slug,
        planId: starterPlan.id,
        subscriptionStatus: 'ACTIVE',
        settings: {
          timezone: 'UTC',
          currency: 'USD',
          theme: 'luxury',
          accentColor: 'gold',
        },
      },
    });

    // B. Create User
    const user = await tx.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
      },
    });

    // C. Seed standard permissions (if not present globally)
    const permissionsToSeed = [
      { action: 'dashboard.view', module: 'analytics', description: 'View dashboard overview' },
      { action: 'booking.view', module: 'bookings', description: 'View bookings' },
      { action: 'booking.create', module: 'bookings', description: 'Create bookings' },
      { action: 'booking.update', module: 'bookings', description: 'Update bookings' },
      { action: 'booking.delete', module: 'bookings', description: 'Cancel bookings' },
      { action: 'booking.checkin', module: 'bookings', description: 'Check in customers for bookings' },
      { action: 'booking.billing', module: 'bookings', description: 'Manage appointment billing queue' },
      { action: 'staff.view', module: 'staff', description: 'View staff members' },
      { action: 'staff.manage', module: 'staff', description: 'Manage staff and schedules' },
      { action: 'customer.view', module: 'customers', description: 'View customers' },
      { action: 'customer.manage', module: 'customers', description: 'Manage customer files' },
      { action: 'service.view', module: 'services', description: 'View service menu' },
      { action: 'service.create', module: 'services', description: 'Create services, categories, add-ons, and bundles' },
      { action: 'service.update', module: 'services', description: 'Update services, categories, add-ons, and bundles' },
      { action: 'service.delete', module: 'services', description: 'Deactivate services, add-ons, and bundles' },
      { action: 'website.manage', module: 'website', description: 'Modify tenant salon website' },
      { action: 'payment.view', module: 'payments', description: 'View tenant payments' },
      { action: 'payment.manage', module: 'payments', description: 'Process / refund payments' },
      { action: 'analytics.view', module: 'analytics', description: 'View dashboard analytics' },
      { action: 'supplier.view', module: 'inventory', description: 'View suppliers' },
      { action: 'supplier.manage', module: 'inventory', description: 'Manage suppliers' },
      { action: 'inventory.view', module: 'inventory', description: 'View inventory' },
      { action: 'inventory.manage', module: 'inventory', description: 'Manage inventory' },
      { action: 'payroll.view', module: 'staff', description: 'View payroll' },
      { action: 'payroll.manage', module: 'staff', description: 'Manage payroll' },
      { action: 'expenses.view', module: 'payments', description: 'View expenses' },
      { action: 'expenses.manage', module: 'payments', description: 'Manage expenses' },
      { action: 'finance.view', module: 'finance', description: 'View finance' },
      { action: 'finance.manage', module: 'finance', description: 'Manage finance' },
    ];

    const dbPermissions = [];
    for (const perm of permissionsToSeed) {
      const p = await tx.permission.upsert({
        where: { action: perm.action },
        update: {
          module: perm.module,
          description: perm.description,
        },
        create: perm,
      });
      dbPermissions.push(p);
    }

    // D. Create roles for the tenant: owner, admin, receptionist, staff, supplier
    const ownerRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Salon Owner',
        code: 'owner',
        description: 'Complete administration access to salon tenant settings and modules.',
      },
    });

    const adminRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Administrator',
        code: 'admin',
        description: 'Administration access to settings and modules.',
      },
    });

    const staffRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Salon Staff',
        code: 'staff',
        description: 'Standard staff view and update permissions.',
      },
    });

    const receptionistRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Receptionist',
        code: 'receptionist',
        description: 'Front desk access for walk-ins, check-ins, appointments, customer search, and billing collection.',
      },
    });

    const supplierRole = await tx.role.create({
      data: {
        tenantId: tenant.id,
        name: 'Supplier Partner',
        code: 'supplier',
        description: 'Supplier portal access.',
      },
    });

    // E. Link permissions to roles
    const adminPermActions = permissionsToSeed.map(p => p.action);
    const staffPermActions = ['dashboard.view', 'booking.view', 'booking.create', 'booking.update', 'customer.view', 'staff.view', 'service.view'];
    const receptionistPermActions = [
      'dashboard.view',
      'booking.view',
      'booking.create',
      'booking.update',
      'booking.delete',
      'booking.checkin',
      'booking.billing',
      'customer.view',
      'customer.manage',
      'staff.view',
      'service.view',
      'payment.view',
      'payment.manage',
    ];
    const supplierPermActions = ['supplier.view', 'inventory.view', 'payment.view'];

    // Bulk create RolePermissions
    for (const p of dbPermissions) {
      // Owner and Admin get all
      await tx.rolePermission.create({
        data: { roleId: ownerRole.id, permissionId: p.id },
      });
      await tx.rolePermission.create({
        data: { roleId: adminRole.id, permissionId: p.id },
      });

      if (staffPermActions.includes(p.action)) {
        await tx.rolePermission.create({
          data: { roleId: staffRole.id, permissionId: p.id },
        });
      }

      if (receptionistPermActions.includes(p.action)) {
        await tx.rolePermission.create({
          data: { roleId: receptionistRole.id, permissionId: p.id },
        });
      }

      if (supplierPermActions.includes(p.action)) {
        await tx.rolePermission.create({
          data: { roleId: supplierRole.id, permissionId: p.id },
        });
      }
    }

    // F. Create Membership linking Owner User to Tenant with Owner Role
    await tx.tenantMember.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: ownerRole.id,
      },
    });

    // G. Generate default website configuration
    await tx.website.create({
      data: {
        tenantId: tenant.id,
        templateCode: 'luxury',
        themeCode: 'gold',
        pages: {
          create: [
            {
              title: 'Home',
              slug: 'home',
              layout: [
                { type: 'hero', order: 1 },
                { type: 'services', order: 2 },
                { type: 'reviews', order: 3 },
                { type: 'contact', order: 4 },
              ],
              sections: {
                create: [
                  {
                    sectionType: 'hero',
                    order: 1,
                    content: {
                      title: `Welcome to ${salonName}`,
                      subtitle: 'Premium grooming services for elegant people.',
                      ctaText: 'Book Now',
                      ctaLink: '/book',
                    },
                  },
                  {
                    sectionType: 'services',
                    order: 2,
                    content: {
                      title: 'Our Services',
                      description: 'Explore our curated menu of hair, beauty, and wellness services.',
                    },
                  },
                  {
                    sectionType: 'reviews',
                    order: 3,
                    content: {
                      title: 'Client Love',
                      reviewsList: [
                        { author: 'Jane M.', rating: 5, comment: 'Phenomenal service, highly professional!' }
                      ],
                    },
                  },
                  {
                    sectionType: 'contact',
                    order: 4,
                    content: {
                      title: 'Get in Touch',
                      phone: '555-123-4567',
                      hours: 'Mon - Sat: 9:00 AM - 6:00 PM',
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    });

    return { tenant, user };
  });
}

/**
 * Service to login users and return JWT.
 * 
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      memberships: {
        include: {
          tenant: {
            include: {
              plan: {
                include: {
                  planModules: {
                    include: {
                      module: true,
                    },
                  },
                },
              },
              modules: {
                include: {
                  module: true,
                },
              },
            },
          },
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new Error('Invalid email or password.');
  }

  if (!user.isActive) {
    throw new Error('Account has been deactivated.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('Invalid email or password.');
  }

  // Generate session token
  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  // Format associated salons/tenants list
  const tenants = user.memberships.map((membership) => {
    // Compile active modules
    const planModules = (membership.tenant.plan?.planModules || [])
      .filter((planModule) => planModule.enabled)
      .map((planModule) => planModule.module?.code)
      .filter(Boolean);
    const overrides = membership.tenant.modules || [];
    let activeModules = [...planModules];
    for (const override of overrides) {
      const moduleCode = override.module?.code;
      if (!moduleCode) continue;

      if (override.enabled) {
        if (!activeModules.includes(moduleCode)) {
          activeModules.push(moduleCode);
        }
      } else {
        activeModules = activeModules.filter(m => m !== moduleCode);
      }
    }

    // Compile role permissions
    const permissions = membership.role.code === 'owner' || membership.role.code === 'admin'
      ? ['*']
      : membership.role.permissions.map((rp) => rp.permission.action);

    return {
      id: membership.tenant.id,
      name: membership.tenant.name,
      slug: membership.tenant.slug,
      role: {
        name: membership.role.name,
        code: membership.role.code,
      },
      planCode: membership.tenant.plan.code,
      permissions,
      activeModules,
    };
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isSuperAdmin: user.isSuperAdmin,
    },
    tenants,
  };
}
