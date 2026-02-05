/**
 * Setup Test Data
 * Creates test users and sample posts for testing
 */

import axios from 'axios';

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 3001}`;

async function setupTestData() {
  console.log('🔧 Setting up test data...\n');

  try {
    // Create test reader
    console.log('Creating READER user...');
    const readerSignup = await axios.post(`${API_URL}/api/auth/signup`, {
      email: 'test@example.com',
      username: 'testuser',
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'User',
    });

    if (readerSignup.data.success) {
      console.log('✅ READER created');
    } else {
      console.log('ℹ️  READER already exists');
    }

    // Create test author
    console.log('Creating AUTHOR user...');
    const authorSignup = await axios.post(`${API_URL}/api/auth/signup`, {
      email: 'author@example.com',
      username: 'testauthor',
      password: 'TestPass123',
      firstName: 'Test',
      lastName: 'Author',
    });

    if (authorSignup.data.success) {
      console.log('✅ AUTHOR created');
    } else {
      console.log('ℹ️  AUTHOR already exists');
    }

    console.log('\n⚠️  IMPORTANT: Run this SQL to promote author:');
    console.log('   npx prisma db execute --stdin <<< "UPDATE users SET role = \'AUTHOR\' WHERE email = \'author@example.com\';"');
    console.log('\n✅ Test data setup complete!');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

setupTestData();
