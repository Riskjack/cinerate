require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const Movie = require('./models/Movie');
const sampleMovies = require('./seed/movies');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set. Copy .env.example to .env first.');
    await connectDB();

    // Auto-seed sample movies the first time the app starts with an empty database.
    if ((await Movie.countDocuments()) === 0) {
      await Movie.insertMany(sampleMovies);
      console.log(`Seeded ${sampleMovies.length} sample movies.`);
    }

    app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`));
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();
