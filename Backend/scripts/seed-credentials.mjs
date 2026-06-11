import 'dotenv/config';
import bcrypt from 'bcryptjs';
import prisma from '../src/config/db.js';
import { PLANS } from '../src/shared/constants/plans.js';

const PASSWORD = '123456';
const SUPER_ADMIN_EMAIL = 'superadmin@trimly.in';
const SALON_SLUG = 'lumiere-atelier';
const SALON_NAME = 'Lumiere Atelier';

const moduleNames = {
  website: 'Website Builder',
  bookings: 'Bookings',
  staff: 'Staff',
  services: 'Services',
  customers: 'Customers',
  payments: 'Payments',
  whatsapp: 'WhatsApp',
  loyalty: 'Loyalty',
  inventory: 'Inventory',
  pos: 'Point of Sale',
  analytics: 'Analytics',
  marketing: 'Marketing',
  branches: 'Branches',
  payroll: 'Payroll',
  finance: 'Finance',
  attendance: 'Attendance',
};

const planDetails = {
  starter: { priceMonthly: 29.0, maxUsers: 5, maxBranches: 1 },
  growth: { priceMonthly: 79.0, maxUsers: 20, maxBranches: 3 },
  premium: { priceMonthly: 149.0, maxUsers: 100, maxBranches: 10 },
};

const permissionsToSeed = [
  { action: 'dashboard.view', module: 'analytics', description: 'View dashboard overview' },
  { action: 'booking.view', module: 'bookings', description: 'View bookings' },
  { action: 'booking.create', module: 'bookings', description: 'Create bookings' },
  { action: 'booking.update', module: 'bookings', description: 'Update bookings' },
  { action: 'booking.delete', module: 'bookings', description: 'Cancel bookings' },
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

async function ensureModules(moduleCodes) {
  const modules = {};

  for (const code of moduleCodes) {
    modules[code] = await prisma.module.upsert({
      where: { code },
      update: { name: moduleNames[code] ?? code },
      create: {
        code,
        name: moduleNames[code] ?? code,
      },
    });
  }

  return modules;
}

async function syncPlanModules(plan, moduleCodes, modules) {
  const enabledModuleIds = moduleCodes.map((code) => modules[code].id);

  await prisma.planModule.deleteMany({
    where: {
      planId: plan.id,
      moduleId: { notIn: enabledModuleIds },
    },
  });

  for (const code of moduleCodes) {
    await prisma.planModule.upsert({
      where: {
        planId_moduleId: {
          planId: plan.id,
          moduleId: modules[code].id,
        },
      },
      update: { enabled: true },
      create: {
        planId: plan.id,
        moduleId: modules[code].id,
        enabled: true,
      },
    });
  }
}

async function ensurePlans() {
  const allModuleCodes = [...new Set(Object.values(PLANS).flatMap((plan) => plan.modules))];
  const modules = await ensureModules(allModuleCodes);

  const starter = await prisma.plan.upsert({
    where: { code: PLANS.STARTER.code },
    update: {
      name: PLANS.STARTER.name,
      ...planDetails[PLANS.STARTER.code],
    },
    create: {
      name: PLANS.STARTER.name,
      code: PLANS.STARTER.code,
      ...planDetails[PLANS.STARTER.code],
    },
  });

  const growth = await prisma.plan.upsert({
    where: { code: PLANS.GROWTH.code },
    update: {
      name: PLANS.GROWTH.name,
      ...planDetails[PLANS.GROWTH.code],
    },
    create: {
      name: PLANS.GROWTH.name,
      code: PLANS.GROWTH.code,
      ...planDetails[PLANS.GROWTH.code],
    },
  });

  const premium = await prisma.plan.upsert({
    where: { code: PLANS.PREMIUM.code },
    update: {
      name: PLANS.PREMIUM.name,
      ...planDetails[PLANS.PREMIUM.code],
    },
    create: {
      name: PLANS.PREMIUM.name,
      code: PLANS.PREMIUM.code,
      ...planDetails[PLANS.PREMIUM.code],
    },
  });

  await syncPlanModules(starter, PLANS.STARTER.modules, modules);
  await syncPlanModules(growth, PLANS.GROWTH.modules, modules);
  await syncPlanModules(premium, PLANS.PREMIUM.modules, modules);

  return { starter, growth, premium, modules };
}

async function syncRolePermissions(role, permissionActions) {
  const rolePerms = await prisma.permission.findMany({
    where: { action: { in: permissionActions } },
  });
  
  // Clear old role permissions to avoid duplicates
  await prisma.rolePermission.deleteMany({
    where: { roleId: role.id },
  });

  for (const perm of rolePerms) {
    await prisma.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: perm.id,
      },
    });
  }
}

