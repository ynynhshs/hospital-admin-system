import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

import connectDB from './backend/config/db.ts';
import authRoutes from './backend/routes/authRoutes.ts';
import userRoutes from './backend/routes/userRoutes.ts';
import employeeRoutes from './backend/routes/employeeRoutes.ts';
import departmentRoutes from './backend/routes/departmentRoutes.ts';
import leakRoutes from './backend/routes/leakRoutes.ts';
import attendanceRoutes from './backend/routes/attendanceRoutes.ts';
import leaveRoutes from './backend/routes/leaveRoutes.ts';
import recordRoutes from './backend/routes/recordRoutes.ts';
import reportRoutes from './backend/routes/reportRoutes.ts';
import auditRoutes from './backend/routes/auditRoutes.ts';
import dashboardRoutes from './backend/routes/dashboardRoutes.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Connect to MongoDB Atlas (or local resilient store)
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/leaks', leakRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Direct ZIP download routes
app.get(['/api/system/download-zip', '/hospital-admin-system.zip'], (req, res) => {
  const zipPath = path.resolve(__dirname, 'hospital-admin-system.zip');
  res.download(zipPath, 'hospital-admin-system.zip');
});

// Serve frontend with Vite middlewares in dev, or static in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 Hospital Admin System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
