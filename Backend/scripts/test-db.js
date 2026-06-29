import 'dotenv/config';
import prisma from '../src/config/db.js';

async function main() {
  try {
    console.log("Checking database connection...");
    const tenantCount = await prisma.tenant.count();
    console.log(`✅ Database connection successful! Found ${tenantCount} tenants.`);
    
    if (tenantCount > 0) {
      const tenants = await prisma.tenant.findMany({
        take: 5,
        include: {
          plan: true,
          members: {
            include: {
              user: true,
              role: true
            }
          }
        }
      });
      console.log("Seeded Tenants:");
      tenants.forEach(t => {
        console.log(`- Slug: ${t.slug}, Name: ${t.name}, Plan: ${t.plan.code}, Status: ${t.subscriptionStatus}`);
        console.log("  Members:");
        t.members.forEach(m => {
          console.log(`    * ${m.user.firstName} ${m.user.lastName} (${m.user.email}) - Role: ${m.role.code}`);
        });
      });
    } else {
      console.log("⚠️ No tenants found. Database is empty.");
    }
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
