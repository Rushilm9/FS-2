// server.js

const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const path = require('path');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Set up session
app.use(session({
  store: new FileStore(),
  secret: 'your_secret_key', // Change this to a strong secret
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Simple user data for demonstration
const users = {
  user1: 'password1',
  user2: 'password2'
};

// Home route
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Login route
app.get('/login', (req, res) => {
  res.render('login', { error: null }); // Initialize error as null
});

// Handle login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  
  if (users[username] && users[username] === password) {
    req.session.username = username; // Store username in session
    return res.redirect('/dashboard');
  }

  // Pass the error variable to the login view if authentication fails
  res.render('login', { error: 'Invalid username or password' });
});

// Dashboard route (protected)
app.get('/dashboard', (req, res) => {
  if (!req.session.username) {
    return res.redirect('/login');
  }
  res.render('dashboard', { username: req.session.username });
});

// Logout route
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/dashboard');
    }
    res.redirect('/login');
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
