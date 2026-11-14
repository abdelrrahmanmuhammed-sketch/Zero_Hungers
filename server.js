'use strict';
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and Large JSON bodies for food photos (base64)
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  req.token = token;
  req.user = db.getUserByToken(token);
  next();
}
app.use(authMiddleware);

function sanitizeUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    location: u.location || '',
    area: u.area || '',
    type: u.type,
    isAdmin: Boolean(u.is_admin || u.type === 'admin'),
    avatar: u.avatar || '',
    joined: u.joined
  };
}

// ================= API ROUTES =================

// Register
app.post('/api/register', (req, res) => {
  try {
    const { name, email, phone, location, area, password, type } = req.body;
    if (!name || !email || !password || String(password).length < 6) {
      return res.status(400).json({ ok: false, error: 'Name, email, and password (at least 6 characters) are required.' });
    }

    const existing = db.findUserByEmailOrName(email);
    if (existing) {
      return res.status(400).json({ ok: false, error: 'An account with this email address already exists.' });
    }

    const newUser = db.createUser({
      name,
      email,
      phone,
      location,
      area,
      password,
      type: type || 'donor',
      isAdmin: false
    });

    const token = db.createSession(newUser.id);
    const state = db.getAllState();

    return res.json({
      ok: true,
      token,
      user: sanitizeUser(newUser),
      data: state
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Login
app.post('/api/login', (req, res) => {
  try {
    const { email, password, type } = req.body;
    const identifier = String(email || '').trim();
    if (!identifier || !password) {
      return res.status(400).json({ ok: false, error: 'Please enter your email/name and password.' });
    }

    const user = db.findUserByEmailOrName(identifier);
    if (!user || user.password !== String(password)) {
      return res.status(400).json({ ok: false, error: 'Invalid name/email or password.' });
    }

    if (type && type !== user.type && user.type !== 'admin' && !user.is_admin) {
      return res.status(400).json({ ok: false, error: `Account type mismatch: This account is registered as a ${user.type}.` });
    }

    const token = db.createSession(user.id);
    const state = db.getAllState();

    return res.json({
      ok: true,
      token,
      user: sanitizeUser(user),
      data: state
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  if (req.token) {
    db.deleteSession(req.token);
  }
  return res.json({ ok: true });
});

// Bootstrap / State / Me
const handleState = (req, res) => {
  const state = db.getAllState();
  return res.json({
    ok: true,
    user: sanitizeUser(req.user),
    data: state
  });
};
app.get('/api/bootstrap', handleState);
app.get('/api/state', handleState);
app.get('/api/me', handleState);

// Update Profile
app.patch('/api/me', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ ok: false, error: 'Authentication required' });
  }
  try {
    const updated = db.updateUser(req.user.id, req.body);
    const state = db.getAllState();
    return res.json({
      ok: true,
      user: sanitizeUser(updated),
      data: state
    });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Donations
app.post('/api/donations', (req, res) => {
  try {
    const { donorName, source, foodType, quantity, date, expiry, location, area, phone, notes, image } = req.body;
    if (!donorName || !foodType || !quantity || !location) {
      return res.status(400).json({ ok: false, error: 'Donor name, food type, quantity, and location are required.' });
    }

    const id = db.addDonation(req.body, req.user ? req.user.id : null);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/donations/:id', (req, res) => {
  try {
    const { status } = req.body;
    const reservedBy = req.user ? req.user.name : null;
    db.updateDonationStatus(req.params.id, status, reservedBy);
    const state = db.getAllState();
    return res.json({ ok: true, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Offers
app.post('/api/offers', (req, res) => {
  try {
    const id = db.addOffer(req.body, req.user ? req.user.id : null);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/offers/:id', (req, res) => {
  try {
    db.trackOffer(req.params.id, req.body);
    const state = db.getAllState();
    return res.json({ ok: true, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Ads
app.post('/api/ads', (req, res) => {
  try {
    const id = db.addAd(req.body, req.user ? req.user.id : null);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.patch('/api/ads/:id', (req, res) => {
  try {
    db.updateAd(req.params.id, req.body);
    const state = db.getAllState();
    return res.json({ ok: true, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.delete('/api/ads/:id', (req, res) => {
  try {
    db.deleteAd(req.params.id);
    const state = db.getAllState();
    return res.json({ ok: true, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Charities
app.post('/api/charities', (req, res) => {
  try {
    const id = db.addCharity(req.body);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Requests
app.post('/api/requests', (req, res) => {
  try {
    const id = db.addRequest(req.body);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Beneficiaries
app.post('/api/beneficiaries', (req, res) => {
  try {
    const id = db.addBeneficiary(req.body);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Locations
app.post('/api/locations', (req, res) => {
  try {
    const id = db.addLocation(req.body);
    const state = db.getAllState();
    return res.json({ ok: true, id, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// Theme
app.post('/api/theme', (req, res) => {
  const theme = req.body.theme === 'dark' ? 'dark' : 'light';
  db.setTheme(theme);
  return res.json({ ok: true, theme });
});

// Image Upload
app.post('/api/upload', (req, res) => {
  const url = req.body.dataUrl || req.body.image || '';
  return res.json({ ok: true, url });
});

// Ratings (5-Star system for charities rating restaurants, hotels, and donors)
app.post('/api/ratings', (req, res) => {
  try {
    const { targetType, targetId, targetName, stars, comment } = req.body;
    if (!targetName && !targetId) {
      return res.status(400).json({ ok: false, error: 'Target name is required.' });
    }

    const userId = req.user ? req.user.id : null;
    const userName = req.user ? req.user.name : (req.body.userName || 'Verified Charity');
    const userType = req.user ? req.user.type : (req.body.userType || 'charity');

    const newId = db.addRating({
      targetType: targetType || 'partner',
      targetId: targetId || targetName,
      targetName: targetName || targetId,
      userId,
      userName,
      userType,
      stars: parseInt(stars) || 5,
      comment: comment || req.body.feedback || ''
    });

    const state = db.getAllState();
    return res.json({ ok: true, id: newId, rating: { id: newId, stars: parseInt(stars) || 5 }, ratingMap: state.ratingMap, data: state });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get('/api/ratings', (req, res) => {
  const state = db.getAllState();
  return res.json({ ok: true, ratings: state.ratings, ratingMap: state.ratingMap });
});

// Notifications
app.patch('/api/notifications/read', (req, res) => {
  db.markNotificationsRead();
  const state = db.getAllState();
  return res.json({ ok: true, data: state });
});

app.delete('/api/notifications', (req, res) => {
  db.clearNotifications();
  const state = db.getAllState();
  return res.json({ ok: true, data: state });
});

// Compatibility fallback for routes without /api prefix
app.use((req, res, next) => {
  if (req.url.startsWith('/register') || req.url.startsWith('/login') || req.url.startsWith('/logout') ||
      req.url.startsWith('/bootstrap') || req.url.startsWith('/state') || req.url.startsWith('/me') ||
      req.url.startsWith('/donations') || req.url.startsWith('/offers') || req.url.startsWith('/ads') ||
      req.url.startsWith('/charities') || req.url.startsWith('/requests') || req.url.startsWith('/beneficiaries') ||
      req.url.startsWith('/locations') || req.url.startsWith('/theme') || req.url.startsWith('/upload') ||
      req.url.startsWith('/notifications') || req.url.startsWith('/ratings')) {
    req.url = '/api' + req.url;
    return app.handle(req, res);
  }
  next();
});

// ================= STATIC FILES =================
const publicPath = path.join(__dirname, 'public');
if (!fs.existsSync(publicPath)) {
  fs.mkdirSync(publicPath, { recursive: true });
}
app.use(express.static(publicPath));

// Also serve zero-hunger2.html as fallback if requested directly
app.get('/zero-hunger2.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'zero-hunger2.html'));
});

// Fallback to index.html for single-page application routing
app.use((req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.sendFile(path.join(__dirname, 'zero-hunger2.html'));
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  Zero Hunger Platform is running!`);
  console.log(`  URL: http://localhost:${PORT}`);
  console.log(`  Database: SQLite (zero_hunger.db)`);
  console.log(`====================================================`);
});
