const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

let ClerkExpressWithAuth;
let ClerkExpressRequireAuth;

try {
  ({ ClerkExpressWithAuth, ClerkExpressRequireAuth } = require('@clerk/express'));
} catch (error) {
  console.warn(
    '[@clerk/express] not found. Using mock middleware for local development.'
  );

  const resolveMockAuth = (req) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.split(' ')[1];

    if (!token) {
      return null;
    }

    if (token.startsWith('mock-token-')) {
      const userId = token.replace('mock-token-', '');
      return {
        userId,
        sessionId: `mock-session-${userId}`,
      };
    }

    return {
      userId: token,
      sessionId: `mock-session-${token}`,
    };
  };

  ClerkExpressWithAuth = () => (req, _res, next) => {
    req.auth = resolveMockAuth(req);
    next();
  };

  ClerkExpressRequireAuth = () => (req, res, next) => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({
        message: 'Unauthorized. Provide a mock token via Authorization header.',
      });
    }

    return next();
  };
}

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: '*',
  })
);

app.use(ClerkExpressWithAuth());

const mongoUri = process.env.MONGO_URI;

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => {
      console.log('MongoDB connected');
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
    });
} else {
  console.warn('MONGO_URI not provided. MongoDB connection skipped.');
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/me', ClerkExpressRequireAuth(), (req, res) => {
  res.json({
    userId: req.auth.userId,
    sessionId: req.auth.sessionId,
  });
});

app.post('/api/items', ClerkExpressRequireAuth(), (req, res) => {
  res.status(201).json({
    message: 'Item created',
    userId: req.auth.userId,
    payload: req.body || null,
  });
});

module.exports = app;
