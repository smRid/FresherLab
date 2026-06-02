import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { clerkMiddleware, getAuth } from '@clerk/express'
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './config/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import stripeRouter, { handleStripeWebhook } from './routes/stripeRoutes.js';
import initDb from './config/initDb.js';

const app = express();

await connectCloudinary()
await initDb()

app.use(cors());

// Stripe webhook needs raw body — must come BEFORE express.json()
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

app.use(express.json());
app.use(clerkMiddleware())

app.get('/', (req, res) => res.send('Server is Live!'));

const requireApiAuth = (req, res, next) => {
  let userId;

  try {
    userId = getAuth(req).userId;
  } catch {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (!userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  next();
};

app.use('/api/ai', requireApiAuth, aiRouter);
app.use('/api/user', requireApiAuth, userRouter);
app.use('/api/stripe', requireApiAuth, stripeRouter);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server is running on port', PORT);
});
