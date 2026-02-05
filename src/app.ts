import express, { Application, Request, Response } from 'express';
import authRoutes from './routes/auth.routes';
import postRoutes from './routes/post.routes';
import commentRoutes from './routes/comment.routes';
import { authMiddleware } from './middlewares/auth.middleware';
import { requireAdmin, requireAuthor } from './middlewares/role.middleware';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Blog CMS API',
    status: 'running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      posts: '/api/posts',
      comments: '/api/comments',
      health: '/health',
      protected: '/api/protected',
      adminOnly: '/api/admin'
    }
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);

// Demo: Protected route (requires authentication)
app.get('/api/protected', authMiddleware, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'This is a protected route! You are authenticated.',
    user: req.user
  });
});

// Demo: Admin-only route
app.get('/api/admin', authMiddleware, requireAdmin, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'This is an admin-only route!',
    user: req.user
  });
});

// Demo: Author or Admin route
app.get('/api/author', authMiddleware, requireAuthor, (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'This route is accessible by AUTHORS and ADMINS!',
    user: req.user
  });
});

// TODO: Add more routes here
// app.use('/api/users', userRoutes);
// app.use('/api/comments', commentRoutes);
// app.use('/api/categories', categoryRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

export default app;
