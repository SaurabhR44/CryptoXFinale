const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const app = express();
// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {secure: false}
}));

// Serve static files, but not index.html
app.use(express.static(path.join(__dirname), {
  index: false // This prevents serving index.html automatically
}));
mongoose.connect('mongodb://localhost:27017/crypto_dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
  });

// Define User Schema and Model
const userSchema = new mongoose.Schema({
  firstname: String,
  email: {type: String, unique: true},
  password: String,
});

const User = mongoose.model('User', userSchema);


const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};
// Routes
// Default Route (redirect to login if not logged in)
app.get('/', (req, res) => {
  if (req.session.user) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  res.redirect('/login');
});

// Serve Login page
app.get('/login', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'Login.html'));
});

// Handle Login Form Submission
app.post('/login', async (req, res) => {
  const {email, password} = req.body;
  console.log('Login attempt with email:', email);

  try {
    const user = await User.findOne({email});
    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = {email: user.email, firstname: user.firstname};
        return res.json({success: true, redirect: '/'});
      }
    }
    res.status(401).json({success: false, message: 'Invalid email or password'});
  } catch (err) {
    console.error('Error during login:', err);
    res.status(500).json({success: false, message: 'Server error'});
  }
});

// Serve SignUp page
app.get('/signup', (req, res) => {
  if (req.session.user) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'SignUp.html'));
});

// Handle SignUp Form Submission
app.post('/signup', async (req, res) => {
  const {firstname, email, password} = req.body;
  console.log('Signup attempt with email:', email);

  try {
    const existingUser = await User.findOne({email});
    if (existingUser) {
      return res.status(400).json({success: false, message: 'Email already exists'});
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({firstname, email, password: hashedPassword});
    await newUser.save();
    console.log(`User registered: ${firstname}, ${email}`);
    res.json({success: true, message: 'Signup successful', redirect: '/login'});
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({success: false, message: 'Server error'});
  }
});

// Serve Index page only if logged in
app.get('/index.html', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
    }
    res.redirect('/login');
  });
});

// Start the server on port 4000
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});