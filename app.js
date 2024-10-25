// server.js

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/userUploads');

// Define a User model
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  files: [String],
});

const User = mongoose.model('User', userSchema);

// Set up file storage using multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// Set view engine to EJS
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Home route to render registration form
app.get('/', (req, res) => {
  res.render('index');
});

// Handle user registration
app.post('/register', upload.array('files', 5), async (req, res) => {
  try {
    const { name, email } = req.body;
    const files = req.files.map(file => file.filename);

    const newUser = new User({ name, email, files });
    await newUser.save();

    res.redirect('/files');
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// List all uploaded files
app.get('/files', async (req, res) => {
  try {
    const users = await User.find();
    res.render('file-list', { users });
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Download a file
app.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, 'uploads', req.params.filename);
  res.download(file, err => {
    if (err) {
      res.status(404).send('File not found');
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
