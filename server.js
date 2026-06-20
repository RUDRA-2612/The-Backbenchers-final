require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- MONGODB CONNECTION ---
if (!process.env.MONGODB_URI) {
  console.warn("WARNING: MONGODB_URI is missing in .env");
}

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/backbenchers')
  .then(() => {
    console.log('Connected to MongoDB');
    seedDatabase();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// --- MONGODB SCHEMAS & MODELS ---
const userSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  password: { type: String, required: false },
  isGoogle: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

const loginLogSchema = new mongoose.Schema({
  id: String,
  userId: String,
  name: String,
  email: String,
  method: String,
  timestamp: { type: Date, default: Date.now }
});
const LoginLog = mongoose.model('LoginLog', loginLogSchema);

const downloadLogSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: String,
  subjectCode: String,
  title: String,
  filename: String,
  timestamp: { type: Date, default: Date.now }
});
const DownloadLog = mongoose.model('DownloadLog', downloadLogSchema);

const materialSchema = new mongoose.Schema({
  id: String,
  title: String,
  subjectCode: String,
  category: String,
  subcategory: String,
  filename: String,
  filepath: String, // This will now be the Cloudinary URL
  isDefault: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now }
});
const Material = mongoose.model('Material', materialSchema);

// --- SEED DEFAULTS ---
const defaultFiles = [
  { id: 'def-py-1', title: 'Python Basics Cheat Sheet', subjectCode: 'CS1139', category: 'notes', filename: 'python_basics.pdf' },
  { id: 'def-py-2', title: 'PYQ End Term 2025', subjectCode: 'CS1139', category: 'papers', subcategory: 'end-term', filename: 'py_endterm_2025.pdf' },
  { id: 'def-eee-1', title: 'EEE Mid Term 1 Solved Paper', subjectCode: 'EE1118', category: 'papers', subcategory: 'mid-term-1', filename: 'eee_mid1_2025.pdf' },
  { id: 'def-calc-1', title: 'Calculus Complete Formula Sheet', subjectCode: 'AS1109', category: 'formulas', filename: 'calculus_formulas.pdf' },
  { id: 'def-phys-1', title: 'Applied Physics Wave Optics Notes', subjectCode: 'AS1108', category: 'notes', filename: 'physics_optics.pdf' },
  { id: 'def-evs-1', title: 'Environmental Science Important Topics', subjectCode: 'ES1115', category: 'topics', filename: 'evs_imp_topics.pdf' },
  { id: 'def-fc-1', title: 'Fundamentals of Comm. Mid Term 2 Solved', subjectCode: 'CC1101', category: 'papers', subcategory: 'mid-term-2', filename: 'fc_mid2_solved.pdf' }
];

const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Seeding default user...');
      const defaultUser = new User({
        id: uuidv4(),
        name: 'Shaan Singh',
        email: 'shaansingh101206@gmail.com',
        password: 'rudra2612',
        isGoogle: false
      });
      await defaultUser.save();
      console.log('Default user seeded.');
    }

    const count = await Material.countDocuments();
    if (count === 0) {
      console.log('Seeding default materials...');
      const dummyUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      for (const file of defaultFiles) {
        await new Material({
          id: file.id,
          title: file.title,
          subjectCode: file.subjectCode,
          category: file.category,
          subcategory: file.subcategory || null,
          filename: file.filename,
          filepath: dummyUrl,
          isDefault: true
        }).save();
      }
      console.log('Database seeded with defaults.');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
};

// --- CLOUDINARY CONFIG ---
if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'backbenchers/materials',
    allowed_formats: ['pdf'],
    resource_type: 'raw' // Required for PDFs
  }
});

const upload = multer({ storage: storage });

// --- API ROUTES ---

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const newUser = new User({
      id: uuidv4(),
      name,
      email: email.toLowerCase(),
      password
    });
    await newUser.save();

    res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isGoogleLogin, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    let user = await User.findOne({ email: email.toLowerCase() });

    if (isGoogleLogin) {
      if (!user) {
        user = new User({
          id: uuidv4(),
          name: name || email.split('@')[0],
          email: email.toLowerCase(),
          password: 'OAuthMockPassword123',
          isGoogle: true
        });
        await user.save();
      }
    } else {
      if (!user || user.password !== password) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const loginLog = new LoginLog({
      id: uuidv4(),
      userId: user.id,
      name: user.name,
      email: user.email,
      method: isGoogleLogin ? 'Google OAuth' : 'Email/Password'
    });
    await loginLog.save();

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logins', async (req, res) => {
  try {
    const logs = await LoginLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/downloads', async (req, res) => {
  try {
    const logs = await DownloadLog.find().sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/materials', async (req, res) => {
  try {
    const materials = await Material.find().sort({ uploadedAt: -1 });
    res.json(materials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/materials/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, subjectCode, category, subcategory } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file' });
    if (!title || !subjectCode || !category) return res.status(400).json({ error: 'Title, subject code, and category are required' });

    // With multer-storage-cloudinary, req.file.path contains the uploaded Cloudinary URL
    const fileUrl = req.file.path;
    const filename = req.file.filename || req.file.originalname;

    const newMaterial = new Material({
      id: uuidv4(),
      title,
      subjectCode,
      category,
      subcategory: subcategory || null,
      filename: filename,
      filepath: fileUrl // Storing the Absolute Cloudinary URL
    });

    await newMaterial.save();
    res.status(201).json({ message: 'Material uploaded successfully', material: newMaterial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/downloads', async (req, res) => {
  try {
    const { name, email, subjectCode, title, filename } = req.body;
    if (!email || !filename) return res.status(400).json({ error: 'Email and filename are required' });

    const log = new DownloadLog({
      id: uuidv4(),
      name: name || 'Guest',
      email,
      subjectCode: subjectCode || 'N/A',
      title: title || filename,
      filename
    });
    await log.save();

    res.status(201).json({ message: 'Download logged successfully', log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

module.exports = app;
