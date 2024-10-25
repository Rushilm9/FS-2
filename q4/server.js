// server.js

const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const Student = require('./models/Student');
const path = require('path');

const app = express();
const PORT = 3000;
const SECRET = 'your_jwt_secret'; // Change to a strong secret

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jwtcrud')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Mock user for authentication
const users = { user1: bcrypt.hashSync('password1', 8) };

// Login route
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username] && bcrypt.compareSync(password, users[username])) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    return res.redirect('/students?token=' + token);
  }

  res.render('login', { error: 'Invalid credentials' });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.query.token;
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.username = decoded.username;
    next();
  });
}

// CRUD routes for students
app.get('/students', verifyToken, async (req, res) => {
  const students = await Student.find();
  res.render('students', { students, token: req.query.token });
});

app.post('/students', verifyToken, async (req, res) => {
  const newStudent = new Student(req.body);
  await newStudent.save();
  res.redirect('/students?token=' + req.query.token);
});

app.post('/students/delete/:id', verifyToken, async (req, res) => {
  await Student.findByIdAndRemove(req.params.id);
  res.redirect('/students?token=' + req.query.token);
});

// Logout route
app.post('/logout', (req, res) => {
  res.redirect('/login');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
