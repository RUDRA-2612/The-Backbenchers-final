require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// --- SUPABASE INITIALIZATION ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("WARNING: Supabase URL or Anon Key is missing in .env");
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'public-anon-key'
);

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
    const { count: userCount, error: userError } = await supabase.from('users').select('*', { count: 'exact', head: true });
    if (!userError && userCount === 0) {
      console.log('Seeding default user...');
      await supabase.from('users').insert({
        id: uuidv4(),
        name: 'Shaan Singh',
        email: 'shaansingh101206@gmail.com',
        password: 'rudra2612',
        isGoogle: false
      });
      console.log('Default user seeded.');
    }

    const { count: materialCount, error: materialError } = await supabase.from('materials').select('*', { count: 'exact', head: true });
    if (!materialError && materialCount === 0) {
      console.log('Seeding default materials...');
      const dummyUrl = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';
      const materialsToInsert = defaultFiles.map(file => ({
        id: file.id,
        title: file.title,
        subjectCode: file.subjectCode,
        category: file.category,
        subcategory: file.subcategory || null,
        filename: file.filename,
        filepath: dummyUrl,
        isDefault: true
      }));
      await supabase.from('materials').insert(materialsToInsert);
      console.log('Database seeded with defaults.');
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
};

// Seed db on startup
seedDatabase();

// --- MULTER CONFIG (MEMORY STORAGE) ---
const upload = multer({ 
  storage: multer.memoryStorage(),
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf') {
      return cb(new Error('Only PDF uploads are allowed!'));
    }
    cb(null, true);
  }
});

// --- API ROUTES ---

app.get('/api/health', async (req, res) => {
  const { error } = await supabase.from('users').select('id').limit(1);
  res.json({ status: 'ok', db: error ? 'error' : 'connected' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

    const emailLower = email.toLowerCase();
    const { data: existingUser } = await supabase.from('users').select('*').eq('email', emailLower).single();
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const newUser = {
      id: uuidv4(),
      name,
      email: emailLower,
      password,
      isGoogle: false
    };
    
    const { error } = await supabase.from('users').insert(newUser);
    if (error) throw error;

    res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isGoogleLogin, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase();
    const isAdminEmail = emailLower === 'rudrapal2612@gmail.com';

    let { data: user, error: findError } = await supabase.from('users').select('*').eq('email', emailLower).single();

    if (isGoogleLogin) {
      if (!user) {
        user = {
          id: uuidv4(),
          name: name || email.split('@')[0],
          email: emailLower,
          password: 'OAuthMockPassword123',
          isGoogle: true
        };
        const { error: insertError } = await supabase.from('users').insert(user);
        if (insertError) throw insertError;
      }
    } else {
      if (!user) {
        if (isAdminEmail && password === 'rudra@admin') {
          user = {
            id: uuidv4(),
            name: 'Rudra Admin',
            email: emailLower,
            password: 'rudra@admin',
            isGoogle: false
          };
          const { error: insertError } = await supabase.from('users').insert(user);
          if (insertError) throw insertError;
        } else {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      } else if (user.password !== password) {
        if (!(isAdminEmail && password === 'rudra@admin')) {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      }
    }

    // Log login
    await supabase.from('login_logs').insert({
      id: uuidv4(),
      userId: user.id,
      name: user.name,
      email: user.email,
      method: isGoogleLogin ? 'Google OAuth' : (isAdminEmail && password === 'rudra@admin' ? 'Admin Credentials' : 'Email/Password')
    });

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, isAdmin: isAdminEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logins', async (req, res) => {
  try {
    const { data: logs, error } = await supabase.from('login_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/downloads', async (req, res) => {
  try {
    const { data: logs, error } = await supabase.from('download_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('id, name, email, isGoogle, createdAt').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/materials', async (req, res) => {
  try {
    const { data: materials, error } = await supabase.from('materials').select('*').order('uploadedAt', { ascending: false });
    if (error) throw error;
    res.json(materials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/materials/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, subjectCode, category, subcategory } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file' });
    if (!title || !subjectCode || !category) return res.status(400).json({ error: 'Title, subject code, and category are required' });

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'document-' + uniqueSuffix + (ext ? ext : '.pdf');

    // Upload to Supabase Storage Bucket 'materials'
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(filename);
    const fileUrl = publicUrlData.publicUrl;

    const newMaterial = {
      id: uuidv4(),
      title,
      subjectCode,
      category,
      subcategory: subcategory || null,
      filename: req.file.originalname,
      filepath: fileUrl,
      isDefault: false
    };

    const { error: insertError } = await supabase.from('materials').insert(newMaterial);
    if (insertError) throw insertError;

    res.status(201).json({ message: 'Material uploaded successfully', material: newMaterial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/downloads', async (req, res) => {
  try {
    const { name, email, subjectCode, title, filename } = req.body;
    if (!email || !filename) return res.status(400).json({ error: 'Email and filename are required' });

    const log = {
      id: uuidv4(),
      name: name || 'Guest',
      email,
      subjectCode: subjectCode || 'N/A',
      title: title || filename,
      filename
    };
    
    const { error } = await supabase.from('download_logs').insert(log);
    if (error) throw error;

    res.status(201).json({ message: 'Download logged successfully', log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
