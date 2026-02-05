/**
 * Post CRUD Test Script
 * Tests all post endpoints with authentication
 * 
 * Run with: npx ts-node src/scripts/test-posts.ts
 */

import axios from 'axios';

const API_URL = process.env.API_URL || `http://localhost:${process.env.PORT || 3000}`;

let readerToken = '';
let authorToken = '';
let createdPostId = '';
let createdPostSlug = '';

async function setup() {
  console.log('\n📋 Setting up test users...\n');
  
  // Create/login as READER
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'Test123456'
    });
    readerToken = response.data.data.token;
    console.log('✅ READER logged in');
  } catch (error: any) {
    if (error.response?.status === 401) {
      // User doesn't exist, try to create
      await axios.post(`${API_URL}/api/auth/signup`, {
        email: 'test@example.com',
        username: 'testreader',
        password: 'Test123456',
        firstName: 'Test',
        lastName: 'Reader'
      });
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email: 'test@example.com',
        password: 'Test123456'
      });
      readerToken = response.data.data.token;
      console.log('✅ READER created and logged in');
    }
  }

  // Create/login as AUTHOR
  try {
    const response = await axios.post(`${API_URL}/api/auth/login`, {
      email: 'author@example.com',
      password: 'Author123456'
    });
    authorToken = response.data.data.token;
    console.log('✅ AUTHOR logged in');
  } catch (error: any) {
    // For this test, we need an AUTHOR. You should manually promote a user to AUTHOR in the database
    console.log('⚠️  AUTHOR account not found or not promoted');
    console.log('   Please run this SQL command first:');
    console.log('   UPDATE users SET role = \'AUTHOR\' WHERE email = \'author@example.com\';');
    console.log('\n   Or create an author via database:');
    await axios.post(`${API_URL}/api/auth/signup`, {
      email: 'author@example.com',
      username: 'testauthor',
      password: 'Author123456',
      firstName: 'Test',
      lastName: 'Author'
    });
    console.log('✅ AUTHOR user created - please promote to AUTHOR role in database');
    console.log('   Then re-run this test script');
    process.exit(0);
  }
}

