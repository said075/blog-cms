import express, { Application, Request, Response } from 'express';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Welcome to Blog CMS API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// TODO: Add routes here
// app.use('/api/posts', postRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);

export default app;
