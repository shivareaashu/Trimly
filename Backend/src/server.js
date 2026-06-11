import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRouter from './routes/index.js';
import { loadAllTranslations } from './core/localization/locale-loader.js';
import { startRevisitReminderScheduler } from './shared/services/reminders/revisitReminder.scheduler.js';

// Load translation directories at startup
try {
  loadAllTranslations();
} catch (err) {
  console.error('❌ Failed to load localization:', err.message);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // Adjust to specific frontend domain in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id', 'x-tenant-slug'],
}));

app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json());

// Main API Mount
app.use('/api', apiRouter);

// Basic health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Global Server Error:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🚀 Trimly Backend running on port ${PORT}`);
  console.log(`Scoping environment: ${process.env.NODE_ENV}`);
  startRevisitReminderScheduler();
});

export default app;