async function main() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  
  // 1. Setup Plans
  const { modules } = await ensurePlans();
  const premiumPlan = await prisma.plan.findUnique({ where: { code: 'premium' } });

  // 2. Setup Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: SALON_SLUG },
    update: {
      name: SALON_NAME,
      planId: premiumPlan.id,
      subscriptionStatus: 'ACTIVE',
    },
    create: {
      name: SALON_NAME,
      slug: SALON_SLUG,
      planId: premiumPlan.id,
      subscriptionStatus: 'ACTIVE',
      settings: {
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        theme: 'luxury',
        accentColor: 'gold',
      },
    },
  });

  // 2.5 Setup Default Branch
  const branch = await prisma.branch.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Lumiere Atelier Bandra' } },
    update: { code: 'BOM-1', address: 'Bandra West, Mumbai', phone: '+91 99999 88888' },
    create: {
      tenantId: tenant.id,
      name: 'Lumiere Atelier Bandra',
      code: 'BOM-1',
      address: 'Bandra West, Mumbai',
      phone: '+91 99999 88888'
    }
  });

  // 3. Enable All Modules for Tenant via TenantModule Overrides
  const modulesToEnable = [
    'website', 'bookings', 'staff', 'customers', 'payments', 'whatsapp',
    'services',
    'loyalty', 'inventory', 'pos', 'analytics', 'marketing', 'branches',
    'payroll', 'finance', 'attendance'
  ];

  for (const mCode of modulesToEnable) {
    await prisma.tenantModule.upsert({
      where: {
        tenantId_moduleId: {
          tenantId: tenant.id,
          moduleId: modules[mCode].id
        }
      },
      update: {
        enabled: true
      },
      create: {
        tenantId: tenant.id,
        moduleId: modules[mCode].id,
        enabled: true
      }
    });
  }

  // 4. Seed Permissions
  const permissions = [];
  for (const perm of permissionsToSeed) {
    permissions.push(
      await prisma.permission.upsert({
        where: { action: perm.action },
        update: {
          module: perm.module,
          description: perm.description,
        },
        create: perm,
      })
    );
  }

  // 5. Create Roles
  const ownerRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'owner' } },
    update: { name: 'Salon Owner', description: 'Full owner access' },
    create: { tenantId: tenant.id, name: 'Salon Owner', code: 'owner', description: 'Full owner access' },
  });

  const adminRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'admin' } },
    update: { name: 'Administrator', description: 'Administrative access' },
    create: { tenantId: tenant.id, name: 'Administrator', code: 'admin', description: 'Administrative access' },
  });

  const staffRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'staff' } },
    update: { name: 'Salon Staff', description: 'Standard staff access' },
    create: { tenantId: tenant.id, name: 'Salon Staff', code: 'staff', description: 'Standard staff access' },
  });

  const supplierRole = await prisma.role.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'supplier' } },
    update: { name: 'Supplier Partner', description: 'Supplier access' },
    create: { tenantId: tenant.id, name: 'Supplier Partner', code: 'supplier', description: 'Supplier access' },
  });

  // Sync role permissions
  const allActions = permissionsToSeed.map(p => p.action);
  await syncRolePermissions(ownerRole, allActions);
  await syncRolePermissions(adminRole, allActions);

  const staffActions = ['dashboard.view', 'booking.view', 'booking.create', 'booking.update', 'customer.view', 'staff.view'];
  await syncRolePermissions(staffRole, staffActions);

  const supplierActions = ['supplier.view', 'inventory.view', 'payment.view'];
  await syncRolePermissions(supplierRole, supplierActions);

  // 6. Create Users & Memberships
  const usersToSeed = [
    { email: 'salonadmin@mail.in', firstName: 'Aarav', lastName: 'Mehta', roleCode: 'owner' },
    { email: 'admin@trimly.in', firstName: 'Dev', lastName: 'Sharma', roleCode: 'admin' },
    { email: 'staff@trimly.in', firstName: 'Priya', lastName: 'Sharma', roleCode: 'staff' },
    { email: 'supplier@trimly.in', firstName: 'Rajesh', lastName: 'Kumar', roleCode: 'supplier' },
  ];

  const roleMap = {
    owner: ownerRole,
    admin: adminRole,
    staff: staffRole,
    supplier: supplierRole,
  };

  const dbUsers = {};
  for (const u of usersToSeed) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        isActive: true,
        isSuperAdmin: false,
      },
      create: {
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        passwordHash,
        isActive: true,
        isSuperAdmin: false,
      },
    });
    dbUsers[u.roleCode] = user;

    const role = roleMap[u.roleCode];
    await prisma.tenantMember.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user.id,
        },
      },
      update: {
        roleId: role.id,
      },
      create: {
        tenantId: tenant.id,
        userId: user.id,
        roleId: role.id,
      },
    });
  }

  // Ensure super admin
  await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      isSuperAdmin: true,
    },
    create: {
      email: SUPER_ADMIN_EMAIL,
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      isActive: true,
      isSuperAdmin: true,
    },
  });

  // 7. Seed Indian Salon Services
  const hairCategory = await prisma.serviceCategory.upsert({
    where: { id: 'cat-hair-styling' },
    update: { name: 'Hair Styling & Spa', tenantId: tenant.id },
    create: { id: 'cat-hair-styling', name: 'Hair Styling & Spa', tenantId: tenant.id, order: 1 }
  });

  const skinCategory = await prisma.serviceCategory.upsert({
    where: { id: 'cat-skin-care' },
    update: { name: 'Skin Care & Facials', tenantId: tenant.id },
    create: { id: 'cat-skin-care', name: 'Skin Care & Facials', tenantId: tenant.id, order: 2 }
  });

  const makeupCategory = await prisma.serviceCategory.upsert({
    where: { id: 'cat-makeup' },
    update: { name: 'Bridal & Party Makeup', tenantId: tenant.id },
    create: { id: 'cat-makeup', name: 'Bridal & Party Makeup', tenantId: tenant.id, order: 3 }
  });

  const services = [
    { id: 'srv-haircut', categoryId: hairCategory.id, name: 'Signature Haircut', price: 1200.00, duration: 45 },
    { id: 'srv-balayage', categoryId: hairCategory.id, name: 'Balayage Artistry', price: 7500.00, duration: 150 },
    { id: 'srv-keratin', categoryId: hairCategory.id, name: 'Keratin Spa Treatment', price: 6000.00, duration: 120 },
    { id: 'srv-facial', categoryId: skinCategory.id, name: 'Deep Hydration Facial', price: 3200.00, duration: 60 },
    { id: 'srv-tan', categoryId: skinCategory.id, name: 'Tan Removal Treatment', price: 2000.00, duration: 45 },
    { id: 'srv-bridal', categoryId: makeupCategory.id, name: 'Bridal Makeup Consultation', price: 15000.00, duration: 180 },
    { id: 'srv-airbrush', categoryId: makeupCategory.id, name: 'Airbrush Party Glow', price: 8500.00, duration: 90 },
  ];

  for (const s of services) {
    await prisma.service.upsert({
      where: { id: s.id },
      update: {
        categoryId: s.categoryId,
        name: s.name,
        price: s.price,
        duration: s.duration,
        tenantId: tenant.id,
      },
      create: {
        id: s.id,
        categoryId: s.categoryId,
        name: s.name,
        price: s.price,
        duration: s.duration,
        tenantId: tenant.id,
      }
    });
  }

  // 8. Seed Staff Profiles
  const staffToCreate = [
    { id: 'staff-priya', name: 'Priya Sharma', email: 'staff@trimly.in', userId: dbUsers.staff.id, baseSalary: 45000.00, commissionValue: 15.00 },
    { id: 'staff-vikram', name: 'Vikram Singh', email: 'vikram@trimly.in', userId: null, baseSalary: 30000.00, commissionValue: 10.00 },
    { id: 'staff-karan', name: 'Karan Malhotra', email: 'karan@trimly.in', userId: null, baseSalary: 35000.00, commissionValue: 12.00 },
    { id: 'staff-riya', name: 'Riya Sen', email: 'riya@trimly.in', userId: null, baseSalary: 32000.00, commissionValue: 10.00 },
  ];

  for (const st of staffToCreate) {
    await prisma.staff.upsert({
      where: { id: st.id },
      update: {
        name: st.name,
        email: st.email,
        userId: st.userId,
        baseSalary: st.baseSalary,
        commissionValue: st.commissionValue,
        tenantId: tenant.id,
        branchId: branch.id,
      },
      create: {
        id: st.id,
        name: st.name,
        email: st.email,
        userId: st.userId,
        baseSalary: st.baseSalary,
        commissionValue: st.commissionValue,
        tenantId: tenant.id,
        branchId: branch.id,
      }
    });
  }

  // 9. Seed Indian Customers
  const customersToCreate = [
    { id: 'cust-ananya', firstName: 'Ananya', lastName: 'Malhotra', email: 'ananya@gmail.com', phone: '+91 98100 12345', normalizedPhone: '919810012345', tags: ['VIP'], totalSpending: 18500.00, notes: 'Prefers mild lavender scents.' },
    { id: 'cust-rohan', firstName: 'Rohan', lastName: 'Kapoor', email: 'rohan.k@gmail.com', phone: '+91 98100 54321', normalizedPhone: '919810054321', tags: ['NEW'], totalSpending: 3200.00, notes: 'Requires low-heat styling.' },
    { id: 'cust-sana', firstName: 'Sana', lastName: 'Patel', email: 'sana.p@gmail.com', phone: '+91 98200 67890', normalizedPhone: '919820067890', tags: ['VIP'], totalSpending: 15000.00, notes: 'Loves ayurvedic treatments.' },
    { id: 'cust-amit', firstName: 'Amit', lastName: 'Verma', email: 'amit.v@yahoo.com', phone: '+91 98300 11223', normalizedPhone: '919830011223', tags: ['NEW'], totalSpending: 1200.00, notes: 'Weekend bookings only.' },
    { id: 'cust-sneha', firstName: 'Sneha', lastName: 'Reddy', email: 'sneha.r@gmail.com', phone: '+91 98400 44556', normalizedPhone: '919840044556', tags: ['VIP'], totalSpending: 24500.00, notes: 'Always books Balayage.' },
  ];

  for (const c of customersToCreate) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: {
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        normalizedPhone: c.normalizedPhone,
        tags: c.tags,
        totalSpending: c.totalSpending,
        notes: c.notes,
        tenantId: tenant.id,
        branchId: branch.id,
      },
      create: {
        id: c.id,
        firstName: c.firstName,
        lastName: c.lastName,
        email: c.email,
        phone: c.phone,
        normalizedPhone: c.normalizedPhone,
        tags: c.tags,
        totalSpending: c.totalSpending,
        notes: c.notes,
        tenantId: tenant.id,
        branchId: branch.id,
      }
    });
  }

  // 10. Seed Appointments (Today, Yesterday, Tomorrow)
  const now = new Date();
  const today11 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 30);
  const today12 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 45);
  const today14 = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 15);
  const tomorrow10 = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0);
  const yesterday16 = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 16, 0);

  const appointmentsToCreate = [
    { id: 'apt-1', customerId: 'cust-ananya', staffId: 'staff-karan', serviceId: 'srv-balayage', startTime: today11, endTime: new Date(today11.getTime() + 150*60000), status: 'CONFIRMED', ref: 'TRM-2026-000101' },
    { id: 'apt-2', customerId: 'cust-rohan', staffId: 'staff-vikram', serviceId: 'srv-haircut', startTime: today12, endTime: new Date(today12.getTime() + 45*60000), status: 'COMPLETED', ref: 'TRM-2026-000102' },
    { id: 'apt-3', customerId: 'cust-sana', staffId: 'staff-riya', serviceId: 'srv-bridal', startTime: today14, endTime: new Date(today14.getTime() + 180*60000), status: 'PENDING', ref: 'TRM-2026-000103' },
    { id: 'apt-4', customerId: 'cust-sneha', staffId: 'staff-priya', serviceId: 'srv-keratin', startTime: tomorrow10, endTime: new Date(tomorrow10.getTime() + 120*60000), status: 'CONFIRMED', ref: 'TRM-2026-000104' },
    { id: 'apt-5', customerId: 'cust-amit', staffId: 'staff-vikram', serviceId: 'srv-haircut', startTime: yesterday16, endTime: new Date(yesterday16.getTime() + 45*60000), status: 'COMPLETED', ref: 'TRM-2026-000105' },
  ];

  for (const a of appointmentsToCreate) {
    await prisma.appointment.upsert({
      where: { id: a.id },
      update: {
        customerId: a.customerId,
        staffId: a.staffId,
        serviceId: a.serviceId,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        bookingReference: a.ref,
        tenantId: tenant.id,
        branchId: branch.id,
      },
      create: {
        id: a.id,
        customerId: a.customerId,
        staffId: a.staffId,
        serviceId: a.serviceId,
        startTime: a.startTime,
        endTime: a.endTime,
        status: a.status,
        bookingReference: a.ref,
        tenantId: tenant.id,
        branchId: branch.id,
      }
    });
  }

  // 11. Seed Payments
  const paymentsToCreate = [
    { id: 'pay-1', appointmentId: 'apt-1', customerId: 'cust-ananya', amount: 7500.00, paidAmount: 2500.00, paymentStatus: 'PARTIAL', paymentMethod: 'UPI' },
    { id: 'pay-2', appointmentId: 'apt-2', customerId: 'cust-rohan', amount: 1200.00, paidAmount: 1200.00, paymentStatus: 'PAID', paymentMethod: 'CASH' },
    { id: 'pay-3', appointmentId: 'apt-5', customerId: 'cust-amit', amount: 1200.00, paidAmount: 1200.00, paymentStatus: 'PAID', paymentMethod: 'CARD' },
  ];

  for (const p of paymentsToCreate) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: {
        appointmentId: p.appointmentId,
        customerId: p.customerId,
        amount: p.amount,
        paidAmount: p.paidAmount,
        paymentStatus: p.paymentStatus,
        paymentMethod: p.paymentMethod,
        method: p.paymentMethod,
        status: p.paymentStatus,
        tenantId: tenant.id,
        branchId: branch.id,
      },
      create: {
        id: p.id,
        appointmentId: p.appointmentId,
        customerId: p.customerId,
        amount: p.amount,
        paidAmount: p.paidAmount,
        paymentStatus: p.paymentStatus,
        paymentMethod: p.paymentMethod,
        method: p.paymentMethod,
        status: p.paymentStatus,
        tenantId: tenant.id,
        branchId: branch.id,
      }
    });
  }

  // 12. Seed Loyalty Accounts
  const loyaltyToCreate = [
    { id: 'loy-ananya', customerId: 'cust-ananya', pointsBalance: 450, lifetimePoints: 600, redeemedPoints: 150 },
    { id: 'loy-sana', customerId: 'cust-sana', pointsBalance: 350, lifetimePoints: 350, redeemedPoints: 0 },
    { id: 'loy-sneha', customerId: 'cust-sneha', pointsBalance: 500, lifetimePoints: 500, redeemedPoints: 0 },
  ];

  for (const l of loyaltyToCreate) {
    await prisma.loyaltyAccount.upsert({
      where: { id: l.id },
      update: {
        customerId: l.customerId,
        pointsBalance: l.pointsBalance,
        lifetimePoints: l.lifetimePoints,
        redeemedPoints: l.redeemedPoints,
        tenantId: tenant.id,
      },
      create: {
        id: l.id,
        customerId: l.customerId,
        pointsBalance: l.pointsBalance,
        lifetimePoints: l.lifetimePoints,
        redeemedPoints: l.redeemedPoints,
        tenantId: tenant.id,
      }
    });
  }

  // 13. Seed Membership Plans & Benefits
  const elitePlan = await prisma.membershipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'elite' } },
    update: { name: 'Elite Platinum', price: 5000.00 },
    create: {
      tenantId: tenant.id,
      name: 'Elite Platinum',
      code: 'elite',
      description: 'Exclusive membership for premium styling and care.',
      price: 5000.00,
      billingCycle: 'MONTHLY',
      isActive: true,
      priorityBooking: true,
      extraLoyaltyPoints: 100,
    }
  });

  const silverPlan = await prisma.membershipPlan.upsert({
    where: { tenantId_code: { tenantId: tenant.id, code: 'silver' } },
    update: { name: 'Silver Grooming', price: 2000.00 },
    create: {
      tenantId: tenant.id,
      name: 'Silver Grooming',
      code: 'silver',
      description: 'Perfect for monthly grooming essentials.',
      price: 2000.00,
      billingCycle: 'MONTHLY',
      isActive: true,
      priorityBooking: false,
      extraLoyaltyPoints: 30,
    }
  });

  // Benefits
  const benefits = [
    { id: 'ben-elite-1', planId: elitePlan.id, title: '15% Off all services', type: 'DISCOUNT', value: '15' },
    { id: 'ben-elite-2', planId: elitePlan.id, title: 'Priority salon bookings', type: 'PRIORITY', value: null },
    { id: 'ben-silver-1', planId: silverPlan.id, title: '10% Off haircuts', type: 'DISCOUNT', value: '10' },
  ];

  for (const b of benefits) {
    await prisma.membershipBenefit.upsert({
      where: { id: b.id },
      update: {
        membershipPlanId: b.planId,
        title: b.title,
        benefitType: b.type,
        value: b.value,
      },
      create: {
        id: b.id,
        membershipPlanId: b.planId,
        title: b.title,
        benefitType: b.type,
        value: b.value,
      }
    });
  }

  // Bind customer membership
  await prisma.customerMembership.upsert({
    where: { id: 'mem-ananya' },
    update: {
      customerId: 'cust-ananya',
      membershipPlanId: elitePlan.id,
      status: 'ACTIVE',
      tenantId: tenant.id,
    },
    create: {
      id: 'mem-ananya',
      customerId: 'cust-ananya',
      membershipPlanId: elitePlan.id,
      status: 'ACTIVE',
      tenantId: tenant.id,
    }
  });

  // 14. Seed Staff Attendance
  const yesterdayStr = new Date(now.getTime() - 24*3600*1000);
  const staffIds = ['staff-priya', 'staff-vikram', 'staff-karan', 'staff-riya'];
  for (const sId of staffIds) {
    // Today
    await prisma.attendance.upsert({
      where: { staffId_date: { staffId: sId, date: new Date(now.toISOString().split('T')[0]) } },
      update: { status: 'PRESENT', checkIn: now, workingHours: 8.00, tenantId: tenant.id },
      create: { staffId: sId, date: new Date(now.toISOString().split('T')[0]), status: 'PRESENT', checkIn: now, workingHours: 8.00, tenantId: tenant.id }
    });
    // Yesterday
    await prisma.attendance.upsert({
      where: { staffId_date: { staffId: sId, date: new Date(yesterdayStr.toISOString().split('T')[0]) } },
      update: { status: 'PRESENT', workingHours: 8.00, tenantId: tenant.id },
      create: { staffId: sId, date: new Date(yesterdayStr.toISOString().split('T')[0]), status: 'PRESENT', workingHours: 8.00, tenantId: tenant.id }
    });
  }

  // 15. Seed Payroll History
  for (const sId of staffIds) {
    const st = staffToCreate.find(x => x.id === sId);
    // May 2026
    await prisma.payroll.upsert({
      where: { staffId_month_year: { staffId: sId, month: 5, year: 2026 } },
      update: { baseSalary: st.baseSalary, commission: st.baseSalary * 0.15, finalAmount: st.baseSalary * 1.15, status: 'PAID', tenantId: tenant.id },
      create: { staffId: sId, month: 5, year: 2026, baseSalary: st.baseSalary, commission: st.baseSalary * 0.15, finalAmount: st.baseSalary * 1.15, status: 'PAID', tenantId: tenant.id }
    });
  }

  // 16. Seed Salon Expenses
  const expenses = [
    { id: 'exp-rent', category: 'RENT', amount: 80000.00, description: 'Bandra Salon Outlet Rent', date: now },
    { id: 'exp-elec', category: 'ELECTRICITY', amount: 18500.00, description: 'MSEDCL Electricity Bill', date: now },
    { id: 'exp-marketing', category: 'MARKETING', amount: 15000.00, description: 'Instagram/Facebook Local Ads', date: now },
    { id: 'exp-products', category: 'PRODUCTS', amount: 25000.00, description: 'Wella & L\'Oréal Hair Color Tubes', date: now },
  ];

  for (const e of expenses) {
    await prisma.expense.upsert({
      where: { id: e.id },
      update: {
        category: e.category,
        amount: e.amount,
        description: e.description,
        date: e.date,
        tenantId: tenant.id,
        branchId: branch.id,
      },
      create: {
        id: e.id,
        category: e.category,
        amount: e.amount,
        description: e.description,
        date: e.date,
        tenantId: tenant.id,
        branchId: branch.id,
      }
    });
  }

  // 17. Seed Suppliers & Inventory
  const loreal = await prisma.user.upsert({
    where: { email: 'orders@loreal.co.in' },
    update: { firstName: 'L\'Oréal', lastName: 'India', passwordHash, isActive: true },
    create: { email: 'orders@loreal.co.in', firstName: 'L\'Oréal', lastName: 'India', passwordHash, isActive: true }
  });

  const wella = await prisma.user.upsert({
    where: { email: 'support@wella.co.in' },
    update: { firstName: 'Wella', lastName: 'India', passwordHash, isActive: true },
    create: { email: 'support@wella.co.in', firstName: 'Wella', lastName: 'India', passwordHash, isActive: true }
  });

  // Link suppliers in tenant memberships as well
  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: loreal.id } },
    update: { roleId: supplierRole.id },
    create: { tenantId: tenant.id, userId: loreal.id, roleId: supplierRole.id }
  });

  await prisma.tenantMember.upsert({
    where: { tenantId_userId: { tenantId: tenant.id, userId: wella.id } },
    update: { roleId: supplierRole.id },
    create: { tenantId: tenant.id, userId: wella.id, roleId: supplierRole.id }
  });

  // Create default website layout if missing
  const existingWebsite = await prisma.website.findUnique({ where: { tenantId: tenant.id } });
  if (!existingWebsite) {
    await prisma.website.create({
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
            }
          ]
        }
      }
    });
  }

  // 18. Seed Service Addons & Bundles
  console.log('🌱 Seeding Service Addons & Bundles...');
  const scalpAddon = await prisma.serviceAddon.upsert({
    where: { id: 'addon-scalp' },
    update: { name: 'Scalp Massage & Conditioning', price: 450.00, duration: 15, isActive: true },
    create: { id: 'addon-scalp', tenantId: tenant.id, name: 'Scalp Massage & Conditioning', price: 450.00, duration: 15, isActive: true }
  });

  await prisma.serviceAddonMapping.upsert({
    where: { serviceId_addonId: { serviceId: 'srv-haircut', addonId: scalpAddon.id } },
    update: {},
    create: { serviceId: 'srv-haircut', addonId: scalpAddon.id }
  });

  const royalBundle = await prisma.serviceBundle.upsert({
    where: { id: 'bundle-royal' },
    update: { name: 'Royal Hair Makeover Bundle', price: 11000.00, isActive: true },
    create: { id: 'bundle-royal', tenantId: tenant.id, name: 'Royal Hair Makeover Bundle', price: 11000.00, isActive: true }
  });

  await prisma.serviceBundleItem.upsert({
    where: { bundleId_serviceId: { bundleId: royalBundle.id, serviceId: 'srv-balayage' } },
    update: {},
    create: { bundleId: royalBundle.id, serviceId: 'srv-balayage' }
  });

  await prisma.serviceBundleItem.upsert({
    where: { bundleId_serviceId: { bundleId: royalBundle.id, serviceId: 'srv-keratin' } },
    update: {},
    create: { bundleId: royalBundle.id, serviceId: 'srv-keratin' }
  });

  // 19. Seed Suppliers (linking them to existing seed accounts if relevant, or new CRM entries)
  console.log('🌱 Seeding Supplier Profiles...');
  const lorealSupplier = await prisma.supplier.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: "L'Oréal India" } },
    update: { email: 'orders@loreal.co.in', phone: '+91 22 2490 0000', gstNumber: '27AAAAA1111A1Z1' },
    create: { tenantId: tenant.id, name: "L'Oréal India", email: 'orders@loreal.co.in', phone: '+91 22 2490 0000', gstNumber: '27AAAAA1111A1Z1' }
  });

  const wellaSupplier = await prisma.supplier.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Wella India' } },
    update: { email: 'support@wella.co.in', phone: '+91 22 2580 1111', gstNumber: '27BBBBB2222B2Z2' },
    create: { tenantId: tenant.id, name: 'Wella India', email: 'support@wella.co.in', phone: '+91 22 2580 1111', gstNumber: '27BBBBB2222B2Z2' }
  });

  // 20. Seed Inventory Categories & Items
  console.log('🌱 Seeding Inventory & Products...');
  const hairProductsCat = await prisma.inventoryCategory.upsert({
    where: { tenantId_name: { tenantId: tenant.id, name: 'Hair Care Products' } },
    update: {},
    create: { tenantId: tenant.id, name: 'Hair Care Products' }
  });

  const shampooItem = await prisma.inventoryItem.upsert({
    where: { branchId_sku: { branchId: branch.id, sku: 'LOREAL-SH-500' } },
    update: { quantity: 15, costPrice: 850.00, price: 1200.00 },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      categoryId: hairProductsCat.id,
      name: "L'Oréal Serie Expert Shampoo 500ml",
      sku: 'LOREAL-SH-500',
      quantity: 15,
      unit: 'ml',
      reorderLevel: 5,
      costPrice: 850.00,
      price: 1200.00,
    }
  });

  const bondStabilizerItem = await prisma.inventoryItem.upsert({
    where: { branchId_sku: { branchId: branch.id, sku: 'WELLA-BOND-1000' } },
    update: { quantity: 8, costPrice: 2400.00, price: 3500.00 },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      categoryId: hairProductsCat.id,
      name: 'Wella Plex Bond Stabilizer 1000ml',
      sku: 'WELLA-BOND-1000',
      quantity: 8,
      unit: 'ml',
      reorderLevel: 2,
      costPrice: 2400.00,
      price: 3500.00,
    }
  });

  // 21. Seed Purchase Orders & Goods Receiving Receipts
  console.log('🌱 Seeding Procurement Logs...');
  const po1 = await prisma.purchaseOrder.upsert({
    where: { poNumber: 'PO-BOM-2026-00001' },
    update: { status: 'COMPLETED', totalAmount: 8500.00 },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      supplierId: lorealSupplier.id,
      poNumber: 'PO-BOM-2026-00001',
      status: 'COMPLETED',
      totalAmount: 8500.00,
      notes: 'Initial opening stock order for Bandra outlet.',
    }
  });

  const poItem1 = await prisma.purchaseOrderItem.create({
    data: {
      poId: po1.id,
      itemId: shampooItem.id,
      quantityOrdered: 10,
      quantityReceived: 10,
      pricePerUnit: 850.00,
    }
  });

  const gr1 = await prisma.goodsReceipt.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      poId: po1.id,
      receivedBy: dbUsers.owner.id,
      notes: 'All items received in excellent condition.',
    }
  });

  await prisma.goodsReceiptItem.create({
    data: {
      receiptId: gr1.id,
      poItemId: poItem1.id,
      receivedQty: 10,
    }
  });

  // 22. Seed Stock Movements
  console.log('🌱 Seeding Stock Ledger Movements...');
  await prisma.stockMovement.create({
    data: {
      tenantId: tenant.id,
      branchId: branch.id,
      itemId: shampooItem.id,
      quantity: 10,
      type: 'PURCHASE',
      referenceId: gr1.id,
    }
  });

  console.log('Seeding completed successfully!');
  console.log(`Salon Tenant: ${tenant.name} (${tenant.slug})`);
  console.log('Test log-ins (Password: 123456):');
  console.log('- Owner: salonadmin@mail.in');
  console.log('- Admin: admin@trimly.in');
  console.log('- Staff: staff@trimly.in');
  console.log('- Supplier: supplier@trimly.in');
  console.log('Portal Suppliers: orders@loreal.co.in, support@wella.co.in');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
