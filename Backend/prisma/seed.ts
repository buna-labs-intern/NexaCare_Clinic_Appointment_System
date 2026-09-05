import bcrypt from "bcryptjs";
import prisma from "../src/shared/prisma";

async function main() {
  console.log("🌱 Seeding multi-tenant database...");

  // 1. Seed Tenants
  const tenant1 = await prisma.tenant.upsert({
    where: { slug: "central-clinic" },
    update: {
      name: "NexaCare Central Clinic",
      email: "central@nexacare.com",
      phone: "+252 61 000 0001",
      address: "Downtown Main Boulevard, Suite 100",
      isActive: true,
    },
    create: {
      name: "NexaCare Central Clinic",
      slug: "central-clinic",
      email: "central@nexacare.com",
      phone: "+252 61 000 0001",
      address: "Downtown Main Boulevard, Suite 100",
      isActive: true,
    },
  });

  const tenant2 = await prisma.tenant.upsert({
    where: { slug: "downtown-care" },
    update: {
      name: "Downtown Care Center",
      email: "downtown@nexacare.com",
      phone: "+252 61 000 0002",
      address: "East Avenue, Block 4",
      isActive: true,
    },
    create: {
      name: "Downtown Care Center",
      slug: "downtown-care",
      email: "downtown@nexacare.com",
      phone: "+252 61 000 0002",
      address: "East Avenue, Block 4",
      isActive: true,
    },
  });

  console.log("✅ Tenants seeded:", {
    tenant1: tenant1.name,
    tenant2: tenant2.name,
  });

  // 2. Seed Users for Central Clinic
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const receptionistPassword = await bcrypt.hash("Reception@12345", 10);

  const admin = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant1.id,
        email: "admin@hospital.com",
      },
    },
    update: {
      fullName: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      fullName: "System Administrator",
      email: "admin@hospital.com",
      password: adminPassword,
      role: "ADMIN",
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  const receptionist = await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant1.id,
        email: "receptionist@hospital.com",
      },
    },
    update: {
      fullName: "Clinic Receptionist",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
    },
    create: {
      fullName: "Clinic Receptionist",
      email: "receptionist@hospital.com",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
      tenantId: tenant1.id,
    },
  });

  // Also seed a receptionist for Tenant 2 to demonstrate multi-tenancy
  await prisma.user.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant2.id,
        email: "receptionist@hospital.com", // Same email, different tenant!
      },
    },
    update: {
      fullName: "Downtown Receptionist",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
    },
    create: {
      fullName: "Downtown Receptionist",
      email: "receptionist@hospital.com",
      password: receptionistPassword,
      role: "RECEPTIONIST",
      isActive: true,
      tenantId: tenant2.id,
    },
  });

  console.log("✅ Users seeded:", { admin: admin.email, receptionist: receptionist.email });

  // 3. Seed Services for Central Clinic
  const servicesData = [
    { name: "General Consultation", price: 25, duration: 30, description: "Routine health consultation", isActive: true, tenantId: tenant1.id },
    { name: "Follow-up Consultation", price: 15, duration: 15, description: "Follow-up medical review", isActive: true, tenantId: tenant1.id },
    { name: "Pediatrics Consultation", price: 30, duration: 30, description: "Specialized child health care", isActive: true, tenantId: tenant1.id },
    { name: "Medical Certificate", price: 10, duration: 15, description: "Doctor assessment for certificate", isActive: true, tenantId: tenant1.id },
    { name: "Blood Pressure Check", price: 5, duration: 10, description: "Blood pressure and vitals reading", isActive: true, tenantId: tenant1.id },
  ];

  for (const s of servicesData) {
    const existing = await prisma.service.findFirst({ where: { name: s.name, tenantId: s.tenantId } });
    if (!existing) {
      await prisma.service.create({ data: s });
    }
  }
  console.log("✅ Services seeded");

  // 4. Seed Doctors for Central Clinic
  const doctorsData = [
    { fullName: "Dr. Sara Ahmed", specialty: "General Practice", phone: "+252 61 111 1111", isActive: true, tenantId: tenant1.id },
    { fullName: "Dr. Mohamed Ali", specialty: "Pediatrics", phone: "+252 61 222 2222", isActive: true, tenantId: tenant1.id },
    { fullName: "Dr. Amina Yusuf", specialty: "Dermatology", phone: "+252 61 333 3333", isActive: false, tenantId: tenant1.id },
  ];

  for (const d of doctorsData) {
    const existing = await prisma.doctor.findFirst({ where: { fullName: d.fullName, tenantId: d.tenantId } });
    if (!existing) {
      await prisma.doctor.create({ data: d });
    }
  }
  console.log("✅ Doctors seeded");

  // 5. Seed Patients for Central Clinic
  const patientsData = [
    { fullName: "Hassan Omar", phone: "+252 61 444 4444", gender: "MALE", birthDate: new Date("1992-04-12"), address: "Hargeisa", notes: "Prefers morning visits", tenantId: tenant1.id },
    { fullName: "Fadumo Abdi", phone: "+252 61 555 5555", gender: "FEMALE", birthDate: new Date("1988-11-03"), address: "Berbera", notes: "Regular checkups", tenantId: tenant1.id },
    { fullName: "Yusuf Ismail", phone: "+252 61 666 6666", gender: "MALE", birthDate: new Date("2015-07-21"), address: "Mogadishu", notes: "Pediatric patient", tenantId: tenant1.id },
  ];

  for (const p of patientsData) {
    const existing = await prisma.patient.findFirst({ where: { phone: p.phone, tenantId: p.tenantId } });
    if (!existing) {
      await prisma.patient.create({ data: p });
    }
  }
  console.log("✅ Patients seeded");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
