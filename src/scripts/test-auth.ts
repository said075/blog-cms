/**
 * Authentication Test Script
 * Tests signup, login, and protected routes
 * 
 * Run with: npx ts-node src/scripts/test-auth.ts
 */

import axios from 'axios';

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

// Test data
const testUser = {
  email: 'test@example.com',
  username: 'testuser',
  password: 'Test123456',
  firstName: 'Test',
  lastName: 'User'
};

const testAdmin = {
  email: 'admin@example.com',
  username: 'admin',
  password: 'Admin123456',
  firstName: 'Admin',
  lastName: 'User'
};

let readerToken = '';
let adminToken = '';

async function testSignup() {
  console.log('\n🧪 Test 1: Signup (Create new user)');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/signup`, testUser);
    
    console.log('✅ Signup successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    
    readerToken = response.data.data.token;
    console.log('\n📝 Token saved:', readerToken.substring(0, 20) + '...');
    
    return true;
  } catch (error: any) {
    if (error.response?.data?.error?.includes('already registered')) {
      console.log('⚠️  User already exists (this is fine for testing)');
      return true;
    }
    console.error('❌ Signup failed:', error.response?.data || error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🧪 Test 2: Login');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    
    console.log('✅ Login successful!');
    console.log('User:', response.data.data.user.username);
    console.log('Role:', response.data.data.user.role);
    
    readerToken = response.data.data.token;
    console.log('Token:', readerToken.substring(0, 20) + '...');
    
    return true;
  } catch (error: any) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    return false;
  }
}

async function testInvalidLogin() {
  console.log('\n🧪 Test 3: Invalid Login (wrong password)');
  console.log('='.repeat(50));
  
  try {
    await axios.post(`${API_URL}/api/auth/login`, {
      email: testUser.email,
      password: 'wrongpassword'
    });
    
    console.error('❌ Should have failed with invalid credentials');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid credentials');
      console.log('Error message:', error.response.data.error);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testGetMe() {
  console.log('\n🧪 Test 4: Get Current User (Protected Route)');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    
    console.log('✅ Successfully accessed protected route!');
    console.log('User data:', JSON.stringify(response.data.data, null, 2));
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to access protected route:', error.response?.data || error.message);
    return false;
  }
}

async function testProtectedRouteWithoutToken() {
  console.log('\n🧪 Test 5: Protected Route WITHOUT Token');
  console.log('='.repeat(50));
  
  try {
    await axios.get(`${API_URL}/api/auth/me`);
    
    console.error('❌ Should have been rejected without token');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected request without token');
      console.log('Error message:', error.response.data.error);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testProtectedRouteWithInvalidToken() {
  console.log('\n🧪 Test 6: Protected Route with INVALID Token');
  console.log('='.repeat(50));
  
  try {
    await axios.get(`${API_URL}/api/auth/me`, {
      headers: { Authorization: 'Bearer invalid-token-here' }
    });
    
    console.error('❌ Should have been rejected with invalid token');
    return false;
  } catch (error: any) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected invalid token');
      console.log('Error message:', error.response.data.error);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testRoleAccess() {
  console.log('\n🧪 Test 7: Role-Based Access (READER trying ADMIN route)');
  console.log('='.repeat(50));
  
  try {
    await axios.get(`${API_URL}/api/admin`, {
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    
    console.error('❌ READER should not access ADMIN route');
    return false;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked READER from ADMIN route');
      console.log('Error:', error.response.data.error);
      console.log('Required roles:', error.response.data.requiredRoles);
      console.log('Your role:', error.response.data.yourRole);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testDemoRoutes() {
  console.log('\n🧪 Test 8: Demo Protected Routes');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/protected`, {
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    
    console.log('✅ Successfully accessed /api/protected');
    console.log('Message:', response.data.message);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n');
  console.log('🚀 AUTHENTICATION SYSTEM TEST SUITE');
  console.log('='.repeat(50));
  console.log('Testing API at:', API_URL);
  console.log('Make sure your server is running: npm run dev');
  console.log('='.repeat(50));
  
  const results = {
    signup: false,
    login: false,
    invalidLogin: false,
    getMe: false,
    noToken: false,
    invalidToken: false,
    roleAccess: false,
    demoRoutes: false
  };
  
  // Run tests in sequence
  results.signup = await testSignup();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.login = await testLogin();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.invalidLogin = await testInvalidLogin();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.getMe = await testGetMe();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.noToken = await testProtectedRouteWithoutToken();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.invalidToken = await testProtectedRouteWithInvalidToken();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.roleAccess = await testRoleAccess();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.demoRoutes = await testDemoRoutes();
  
  // Summary
  console.log('\n');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test.padEnd(20)} - ${status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL TESTS PASSED! Authentication system is working!');
    console.log('\n✅ You can now:');
    console.log('   1. Signup users with POST /api/auth/signup');
    console.log('   2. Login users with POST /api/auth/login');
    console.log('   3. Access protected routes with JWT token');
    console.log('   4. Role-based authorization works correctly');
  } else {
    console.log('\n⚠️  Some tests failed. Please check the errors above.');
  }
  
  console.log('\n');
}

// Run the tests
runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  console.log('\n⚠️  Make sure:');
  console.log('   1. Server is running: npm run dev');
  console.log('   2. Database is up: npm run docker:up');
  console.log('   3. Migrations ran: npm run db:migrate');
  process.exit(1);
});
