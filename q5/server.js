const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const Student = require('./models/Student');
const app = express();
const PORT = 3000;
const SECRET = 'your_jwt_secret'; // Change to a strong secret

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/jwtcrud')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Serve HTML pages
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/students', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'students.html'));
});

// Mock user for authentication
const users = { user1: bcrypt.hashSync('password1', 8) };

// Login route
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (users[username] && bcrypt.compareSync(password, users[username])) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  res.status(401).json({ message: 'Invalid credentials' });
});

// Middleware to verify JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization'];
  if (!token) return res.sendStatus(403);

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.username = decoded.username;
    next();
  });
}

// CRUD operations for students
app.get('/students', verifyToken, async (req, res) => {
  const students = await Student.find();
  res.json(students);
});

app.post('/students', verifyToken, async (req, res) => {
  const newStudent = new Student(req.body);
  await newStudent.save();
  res.status(201).json(newStudent);
});

app.delete('/students/:id', verifyToken, async (req, res) => {
  await Student.findByIdAndRemove(req.params.id);
  res.sendStatus(204);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
