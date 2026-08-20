require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const planRoutes = require('./routes/planRoutes');
const subscriptionRoutes = require('./routes/subscriptionRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// API health endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'SaaS Subscription Backend is running' });
});

// API Routes (namespaced)
app.use('/api/auth', authRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/user', userRoutes);

// Direct / exact API Route Aliases (both /api/* and root /*)
const { signup, login } = require('./controllers/authController');
const { getPlans } = require('./controllers/planController');
const { subscribe, upgradePlan, cancelSubscription } = require('./controllers/subscriptionController');
const { getProfile, getDashboard, getPremiumContent } = require('./controllers/userController');
const { protect } = require('./middleware/auth');
const { requirePlan } = require('./middleware/roleGuard');

// Exact route implementations for /api/...
app.post('/api/signup', signup);
app.post('/api/login', login);
app.post('/api/subscribe', protect, subscribe);
app.put('/api/upgrade-plan', protect, upgradePlan);
app.post('/api/cancel-subscription', protect, cancelSubscription);
app.get('/api/profile', protect, getProfile);
app.get('/api/dashboard', protect, getDashboard);
app.get('/api/premium-content', protect, requirePlan(['premium']), getPremiumContent);

// Exact top-level routes (POST, PUT are always API; GET checks for API / Auth headers)
app.post('/signup', signup);
app.post('/login', login);
app.post('/subscribe', protect, subscribe);
app.put('/upgrade-plan', protect, upgradePlan);
app.post('/cancel-subscription', protect, cancelSubscription);

// Helper for top-level GET routes to distinguish API calls from SPA page loads
const handleApiOrSpa = (apiHandler) => (req, res, next) => {
  const isApiRequest =
    req.xhr ||
    req.headers.authorization ||
    req.headers['content-type'] === 'application/json' ||
    (req.headers.accept && req.headers.accept.includes('application/json') && !req.headers.accept.includes('text/html'));

  if (isApiRequest) {
    return apiHandler(req, res, next);
  }
  next();
};

app.get('/plans', handleApiOrSpa(getPlans));
app.get('/profile', handleApiOrSpa((req, res, next) => protect(req, res, () => getProfile(req, res))));
app.get('/dashboard', handleApiOrSpa((req, res, next) => protect(req, res, () => getDashboard(req, res))));
app.get('/premium-content', handleApiOrSpa((req, res, next) => protect(req, res, () => requirePlan(['premium'])(req, res, () => getPremiumContent(req, res)))));


// Database offline / mongoose error fallback middleware
app.use((err, req, res, next) => {
  if (err.name === 'MongooseError' || err.name === 'MongoNetworkError' || (err.message && err.message.includes('buffering timed out'))) {
    console.warn('[AI Studio] Database offline — returning mock response');
    if (req.method === 'GET') {
      return res.json(req.path.endsWith('s') || req.path.endsWith('s/') ? [] : {});
    }
    return res.status(503).json({ error: 'Service temporarily unavailable (database offline)' });
  }
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Serve frontend static build
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
const frontendBuild = path.resolve(__dirname, '../../frontend/build');
const staticPath = fs.existsSync(frontendDist) ? frontendDist : frontendBuild;

if (fs.existsSync(staticPath)) {
  app.use(express.static(staticPath));
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  // If static build is not present
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ message: 'API route not found' });
    }
    res.send(`
      <!DOCTYPE html>
      <html>
        <head><title>SubHub</title></head>
        <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc;">
          <div style="text-align: center; padding: 2rem; background: white; border-radius: 8px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
            <h2>SubHub is starting up...</h2>
            <p>Building frontend assets. Please refresh in a moment.</p>
          </div>
        </body>
      </html>
    `);
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT} (0.0.0.0:${PORT})`);
});
