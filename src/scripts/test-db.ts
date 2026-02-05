/**
 * Database Test Script
 * 
 * This script tests the database connection and basic CRUD operations
 * Run with: npx ts-node src/scripts/test-db.ts
 */

import prisma from '../config/database';
import { UserRole, PostStatus, AccountStatus } from '@prisma/client';

async function main() {
  console.log('🚀 Starting database test...\n');

  try {
    // ============================================
    // 1. CREATE USERS
    // ============================================
    console.log('📝 Creating users...');
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        password: 'hashed_password_here', // In real app, use bcrypt
        firstName: 'Admin',
        lastName: 'User',
        role: UserRole.ADMIN,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
        bio: 'System administrator'
      }
    });
    console.log('✅ Created admin:', admin.username);

    const author = await prisma.user.create({
      data: {
        email: 'author@example.com',
        username: 'author1',
        password: 'hashed_password_here',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.AUTHOR,
        status: AccountStatus.ACTIVE,
        emailVerified: true,
        bio: 'Content writer and blogger'
      }
    });
    console.log('✅ Created author:', author.username);

    const reader = await prisma.user.create({
      data: {
        email: 'reader@example.com',
        username: 'reader1',
        password: 'hashed_password_here',
        firstName: 'Jane',
        lastName: 'Smith',
        role: UserRole.READER,
        status: AccountStatus.ACTIVE,
        emailVerified: true
      }
    });
    console.log('✅ Created reader:', reader.username);

    // ============================================
    // 2. CREATE CATEGORY
    // ============================================
    console.log('\n📁 Creating category...');
    
    const category = await prisma.category.create({
      data: {
        name: 'Technology',
        slug: 'technology',
        description: 'All about tech and programming'
      }
    });
    console.log('✅ Created category:', category.name);

    // ============================================
    // 3. CREATE POSTS
    // ============================================
    console.log('\n📰 Creating posts...');
    
    const post1 = await prisma.post.create({
      data: {
        title: 'Getting Started with TypeScript',
        slug: 'getting-started-with-typescript',
        content: 'TypeScript is a typed superset of JavaScript that compiles to plain JavaScript. In this post, we will explore the basics of TypeScript...',
        excerpt: 'Learn the basics of TypeScript',
        authorId: author.id,
        categoryId: category.id,
        status: PostStatus.PUBLISHED,
        tags: ['typescript', 'javascript', 'programming'],
        publishedAt: new Date(),
        viewCount: 0
      }
    });
    console.log('✅ Created post:', post1.title);

    const post2 = await prisma.post.create({
      data: {
        title: 'Building RESTful APIs with Express',
        slug: 'building-restful-apis-with-express',
        content: 'Express.js is a minimal and flexible Node.js web application framework. Let\'s build a RESTful API...',
        excerpt: 'Learn to build APIs with Express.js',
        authorId: author.id,
        categoryId: category.id,
        status: PostStatus.PUBLISHED,
        tags: ['express', 'nodejs', 'api', 'rest'],
        publishedAt: new Date(),
        viewCount: 5
      }
    });
    console.log('✅ Created post:', post2.title);

    const draftPost = await prisma.post.create({
      data: {
        title: 'Advanced TypeScript Patterns',
        slug: 'advanced-typescript-patterns',
        content: 'Draft content about advanced TypeScript patterns...',
        excerpt: 'Coming soon!',
        authorId: author.id,
        categoryId: category.id,
        status: PostStatus.DRAFT,
        tags: ['typescript', 'advanced'],
        viewCount: 0
      }
    });
    console.log('✅ Created draft post:', draftPost.title);

    // ============================================
    // 4. CREATE COMMENTS
    // ============================================
    console.log('\n💬 Creating comments...');
    
    const comment1 = await prisma.comment.create({
      data: {
        content: 'Great article! Very helpful for beginners.',
        postId: post1.id,
        authorId: reader.id,
        status: 'APPROVED'
      }
    });
    console.log('✅ Created comment by:', reader.username);

    const comment2 = await prisma.comment.create({
      data: {
        content: 'Thanks for reading! Glad you found it helpful.',
        postId: post1.id,
        authorId: author.id,
        parentId: comment1.id, // Reply to comment1
        status: 'APPROVED'
      }
    });
    console.log('✅ Created reply by:', author.username);

    // ============================================
    // 5. FETCH AND DISPLAY DATA
    // ============================================
    console.log('\n📊 Fetching data from database...\n');
    
    // Fetch all published posts with author details
    const posts = await prisma.post.findMany({
      where: { status: PostStatus.PUBLISHED },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            firstName: true,
            lastName: true,
            role: true
          }
        },
        category: true,
        comments: {
          include: {
            author: {
              select: {
                username: true,
                firstName: true,
                lastName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log('📚 Published Posts:');
    posts.forEach((post, index) => {
      console.log(`\n${index + 1}. ${post.title}`);
      console.log(`   Slug: ${post.slug}`);
      console.log(`   Author: ${post.author.firstName} ${post.author.lastName} (@${post.author.username})`);
      console.log(`   Category: ${post.category?.name || 'None'}`);
      console.log(`   Tags: ${post.tags.join(', ')}`);
      console.log(`   Views: ${post.viewCount}`);
      console.log(`   Comments: ${post.comments.length}`);
      console.log(`   Status: ${post.status}`);
      console.log(`   Published: ${post.publishedAt?.toLocaleDateString()}`);
      
      if (post.comments.length > 0) {
        console.log('   💬 Comments:');
        post.comments.forEach((comment) => {
          console.log(`      - ${comment.author.username}: "${comment.content.substring(0, 50)}..."`);
        });
      }
    });

    // Count statistics
    const userCount = await prisma.user.count();
    const postCount = await prisma.post.count();
    const publishedCount = await prisma.post.count({ where: { status: PostStatus.PUBLISHED }});
    const commentCount = await prisma.comment.count();
    const categoryCount = await prisma.category.count();

    console.log('\n\n📈 Database Statistics:');
    console.log(`   Users: ${userCount}`);
    console.log(`   Posts: ${postCount} (${publishedCount} published)`);
    console.log(`   Comments: ${commentCount}`);
    console.log(`   Categories: ${categoryCount}`);

    console.log('\n✅ Database test completed successfully!');

  } catch (error) {
    console.error('\n❌ Error during database test:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
