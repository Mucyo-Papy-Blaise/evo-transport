import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { MailerService } from '../mailer.service';


async function quickTest() {
  console.log('🚀 Quick Email Test Starting...\n');

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  try {
    const mailerService = app.get(MailerService);

    // Get test email from environment or use default
    const testEmail = process.env.TEST_EMAIL || 'mucyoblaise86@gmail.com';

    console.log(`📧 Sending test email to: ${testEmail}\n`);

    // Send a simple test email
    const result = await mailerService.sendTemplatedEmail(
      testEmail,
      'AUTH',
      'WELCOME_NEW_USER',
      {
        firstName: 'Test',
        lastName: 'User',
        email: testEmail,
        tempPassword: 'TestPassword@123',
        loginUrl: 'https://example.com/login',
        platformName: 'Email Test Platform',
      },
    );

    // Wait a moment for the email to process
    await new Promise((resolve) => setTimeout(resolve, 3000));

    if (result) {
      console.log('✅ SUCCESS! Email sent successfully!');
      console.log('📬 Check your inbox at:', testEmail);

      // Show statistics
      const stats = mailerService.getStatistics(1);
      console.log('\n📊 Statistics:');
      console.log(`   Success Rate: ${stats.successRate.toFixed(0)}%`);
      console.log(`   Total Sent: ${stats.successful}/${stats.total}`);
    } else {
      console.log('❌ FAILED! Email could not be sent');
      console.log('💡 Check your .env configuration:');
      console.log('   - MAIL_HOST');
      console.log('   - MAIL_PORT');
      console.log('   - MAIL_USER');
      console.log('   - MAIL_PASSWORD');
      console.log('   - MAIL_FROM_ADDRESS');
    }

    // Show recent logs
    const logs = mailerService.getRecentLogs(1);
    if (logs.length > 0 && logs[0]!.error) {
      console.log('\n❌ Error Details:');
      console.log(`   ${logs[0]!.error}`);
    }
  } catch (error) {
    console.error('\n❌ TEST FAILED WITH ERROR:');
    console.error(error instanceof Error ? error.message : error);

    console.log('\n💡 Common Issues:');
    console.log('   1. Check SMTP credentials in .env file');
    console.log('   2. Verify firewall/network allows SMTP connection');
    console.log('   3. Check if MAIL_HOST and MAIL_PORT are correct');
    console.log(
      '   4. For Gmail: Enable "Less secure app access" or use App Password',
    );
  } finally {
    await app.close();
    console.log('\n👋 Test completed.\n');
  }
}

// Run the quick test
quickTest()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
