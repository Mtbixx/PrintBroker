import express from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import { config } from './config.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(compression());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Bir hata oluştu' });
});

const port = config.server.port;
app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor`);
}); 