async function testCreatePostAsReader() {
  console.log('\n🧪 Test 1: Create Post as READER (should fail)');
  console.log('='.repeat(50));
  
  try {
    await axios.post(`${API_URL}/api/posts`, {
      title: 'Test Post',
      content: 'Content'
    }, {
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    
    console.error('❌ READER should not be able to create posts!');
    return false;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked READER from creating posts');
      console.log('   Error:', error.response.data.error);
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testCreatePostAsAuthor() {
  console.log('\n🧪 Test 2: Create Post as AUTHOR');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.post(`${API_URL}/api/posts`, {
      title: 'Getting Started with Node.js',
      content: 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine. It allows you to run JavaScript on the server...',
      excerpt: 'Learn the basics of Node.js',
      tags: ['nodejs', 'javascript', 'backend'],
      status: 'PUBLISHED'
    }, {
      headers: { Authorization: `Bearer ${authorToken}` }
    });
    
    console.log('✅ Post created successfully!');
    console.log('   Post ID:', response.data.data.id);
    console.log('   Slug:', response.data.data.slug);
    console.log('   Status:', response.data.data.status);
    
    createdPostId = response.data.data.id;
    createdPostSlug = response.data.data.slug;
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to create post:', error.response?.data || error.message);
    return false;
  }
}

async function testGetAllPosts() {
  console.log('\n🧪 Test 3: Get All Posts (Public)');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/posts`);
    
    console.log('✅ Successfully fetched posts');
    console.log('   Total posts:', response.data.pagination.total);
    console.log('   Current page:', response.data.pagination.page);
    console.log('   Posts:', response.data.data.length);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to fetch posts:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPostById() {
  console.log('\n🧪 Test 4: Get Post by ID');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/posts/${createdPostId}`);
    
    console.log('✅ Successfully fetched post');
    console.log('   Title:', response.data.data.title);
    console.log('   Author:', response.data.data.author.username);
    console.log('   Views:', response.data.data.viewCount);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to fetch post:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPostBySlug() {
  console.log('\n🧪 Test 5: Get Post by Slug');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/posts/slug/${createdPostSlug}`);
    
    console.log('✅ Successfully fetched post by slug');
    console.log('   Title:', response.data.data.title);
    console.log('   Slug:', response.data.data.slug);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to fetch post by slug:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdatePost() {
  console.log('\n🧪 Test 6: Update Post');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.put(`${API_URL}/api/posts/${createdPostId}`, {
      title: 'Getting Started with Node.js - Updated',
      excerpt: 'Updated excerpt'
    }, {
      headers: { Authorization: `Bearer ${authorToken}` }
    });
    
    console.log('✅ Post updated successfully');
    console.log('   New title:', response.data.data.title);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to update post:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateOthersPostAsReader() {
  console.log('\n🧪 Test 7: Update Another User\'s Post (should fail)');
  console.log('='.repeat(50));
  
  try {
    await axios.put(`${API_URL}/api/posts/${createdPostId}`, {
      title: 'Hacked Title'
    }, {
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    
    console.error('❌ READER should not update AUTHOR\'s post!');
    return false;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked READER from updating AUTHOR\'s post');
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testGetMyPosts() {
  console.log('\n🧪 Test 8: Get My Posts');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/posts/my/posts`, {
      headers: { Authorization: `Bearer ${authorToken}` }
    });
    
    console.log('✅ Successfully fetched own posts');
    console.log('   Total posts:', response.data.pagination.total);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to fetch own posts:', error.response?.data || error.message);
    return false;
  }
}

async function testGetStats() {
  console.log('\n🧪 Test 9: Get Post Statistics');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/posts/stats`, {
      headers: { Authorization: `Bearer ${authorToken}` }
    });
    
    console.log('✅ Successfully fetched stats');
    console.log('   Total posts:', response.data.data.total);
    console.log('   Published:', response.data.data.published);
    console.log('   Draft:', response.data.data.draft);
    console.log('   Total views:', response.data.data.totalViews);
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to fetch stats:', error.response?.data || error.message);
    return false;
  }
}

async function testSearchPosts() {
  console.log('\n🧪 Test 10: Search Posts');
  console.log('='.repeat(50));
  
  try {
    const response = await axios.get(`${API_URL}/api/posts?search=node&tags=nodejs`);
    
    console.log('✅ Search successful');
    console.log('   Results:', response.data.data.length);
    
    return true;
  } catch (error: any) {
    console.error('❌ Search failed:', error.response?.data || error.message);
    return false;
  }
}

async function testDeleteOthersPost() {
  console.log('\n🧪 Test 11: Delete Another User\'s Post (should fail)');
  console.log('='.repeat(50));
  
  try {
    await axios.delete(`${API_URL}/api/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${readerToken}` }
    });
    
    console.error('❌ READER should not delete AUTHOR\'s post!');
    return false;
  } catch (error: any) {
    if (error.response?.status === 403) {
      console.log('✅ Correctly blocked READER from deleting AUTHOR\'s post');
      return true;
    }
    console.error('❌ Unexpected error:', error.message);
    return false;
  }
}

async function testDeletePost() {
  console.log('\n🧪 Test 12: Delete Own Post');
  console.log('='.repeat(50));
  
  try {
    await axios.delete(`${API_URL}/api/posts/${createdPostId}`, {
      headers: { Authorization: `Bearer ${authorToken}` }
    });
    
    console.log('✅ Post deleted successfully');
    
    return true;
  } catch (error: any) {
    console.error('❌ Failed to delete post:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('\n');
  console.log('🚀 POST CRUD TEST SUITE');
  console.log('='.repeat(50));
  console.log('Testing API at:', API_URL);
  console.log('Make sure your server is running: npm run dev');
  console.log('='.repeat(50));
  
  // Setup
  await setup();
  
  const results = {
    createAsReader: false,
    createAsAuthor: false,
    getAllPosts: false,
    getById: false,
    getBySlug: false,
    updatePost: false,
    updateOthersPost: false,
    getMyPosts: false,
    getStats: false,
    searchPosts: false,
    deleteOthersPost: false,
    deletePost: false
  };
  
  // Run tests
  results.createAsReader = await testCreatePostAsReader();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.createAsAuthor = await testCreatePostAsAuthor();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.getAllPosts = await testGetAllPosts();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.getById = await testGetPostById();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.getBySlug = await testGetPostBySlug();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.updatePost = await testUpdatePost();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.updateOthersPost = await testUpdateOthersPostAsReader();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.getMyPosts = await testGetMyPosts();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.getStats = await testGetStats();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.searchPosts = await testSearchPosts();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.deleteOthersPost = await testDeleteOthersPost();
  await new Promise(resolve => setTimeout(resolve, 500));
  
  results.deletePost = await testDeletePost();
  
  // Summary
  console.log('\n');
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.keys(results).length;
  
  Object.entries(results).forEach(([test, result]) => {
    const icon = result ? '✅' : '❌';
    const status = result ? 'PASS' : 'FAIL';
    console.log(`${icon} ${test.padEnd(25)} - ${status}`);
  });
  
  console.log('='.repeat(50));
  console.log(`Total: ${passed}/${total} tests passed`);
  
  if (passed === total) {
    console.log('\n🎉 ALL POST TESTS PASSED! CRUD system is working!');
  } else {
    console.log('\n⚠️  Some tests failed. Check errors above.');
  }
  
  console.log('\n');
}

runTests().catch(error => {
  console.error('\n💥 Test suite crashed:', error.message);
  process.exit(1);
});
