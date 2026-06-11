import { registerTenant, loginUser } from './auth.service.js';
import { z } from 'zod';
import prisma from '../../config/db.js';

const registerSchema = z.object({
  salonName: z.string().min(2, 'Salon name must be at least 2 characters.'),
  slug: z.string().min(2, 'Slug must be at least 2 characters.').regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric lowercase with hyphens only.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

/**
 * Controller to handle new salon registration.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleRegister(req, res) {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await registerTenant(validatedData);

    return res.status(201).json({
      message: 'Registration successful! Your salon has been created.',
      tenant: {
        id: result.tenant.id,
        name: result.tenant.name,
        slug: result.tenant.slug,
      },
      user: {
        id: result.user.id,
        email: result.user.email,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(400).json({ error: error.message || 'Registration failed.' });
  }
}

/**
 * Controller to handle user login.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleLogin(req, res) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { token, user, tenants } = await loginUser(validatedData.email, validatedData.password);

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user,
      tenants,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors.map(err => err.message) });
    }
    return res.status(401).json({ error: error.message || 'Login failed.' });
  }
}

/**
 * Controller to fetch authenticated user profile.
 * 
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export async function handleMe(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
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
      return res.status(404).json({ error: 'User not found.' });
    }

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

    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isSuperAdmin: user.isSuperAdmin,
      },
      tenants,
    });
  } catch (error) {
    console.error('Fetch Me Error:', error);
    return res.status(500).json({ error: 'Failed to fetch user session info.' });
  }
}
