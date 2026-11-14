'use strict';
const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');

const dbPath = path.join(__dirname, 'zero_hunger.db');
const db = new DatabaseSync(dbPath);

// Enable WAL mode for high concurrency
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    location TEXT,
    area TEXT,
    password TEXT NOT NULL,
    type TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    avatar TEXT,
    joined INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS donations (
    id TEXT PRIMARY KEY,
    donor_name TEXT NOT NULL,
    source TEXT NOT NULL,
    food_type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    date TEXT NOT NULL,
    expiry TEXT,
    location TEXT NOT NULL,
    area TEXT,
    phone TEXT,
    notes TEXT,
    image TEXT,
    status TEXT DEFAULT 'Pending',
    reserved_by TEXT,
    user_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS offers (
    id TEXT PRIMARY KEY,
    business_type TEXT NOT NULL,
    restaurant_name TEXT,
    hotel_name TEXT,
    title TEXT NOT NULL,
    discount INTEGER NOT NULL,
    audience TEXT,
    location TEXT,
    phone TEXT,
    valid_until TEXT,
    description TEXT,
    featured INTEGER DEFAULT 0,
    image TEXT,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    user_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    business_type TEXT,
    business TEXT NOT NULL,
    owner TEXT,
    title TEXT,
    ad_type TEXT,
    governorate TEXT,
    location TEXT,
    country TEXT,
    phone TEXT,
    discount INTEGER DEFAULT 0,
    duration TEXT,
    start_date TEXT,
    end_date TEXT,
    desc TEXT,
    featured INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending',
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    user_id TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS charities (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    person TEXT,
    phone TEXT,
    email TEXT,
    location TEXT,
    type TEXT,
    desc TEXT,
    joined INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    org TEXT NOT NULL,
    food_type TEXT,
    quantity INTEGER NOT NULL,
    location TEXT,
    date TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS beneficiaries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    count INTEGER NOT NULL,
    location TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dist_locations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS partners (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    phone TEXT,
    location TEXT,
    donations INTEGER DEFAULT 0,
    meals INTEGER DEFAULT 0,
    offers INTEGER DEFAULT 0,
    ads INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    text TEXT NOT NULL,
    icon TEXT,
    time INTEGER NOT NULL,
    read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS ratings (
    id TEXT PRIMARY KEY,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    target_name TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    user_type TEXT,
    stars INTEGER NOT NULL,
    comment TEXT,
    created_at INTEGER NOT NULL
  );
`);

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// Seed Initial Data if empty
function seedDatabase() {
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  if (userCount > 0) return;

  console.log('Seeding initial Zero Hunger database in SQLite...');

  // 1. Seed Admin
  const adminId = 'admin-seed';
  db.prepare(`
    INSERT INTO users (id, name, email, phone, location, area, password, type, is_admin, avatar, joined)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    adminId,
    'Zero Hunger Admin',
    'admin@zerohunger.local',
    '+20 10 00000000',
    'Cairo',
    'Downtown',
    'Admin123',
    'admin',
    1,
    '',
    Date.now()
  );

  const govs = ['Cairo','Alexandria','Giza','Kafr El-Sheikh','Gharbia','Dakahlia','Sharqia','Qalyubia','Beheira','Damietta','Port Said','Suez','Monufia','Ismailia','Minya','Assiut','Luxor','Aswan','Fayoum','Sohag'];
  const foods = ['Meals/Entrees','Bakery','Fruits & Vegetables','Beverages','Others'];
  const areas = ['Downtown','Corniche','El Gomhoria','El Geish','Industrial Zone','University District','Old Town','New City'];
  const restos = [
    'El Tahrir Kitchen','Nile Taste','Alexandria Grill','Delta Koshari','Cairo Bites','Green Plate Restaurant',
    'Fayoum House','Port Said Fish','Luxor Table','Aswan Nubian Kitchen','Mansoura Diner','Tanta Kitchen',
    'Kafr El-Sheikh Meals','Giza Oven','Sharqia Grill','Suez Harbor Kitchen','Beheira Home Food','Qena Kitchen',
    'Heliopolis Bites','Maadi Garden Restaurant','Zamalek Cafe Kitchen','Dokki Family Table','Nasr City Meals','6th October Kitchen','New Cairo Plate'
  ];
  const hotels = [
    'Nile View Hotel','Alexandria Corniche Hotel','Giza Pyramid Inn','Delta Grand Hotel','Cairo Palm Hotel',
    'Luxor Temple Hotel','Aswan River Hotel','Port Said Marine Hotel','Mansoura Plaza Hotel','Tanta Central Hotel',
    'Kafr El-Sheikh Garden Hotel','Suez Canal Hotel','Fayoum Lake Hotel','Hurghada Sun Hotel','Ismailia Park Hotel',
    'Minya Palace Hotel','Sohag Guest Hotel','Qena Oasis Hotel'
  ];
  const charities = [
    'Goodwill Food Bank','Hope Kitchen','Mercy Relief Egypt','Orphans Care House','Community Pot Cairo',
    'Alexandria Aid Society','Delta Charity Network','Nile Hands Organisation','Share Bread Initiative','Warm Plate Foundation',
    'Kafr El-Sheikh Relief','Upper Egypt Kitchen','Children First Charity','Neighborhood Meals','Together for Hunger'
  ];
  const donors = [
    'Amira Hassan','Omar Farouk','Nour El-Din','Salma Adel','Youssef Kamal','Hana Magdy','Karim Tarek',
    'Laila Mostafa','Hassan Fathy','Mona Saeed','Tamer Ashraf','Dina Mahmoud','Sherif Nabil','Aya Ibrahim',
    'Mostafa Samir','Rania Fouad','Adel Hamdy','Farida Nasser','Walid Sherif','Heba Lotfy'
  ];

  function phone(prefix, n) {
    return '+20 10 ' + String(20000000 + n).slice(-8);
  }
  function demoDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  }
  function demoIso(daysAgo, hour) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hour || 10, (daysAgo * 11) % 60, 0, 0);
    return d.toISOString();
  }

  const insertUser = db.prepare(`INSERT INTO users (id, name, email, phone, location, area, password, type, is_admin, avatar, joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertPartner = db.prepare(`INSERT INTO partners (id, name, type, phone, location, donations, meals, offers, ads) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  // Restos
  restos.forEach((name, i) => {
    const loc = govs[i % govs.length], ph = phone(10, i + 11);
    insertPartner.run('p-r-' + i, name, 'Restaurant', ph, loc, 4, 180, 1, 1);
    insertUser.run('u-r-' + i, name, 'resto' + (i + 1) + '@zerohunger.local', ph, loc, areas[i % areas.length], 'Demo123', 'restaurant', 0, '', Date.now() - i * 86400000);
  });

  // Hotels
  hotels.forEach((name, i) => {
    const loc = govs[(i + 4) % govs.length], ph = phone(11, i + 41);
    insertPartner.run('p-h-' + i, name, 'Hotel', ph, loc, 3, 140, 1, 1);
    insertUser.run('u-h-' + i, name, 'hotel' + (i + 1) + '@zerohunger.local', ph, loc, areas[(i + 2) % areas.length], 'Demo123', 'hotel', 0, '', Date.now() - i * 86400000);
  });

  // Charities
  const insertCharity = db.prepare(`INSERT INTO charities (id, name, person, phone, email, location, type, desc, joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  const insertReq = db.prepare(`INSERT INTO requests (id, org, food_type, quantity, location, date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`);
  const insertBen = db.prepare(`INSERT INTO beneficiaries (id, name, count, location, created_at) VALUES (?, ?, ?, ?, ?)`);
  const insertDist = db.prepare(`INSERT INTO dist_locations (id, name, area, created_at) VALUES (?, ?, ?, ?)`);

  charities.forEach((name, i) => {
    const loc = govs[(i + 2) % govs.length], ph = phone(12, i + 71);
    const types = ['Food Bank','Orphanage','Relief Organisation','Community Kitchen','Other'];
    insertCharity.run('ch-' + i, name, donors[i % donors.length], ph, 'charity' + (i + 1) + '@zerohunger.local', loc, types[i % types.length], 'Community organisation helping families access surplus meals.', Date.now() - i * 43200000);
    insertUser.run('u-c-' + i, name, 'charity' + (i + 1) + '@zerohunger.local', ph, loc, areas[i % areas.length], 'Demo123', 'charity', 0, '', Date.now() - i * 86400000);
    insertReq.run('rq-' + i, name, foods[i % foods.length], 20 + (i * 7) % 80, loc, demoDate(i % 20), Date.now() - i * 86400000);
    insertBen.run('bf-' + i, name + ' beneficiaries', 40 + (i * 13) % 180, loc, Date.now() - i * 86400000);
    insertDist.run('dl-' + i, name + ' distribution point', loc + ' — ' + areas[i % areas.length], Date.now() - i * 86400000);
  });

  // Donors
  donors.forEach((name, i) => {
    const loc = govs[(i + 6) % govs.length], ph = phone(15, i + 101);
    insertUser.run('u-d-' + i, name, 'donor' + (i + 1) + '@zerohunger.local', ph, loc, areas[i % areas.length], 'Demo123', 'donor', 0, '', Date.now() - i * 86400000);
  });

  // Donations
  const statuses = ['Pending', 'Received', 'Requested', 'Received', 'Pending', 'Received'];
  const notes = [
    'Freshly packed and ready for pickup this evening.',
    'Kept chilled. Please collect before expiry.',
    'Surplus from an event. Still sealed and labeled.',
    'Family-size portions suitable for distribution.',
    'Please bring insulated boxes if possible.'
  ];
  const insertDonation = db.prepare(`
    INSERT INTO donations (id, donor_name, source, food_type, quantity, date, expiry, location, area, phone, notes, image, status, reserved_by, user_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  let did = 0;
  function addDon(donorName, source, i) {
    const loc = govs[i % govs.length];
    const qty = 12 + (i * 9) % 90;
    insertDonation.run(
      'don-' + did,
      donorName,
      source,
      foods[i % foods.length],
      qty,
      demoDate((i % 170) + 1),
      demoDate(Math.max(0, (i % 12) - 2)),
      loc,
      areas[i % areas.length],
      phone(10, i + 3),
      notes[i % notes.length],
      '',
      statuses[i % statuses.length],
      '',
      null,
      demoIso((i % 170) + 1, 8 + (i % 10))
    );
    did++;
  }
  restos.forEach((name, i) => { for (let k = 0; k < 4; k++) addDon(name, 'restaurant', i * 4 + k); });
  hotels.forEach((name, i) => { for (let k = 0; k < 3; k++) addDon(name, 'hotel', 200 + i * 3 + k); });
  donors.forEach((name, i) => { for (let k = 0; k < 2; k++) addDon(name, 'donor', 400 + i * 2 + k); });

  // Offers
  const insertOffer = db.prepare(`
    INSERT INTO offers (id, business_type, restaurant_name, hotel_name, title, discount, audience, location, phone, valid_until, description, featured, image, views, clicks, user_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const offerTitlesR = ['Community meal discount','Family platter offer','Charity lunch deal','Weekday surplus box','Ramadan sharing plate'];
  const offerTitlesH = ['Charity overnight stay','Community room rate','Weekend support night','Relief accommodation offer','Partner stay discount'];

  restos.forEach((name, i) => {
    const loc = govs[i % govs.length];
    insertOffer.run(
      'off-r-' + i,
      'Restaurant',
      name,
      '',
      offerTitlesR[i % offerTitlesR.length] + ' — ' + name,
      10 + (i * 5) % 45,
      ['Both','Charity Organisations','Regular Customers'][i % 3],
      loc,
      phone(10, i + 11),
      demoDate(-(10 + i % 20)),
      'Discounted meals to support families and reduce leftover waste.',
      i % 5 === 0 ? 1 : 0,
      '',
      20 + (i * 17) % 240,
      4 + (i * 7) % 60,
      null,
      Date.now() - i * 3600000
    );
  });

  hotels.forEach((name, i) => {
    const loc = govs[(i + 4) % govs.length];
    insertOffer.run(
      'off-h-' + i,
      'Hotel',
      name,
      name,
      offerTitlesH[i % offerTitlesH.length] + ' — ' + name,
      15 + (i * 6) % 40,
      ['Both','Charity Organisations'][i % 2],
      loc,
      phone(11, i + 41),
      demoDate(-(8 + i % 18)),
      'Reduced stay rate for charity teams supporting food distribution.',
      i % 4 === 0 ? 1 : 0,
      '',
      12 + (i * 13) % 180,
      3 + (i * 5) % 40,
      null,
      Date.now() - i * 5400000
    );
  });

  // Ads
  const insertAd = db.prepare(`
    INSERT INTO ads (id, business_type, business, owner, title, ad_type, governorate, location, country, phone, discount, duration, start_date, end_date, desc, featured, status, views, clicks, user_id, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const adTypes = ['Advertisement','Featured Campaign','Community Offer'];
  [...restos.slice(0, 14), ...hotels.slice(0, 10)].forEach((name, i) => {
    const isHotel = hotels.includes(name);
    const loc = govs[i % govs.length];
    insertAd.run(
      'ad-' + i,
      isHotel ? 'Hotel' : 'Restaurant',
      name,
      name,
      (isHotel ? 'Hotel support ad: ' : 'Restaurant support ad: ') + name,
      adTypes[i % adTypes.length],
      loc,
      loc,
      'Egypt',
      phone(10, i + 21),
      8 + (i * 4) % 30,
      (2 + (i % 4)) + ' weeks',
      demoDate(20 - i),
      demoDate(-(10 + i % 12)),
      'Advertisement supporting the Zero Hunger platform and local food access.',
      i % 6 === 0 ? 1 : 0,
      ['pending','active','active','expired'][i % 4],
      5 + (i * 19) % 300,
      1 + (i * 6) % 70,
      null,
      Date.now() - i * 7200000
    );
  });

  // Notifications
  const insertNotif = db.prepare(`INSERT INTO notifications (id, user_id, text, icon, time, read) VALUES (?, ?, ?, ?, ?, ?)`);
  insertNotif.run('n-1', null, 'Welcome to Zero Hunger! Platform is live with 27 governorates.', 'bell', Date.now() - 3600000, 0);
  insertNotif.run('n-2', null, 'New restaurant partner joined: El Tahrir Kitchen', 'restaurant', Date.now() - 7200000, 0);
  insertNotif.run('n-3', null, 'Donation of 50 meals received by Goodwill Food Bank', 'truck', Date.now() - 10800000, 1);

  // Settings
  db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', 'light')`).run();

  console.log('Seeding completed successfully!');
}

function seedRatings() {
  const ratingCount = db.prepare('SELECT COUNT(*) as c FROM ratings').get().c;
  if (ratingCount > 0) return;

  console.log('Seeding initial charity 5-star ratings in SQLite...');
  const insertRating = db.prepare(`
    INSERT INTO ratings (id, target_type, target_id, target_name, user_id, user_name, user_type, stars, comment, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const sampleReviews = [
    { targetType: 'restaurant', name: 'El Tahrir Kitchen', charity: 'Goodwill Food Bank', stars: 5, comment: 'Fresh, warm meals packed in hygienic containers. Excellent cooperation with our food bank.' },
    { targetType: 'restaurant', name: 'Nile Taste', charity: 'Hope Kitchen', stars: 5, comment: 'High quality family meal platters, perfectly preserved and appreciated by local families.' },
    { targetType: 'restaurant', name: 'Alexandria Grill', charity: 'Alexandria Aid Society', stars: 5, comment: 'Healthy and delicious grilled chicken and rice meals delivered to children on time.' },
    { targetType: 'restaurant', name: 'Delta Koshari', charity: 'Delta Charity Network', stars: 5, comment: 'Large quantity of nutritious hot meals that fed over 80 people in our neighborhood.' },
    { targetType: 'restaurant', name: 'Cairo Bites', charity: 'Mercy Relief Egypt', stars: 4, comment: 'Very good surplus sandwiches and bakery items, cleanly sealed.' },
    { targetType: 'restaurant', name: 'Green Plate Restaurant', charity: 'Community Pot Cairo', stars: 5, comment: 'Fresh vegetables and cooked dishes. Always ready on time for pickup.' },
    { targetType: 'hotel', name: 'Nile View Hotel', charity: 'Hope Kitchen', stars: 5, comment: 'Top quality banquet food trays provided in insulated containers. Highly recommended!' },
    { targetType: 'hotel', name: 'Alexandria Corniche Hotel', charity: 'Alexandria Aid Society', stars: 5, comment: 'Respectful staff, clean packaging, and reliable surplus donations after events.' },
    { targetType: 'hotel', name: 'Giza Pyramid Inn', charity: 'Mercy Relief Egypt', stars: 5, comment: 'Generous event surplus with great diversity of meat, vegetables, and rice.' },
    { targetType: 'hotel', name: 'Delta Grand Hotel', charity: 'Delta Charity Network', stars: 5, comment: 'Consistently provides nutritious food boxes whenever they host conferences.' },
    { targetType: 'donor', name: 'Amira Hassan', charity: 'Orphans Care House', stars: 5, comment: 'Generous bakery and bread packages received in wonderful fresh condition.' },
    { targetType: 'donor', name: 'Omar Farouk', charity: 'Share Bread Initiative', stars: 5, comment: 'Dedicated weekly contributor whose food portions are always fresh and family-friendly.' },
    { targetType: 'donor', name: 'Nour El-Din', charity: 'Warm Plate Foundation', stars: 5, comment: 'Warm family meals packed with care. Thank you for your noble support!' }
  ];

  sampleReviews.forEach((r, i) => {
    insertRating.run(
      'rat-' + i,
      r.targetType,
      r.name,
      r.name,
      'ch-' + (i % 5),
      r.charity,
      'charity',
      r.stars,
      r.comment,
      Date.now() - (i + 1) * 7200000
    );
  });
}

seedDatabase();
seedRatings();

// Database Helper API
const dbHelper = {
  findUserByEmailOrName(identifier) {
    const key = String(identifier || '').trim().toLowerCase();
    return db.prepare('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?').get(key, key);
  },

  findUserById(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  },

  createUser({ id = uid(), name, email, phone = '', location = '', area = '', password, type = 'donor', isAdmin = 0, avatar = '' }) {
    db.prepare(`
      INSERT INTO users (id, name, email, phone, location, area, password, type, is_admin, avatar, joined)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, name.trim(), email.trim().toLowerCase(), phone, location, area, password, type, isAdmin ? 1 : 0, avatar, Date.now());

    // Register partner if restaurant or hotel
    if (type === 'restaurant' || type === 'hotel') {
      const ptype = type === 'hotel' ? 'Hotel' : 'Restaurant';
      const exists = db.prepare('SELECT id FROM partners WHERE LOWER(name) = ? AND type = ?').get(name.toLowerCase(), ptype);
      if (!exists) {
        db.prepare('INSERT INTO partners (id, name, type, phone, location, donations, meals, offers, ads) VALUES (?, ?, ?, ?, ?, 0, 0, 0, 0)').run(uid(), name, ptype, phone, location);
      }
    }
    if (type === 'charity') {
      const exists = db.prepare('SELECT id FROM charities WHERE LOWER(name) = ?').get(name.toLowerCase());
      if (!exists) {
        db.prepare('INSERT INTO charities (id, name, person, phone, email, location, type, desc, joined) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(uid(), name, name, phone, email, location, 'Community Organisation', '', Date.now());
      }
    }

    return this.findUserById(id);
  },

  updateUser(id, { name, phone, email, location, area, type, avatar, password }) {
    const user = this.findUserById(id);
    if (!user) return null;

    const newName = name != null ? name.trim() : user.name;
    const newPhone = phone != null ? phone.trim() : user.phone;
    const newEmail = email != null ? email.trim().toLowerCase() : user.email;
    const newLoc = location != null ? location.trim() : user.location;
    const newArea = area != null ? area.trim() : user.area;
    const newType = type != null ? type : user.type;
    const newAvatar = avatar != null ? avatar : user.avatar;
    const newPwd = password ? String(password) : user.password;

    db.prepare(`
      UPDATE users SET name = ?, phone = ?, email = ?, location = ?, area = ?, type = ?, avatar = ?, password = ?
      WHERE id = ?
    `).run(newName, newPhone, newEmail, newLoc, newArea, newType, newAvatar, newPwd, id);

    return this.findUserById(id);
  },

  createSession(userId) {
    const token = uid() + uid() + uid();
    db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(token, userId, Date.now());
    return token;
  },

  getUserByToken(token) {
    if (!token) return null;
    const row = db.prepare(`
      SELECT u.* FROM users u
      JOIN sessions s ON u.id = s.user_id
      WHERE s.token = ?
    `).get(token);
    return row || null;
  },

  deleteSession(token) {
    if (!token) return;
    db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  },

  getAllState() {
    const donations = db.prepare('SELECT * FROM donations ORDER BY created_at DESC').all().map(d => ({
      id: d.id,
      donorName: d.donor_name,
      source: d.source,
      foodType: d.food_type,
      quantity: d.quantity,
      date: d.date,
      expiry: d.expiry,
      location: d.location,
      area: d.area,
      phone: d.phone,
      notes: d.notes,
      image: d.image,
      status: d.status,
      reservedBy: d.reserved_by,
      userId: d.user_id,
      createdAt: d.created_at
    }));

    const offers = db.prepare('SELECT * FROM offers ORDER BY created_at DESC').all().map(o => ({
      id: o.id,
      businessType: o.business_type,
      restaurantName: o.restaurant_name,
      hotelName: o.hotel_name,
      title: o.title,
      discount: o.discount,
      audience: o.audience,
      location: o.location,
      phone: o.phone,
      validUntil: o.valid_until,
      description: o.description,
      featured: Boolean(o.featured),
      image: o.image,
      views: o.views,
      clicks: o.clicks,
      userId: o.user_id,
      createdAt: o.created_at
    }));

    const ads = db.prepare('SELECT * FROM ads ORDER BY created_at DESC').all().map(a => ({
      id: a.id,
      businessType: a.business_type,
      business: a.business,
      owner: a.owner,
      title: a.title,
      adType: a.ad_type,
      governorate: a.governorate,
      location: a.location,
      country: a.country,
      phone: a.phone,
      discount: a.discount,
      duration: a.duration,
      startDate: a.start_date,
      endDate: a.end_date,
      desc: a.desc,
      featured: Boolean(a.featured),
      status: a.status,
      views: a.views,
      clicks: a.clicks,
      userId: a.user_id,
      createdAt: a.created_at
    }));

    const charities = db.prepare('SELECT * FROM charities ORDER BY joined DESC').all();
    const requests = db.prepare('SELECT id, org, food_type as foodType, quantity, location, date, created_at as createdAt FROM requests ORDER BY created_at DESC').all();
    const beneficiaries = db.prepare('SELECT id, name, count, location, created_at as createdAt FROM beneficiaries ORDER BY created_at DESC').all();
    const distLocations = db.prepare('SELECT id, name, area, created_at as createdAt FROM dist_locations ORDER BY created_at DESC').all();
    const partners = db.prepare('SELECT * FROM partners ORDER BY donations DESC').all();
    const notifications = db.prepare('SELECT id, text, icon, time, read FROM notifications ORDER BY time DESC').all().map(n => ({ ...n, read: Boolean(n.read) }));

    const restos = [...new Set(partners.filter(p => p.type === 'Restaurant').map(p => p.name))];
    const hotels = [...new Set(partners.filter(p => p.type === 'Hotel').map(p => p.name))];

    const ratings = db.prepare('SELECT id, target_type as targetType, target_id as targetId, target_name as targetName, user_id as userId, user_name as userName, user_type as userType, stars, comment, created_at as createdAt FROM ratings ORDER BY created_at DESC').all();
    const ratingMap = this.getRatingMap();

    const themeSetting = db.prepare('SELECT value FROM settings WHERE key = ?').get('theme');

    return {
      donations,
      offers,
      ads,
      charities,
      requests,
      beneficiaries,
      distLocations,
      partners,
      restaurants: restos,
      hotels,
      ratings,
      ratingMap,
      notifications,
      theme: themeSetting ? themeSetting.value : 'light'
    };
  },

  getRatingMap() {
    const all = db.prepare('SELECT target_type, target_id, target_name, stars FROM ratings').all();
    const map = {};
    all.forEach(r => {
      const keys = [
        r.target_id,
        r.target_name,
        r.target_id ? r.target_id.toLowerCase() : '',
        r.target_name ? r.target_name.toLowerCase() : '',
        (r.target_type + ':' + r.target_id).toLowerCase(),
        (r.target_type + ':' + r.target_name).toLowerCase()
      ].filter(Boolean);

      const uniqueKeys = [...new Set(keys)];
      uniqueKeys.forEach(k => {
        if (!map[k]) map[k] = { sum: 0, count: 0, avg: 5.0 };
        map[k].sum += r.stars;
        map[k].count++;
        map[k].avg = Number((map[k].sum / map[k].count).toFixed(1));
      });
    });
    return map;
  },

  addRating({ targetType = 'partner', targetId, targetName, userId = null, userName = 'Charity Reviewer', userType = 'charity', stars = 5, comment = '' }) {
    const id = uid();
    const starNum = Math.max(1, Math.min(5, parseInt(stars) || 5));
    const tId = targetId || targetName;
    const tName = targetName || targetId;

    db.prepare(`
      INSERT INTO ratings (id, target_type, target_id, target_name, user_id, user_name, user_type, stars, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, targetType, tId, tName, userId, userName, userType, starNum, comment.trim(), Date.now());

    this.addNotification(`${userName} gave a ${starNum}-star rating to ${tName}!`, 'heart');
    return id;
  },

  addDonation(d, userId) {
    const id = d.id || uid();
    const date = d.date || new Date().toISOString().slice(0, 10);
    const createdAt = new Date().toISOString();
    const qty = parseInt(d.quantity) || 0;

    db.prepare(`
      INSERT INTO donations (id, donor_name, source, food_type, quantity, date, expiry, location, area, phone, notes, image, status, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
    `).run(
      id,
      d.donorName,
      d.source || 'donor',
      d.foodType,
      qty,
      date,
      d.expiry || '',
      d.location,
      d.area || '',
      d.phone || '',
      d.notes || '',
      d.image || '',
      userId || null,
      createdAt
    );

    // Update partner record if applicable
    if (d.source === 'restaurant' || d.source === 'hotel') {
      const ptype = d.source === 'hotel' ? 'Hotel' : 'Restaurant';
      const p = db.prepare('SELECT id FROM partners WHERE LOWER(name) = ? AND type = ?').get(d.donorName.toLowerCase(), ptype);
      if (p) {
        db.prepare('UPDATE partners SET donations = donations + 1, meals = meals + ?, phone = COALESCE(NULLIF(phone, ""), ?), location = COALESCE(NULLIF(location, ""), ?) WHERE id = ?')
          .run(qty, d.phone || '', d.location || '', p.id);
      } else {
        db.prepare('INSERT INTO partners (id, name, type, phone, location, donations, meals, offers, ads) VALUES (?, ?, ?, ?, ?, 1, ?, 0, 0)')
          .run(uid(), d.donorName, ptype, d.phone || '', d.location || '', qty);
      }
    }

    this.addNotification(`New donation from ${d.donorName}: ${qty} meals (${d.foodType})`, 'donate');
    return id;
  },

  updateDonationStatus(id, status, reservedBy) {
    db.prepare('UPDATE donations SET status = ?, reserved_by = COALESCE(?, reserved_by) WHERE id = ?').run(status, reservedBy || null, id);
    const don = db.prepare('SELECT donor_name FROM donations WHERE id = ?').get(id);
    if (don) {
      this.addNotification(`Donation ${status.toLowerCase()}: ${don.donor_name}`, 'truck');
    }
  },

  addOffer(o, userId) {
    const id = o.id || uid();
    const btype = o.businessType || 'Restaurant';
    const bname = o.restaurantName || o.hotelName || o.businessName || '';
    const discount = parseInt(o.discount) || 0;

    db.prepare(`
      INSERT INTO offers (id, business_type, restaurant_name, hotel_name, title, discount, audience, location, phone, valid_until, description, featured, image, views, clicks, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?)
    `).run(
      id,
      btype,
      bname,
      btype === 'Hotel' ? bname : '',
      o.title,
      discount,
      o.audience || 'Both',
      o.location || '',
      o.phone || '',
      o.validUntil || '',
      o.description || '',
      o.featured ? 1 : 0,
      o.image || '',
      userId || null,
      Date.now()
    );

    // Partner offer count
    const p = db.prepare('SELECT id FROM partners WHERE LOWER(name) = ? AND type = ?').get(bname.toLowerCase(), btype);
    if (p) {
      db.prepare('UPDATE partners SET offers = offers + 1 WHERE id = ?').run(p.id);
    } else if (bname) {
      db.prepare('INSERT INTO partners (id, name, type, phone, location, donations, meals, offers, ads) VALUES (?, ?, ?, ?, ?, 0, 0, 1, 0)')
        .run(uid(), bname, btype, o.phone || '', o.location || '');
    }

    this.addNotification(`New ${btype.toLowerCase()} offer: ${o.title}`, 'megaphone');
    return id;
  },

  trackOffer(id, { view, click }) {
    if (view) db.prepare('UPDATE offers SET views = views + 1 WHERE id = ?').run(id);
    if (click) db.prepare('UPDATE offers SET clicks = clicks + 1 WHERE id = ?').run(id);
  },

  addAd(a, userId) {
    const id = a.id || uid();
    db.prepare(`
      INSERT INTO ads (id, business_type, business, owner, title, ad_type, governorate, location, country, phone, discount, duration, start_date, end_date, desc, featured, status, views, clicks, user_id, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 0, 0, ?, ?)
    `).run(
      id,
      a.businessType || 'Restaurant',
      a.business,
      a.owner || a.business,
      a.title || a.business,
      a.adType || 'Advertisement',
      a.governorate || a.location || 'Cairo',
      a.location || a.governorate || 'Cairo',
      a.country || 'Egypt',
      a.phone || '',
      parseInt(a.discount) || 0,
      a.duration || '',
      a.startDate || '',
      a.endDate || '',
      a.desc || a.description || '',
      a.featured ? 1 : 0,
      userId || null,
      Date.now()
    );

    const bname = a.business;
    const btype = a.businessType || 'Restaurant';
    const p = db.prepare('SELECT id FROM partners WHERE LOWER(name) = ? AND type = ?').get(bname.toLowerCase(), btype);
    if (p) {
      db.prepare('UPDATE partners SET ads = ads + 1 WHERE id = ?').run(p.id);
    }

    this.addNotification(`New advertisement request from ${a.business}`, 'megaphone');
    return id;
  },

  updateAd(id, fields) {
    const ad = db.prepare('SELECT * FROM ads WHERE id = ?').get(id);
    if (!ad) return false;

    if (fields.status) db.prepare('UPDATE ads SET status = ? WHERE id = ?').run(fields.status, id);
    if ('featured' in fields) db.prepare('UPDATE ads SET featured = ? WHERE id = ?').run(fields.featured ? 1 : 0, id);
    if (fields.view) db.prepare('UPDATE ads SET views = views + 1 WHERE id = ?').run(id);
    if (fields.click) db.prepare('UPDATE ads SET clicks = clicks + 1 WHERE id = ?').run(id);
    return true;
  },

  deleteAd(id) {
    db.prepare('DELETE FROM ads WHERE id = ?').run(id);
  },

  addCharity(c) {
    const id = c.id || uid();
    db.prepare(`
      INSERT INTO charities (id, name, person, phone, email, location, type, desc, joined)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, c.name, c.person || '', c.phone || '', c.email || '', c.location || '', c.type || 'Food Bank', c.desc || '', Date.now());
    this.addNotification(`Charity organisation registered: ${c.name}`, 'charity');
    return id;
  },

  addRequest(r) {
    const id = r.id || uid();
    db.prepare(`
      INSERT INTO requests (id, org, food_type, quantity, location, date, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, r.org, r.foodType, parseInt(r.quantity) || 0, r.location || '', r.date || '', Date.now());
    this.addNotification(`Donation request from ${r.org}: ${r.quantity} meals`, 'doc');
    return id;
  },

  addBeneficiary(b) {
    const id = b.id || uid();
    db.prepare(`
      INSERT INTO beneficiaries (id, name, count, location, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, b.name, parseInt(b.count) || 0, b.location || '', Date.now());
    return id;
  },

  addLocation(l) {
    const id = l.id || uid();
    db.prepare('INSERT INTO dist_locations (id, name, area, created_at) VALUES (?, ?, ?, ?)').run(id, l.name, l.area || '', Date.now());
    return id;
  },

  setTheme(theme) {
    db.prepare(`INSERT OR REPLACE INTO settings (key, value) VALUES ('theme', ?)`).run(theme);
  },

  addNotification(text, icon = 'bell') {
    db.prepare('INSERT INTO notifications (id, user_id, text, icon, time, read) VALUES (?, ?, ?, ?, ?, 0)').run(uid(), null, text, icon, Date.now());
  },

  markNotificationsRead() {
    db.prepare('UPDATE notifications SET read = 1').run();
  },

  clearNotifications() {
    db.prepare('DELETE FROM notifications').run();
  }
};

module.exports = dbHelper;
