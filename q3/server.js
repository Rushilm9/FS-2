const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session); // Correct usage
const redis = require('redis');
const path = require('path');

const app = express();

// Create Redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Set up session
app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: 'your_secret_key', // Change this to a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// User data for demonstration
const users = {
  user1: 'password1',
  user2: 'password2'
};

// Routes
app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username] && users[username] === password) {
    req.session.username = username;
    return res.redirect('/dashboard');
  }

  res.render('login', { error: 'Invalid username or password' });
});

app.get('/dashboard', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.render('dashboard', { username: req.session.username });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});


