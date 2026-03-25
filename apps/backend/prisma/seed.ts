import {
  PrismaClient,
  UserRole,
  AccountStatus,
  Language,
  Currency,
} from '@prisma/client';
import * as bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seeding...');

  // Clear existing users (optional - be careful in production!)
  if (process.env.NODE_ENV !== 'production') {
    console.log('Clearing existing users...');
    await prisma.user.deleteMany({});
    await prisma.savedLocation.deleteMany({});
  }

  // Hash password for all users using bcryptjs
  const salt = await bcryptjs.genSalt(10);
  const hashedPassword = await bcryptjs.hash('Password123!', salt);

  // Create PASSENGER user
  const passenger = await prisma.user.upsert({
    where: { email: 'passenger@evo.com' },
    update: {},
    create: {
      email: 'passenger@evo.com',
      passwordHash: hashedPassword,
      firstName: 'John',
      lastName: 'Passenger',
      role: UserRole.PASSENGER,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      isGuest: false,
      preferredLanguage: Language.EN,
      preferredCurrency: Currency.USD,
    },
  });
  console.log('✅ Created passenger:', passenger.email);

  // Create DRIVER user
  const driver = await prisma.user.upsert({
    where: { email: 'driver@evo.com' },
    update: {},
    create: {
      email: 'driver@evo.com',
      passwordHash: hashedPassword,
      firstName: 'Michael',
      lastName: 'Driver',
      role: UserRole.DRIVER,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      isGuest: false,
      preferredLanguage: Language.EN,
      preferredCurrency: Currency.USD,
    },
  });
  console.log('✅ Created driver:', driver.email);

  // Create ADMIN user
  const admin = await prisma.user.upsert({
    where: { email: 'adminevo@yopmail.com' },
    update: {},
    create: {
      email: 'adminevo@yopmail.com',
      passwordHash: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Admin',
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      isGuest: false,
      preferredLanguage: Language.EN,
      preferredCurrency: Currency.USD,
    },
  });
  console.log('✅ Created admin:', admin.email);

  // Create a guest user example
  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      firstName: 'Guest',
      lastName: 'User',
      isGuest: true,
      role: UserRole.PASSENGER,
      status: AccountStatus.ACTIVE,
      isEmailVerified: false,
      preferredLanguage: Language.EN,
      preferredCurrency: Currency.USD,
      guestSessionId: 'guest-session-' + Date.now(),
      guestExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });
  console.log('✅ Created guest:', guest.email);

  // Create some saved locations for passenger
  await prisma.savedLocation.createMany({
    data: [
      {
        userId: passenger.id,
        name: 'Home',
        type: 'HOME',
        address: '123 Kacyiru, Kigali',
        latitude: -1.9441,
        longitude: 30.0619,
        isDefault: true,
      },
      {
        userId: passenger.id,
        name: 'Work',
        type: 'WORK',
        address: '456 Kimihurura, Kigali',
        latitude: -1.9578,
        longitude: 30.0895,
        isDefault: false,
      },
      {
        userId: passenger.id,
        name: 'Kigali Airport',
        type: 'AIRPORT',
        address: 'Kanombe, Kigali',
        airportCode: 'KGL',
        terminal: '1',
        latitude: -1.9686,
        longitude: 30.1395,
        isDefault: false,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created saved locations for passenger');

  // Create saved locations for driver
  await prisma.savedLocation.createMany({
    data: [
      {
        userId: driver.id,
        name: 'Home',
        type: 'HOME',
        address: '789 Nyamirambo, Kigali',
        latitude: -1.9872,
        longitude: 30.0555,
        isDefault: true,
      },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Created saved locations for driver');

  await prisma.pricingSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      springPricePerKm: 1.15,
      summerPricePerKm: 1.35,
      autumnPricePerKm: 1.15,
      winterPricePerKm: 1.05,
      currency: Currency.EUR,
    },
  });
  console.log('✅ Ensured default seasonal pricing (pricing_settings)');

  console.log('🎉 Seeding completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Passenger: passenger@evo.com / Password123!');
  console.log('Driver: driver@evo.com / Password123!');
  console.log('Admin: adminevo@yopmail.com / Password123!');
  console.log('Guest: guest@example.com (no password)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
