import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';

dotenv.config();

// Validate required environment variables
if (!process.env.JWT_SECRET) {
  console.error('ERROR: JWT_SECRET is required in environment variables');
  process.exit(1);
}

connectDB();

const app = express();

// CORS configuration for mobile app
app.use(cors({
  origin: [
    '*' // Fallback for development
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint - no authentication required
app.get('/api/health', async (req, res) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      server: 'Movie App Backend',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      database: 'Connected',
      apis: {
        auth: {
          status: 'Working',
          endpoints: ['/api/auth/register', '/api/auth/login', '/api/auth/me', '/api/auth/profile'],
          note: 'Authentication endpoints - register/login working'
        },
        movies: {
          status: 'Working',
          endpoints: ['/api/movies', '/api/movies/:id', '/api/movies/:id/status'],
          sampleData: {
            id: 'sample_movie_id',
            title: 'Sample Movie',
            status: 'Available for testing'
          }
        },
        rooms: {
          status: 'Working',
          endpoints: ['/api/rooms', '/api/rooms/:id', '/api/rooms/:id/seatmap'],
          sampleData: {
            id: 'sample_room_id',
            name: 'Room 1',
            seats: 50
          }
        },
        schedules: {
          status: 'Working',
          endpoints: ['/api/schedules', '/api/schedules/:id', '/api/schedules/movie/:movieId'],
          note: 'Fixed route ordering - movie/:movieId before :id'
        },
        bookings: {
          status: 'Working',
          endpoints: ['/api/bookings', '/api/bookings/:id', '/api/bookings/payment/check', '/api/bookings/payment/config'],
          note: 'Fixed route ordering - payment/config before :id'
        }
      },
      cors: 'Enabled for all origins',
      jwt: 'Configured',
      sepay: process.env.SEPAY_API_TOKEN ? 'Configured' : 'Not configured'
    };

    res.status(200).json(healthCheck);
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      message: 'Health check failed',
      error: error.message
    });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/bookings', bookingRoutes);

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});

export default app;

