import * as dotenv from 'dotenv';
// Load environment variables before any other imports
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { WebSocketService } from './websocket/websocket.service';
import authRoutes from './routes/auth.routes';
import hueRoutes from './routes/hue.routes';

const app: Express = express();
const port = process.env.PORT || 3000;
const wsPort = 3001;

// Initialize WebSocket service
new WebSocketService(wsPort);

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Add authentication routes
app.use('/auth', authRoutes);
app.use('/hue', hueRoutes);

app.get('/', (req: Request, res: Response) => {
  res.sendFile('index.html', { root: './public' });
});

app.listen(port, () => {
  console.log(`⚡️[server]: HTTP Server running at http://localhost:${port}`);
  console.log(`⚡️[server]: WebSocket Server running at ws://localhost:${wsPort}`);
  console.log(`🔑 Visit http://localhost:${port}/auth/google to authenticate with Google Calendar`);
});
