require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Serve static uploaded files
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DEFAULTS_DIR = path.join(UPLOADS_DIR, 'defaults');
const DB_FILE = path.join(__dirname, 'database.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DEFAULTS_DIR)) fs.mkdirSync(DEFAULTS_DIR, { recursive: true });

app.use('/uploads', express.static(UPLOADS_DIR));

// Helper: Local DB Access
function readDB() {
  if (!fs.existsSync(DB_FILE)) {
    const initialDB = {
      users: [
        { id: "demo-user-1", name: "System Admin", email: process.env.ADMIN_EMAIL || "admin@example.com", password: process.env.ADMIN_PASSWORD || "admin123", isGoogle: false, createdAt: new Date().toISOString() },
        { id: "demo-user-2", name: "Demo Student", email: "student@backbenchers.com", password: "password123", isGoogle: false, createdAt: new Date().toISOString() }
      ],
      loginLogs: [],
      downloadLogs: [],
      materials: [
        { id: "def-py-1", title: "Python Basics Cheat Sheet", subjectCode: "CS1139", category: "notes", subcategory: null, filename: "python_basics.pdf", filepath: "/uploads/defaults/python_basics.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-py-2", title: "PYQ End Term 2025", subjectCode: "CS1139", category: "papers", subcategory: "end-term", filename: "py_endterm_2025.pdf", filepath: "/uploads/defaults/py_endterm_2025.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-eee-1", title: "EEE Mid Term 1 Solved Paper", subjectCode: "EE1118", category: "papers", subcategory: "mid-term-1", filename: "eee_mid1_2025.pdf", filepath: "/uploads/defaults/eee_mid1_2025.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-calc-1", title: "Calculus Complete Formula Sheet", subjectCode: "AS1109", category: "formulas", subcategory: null, filename: "calculus_formulas.pdf", filepath: "/uploads/defaults/calculus_formulas.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-phys-1", title: "Applied Physics Wave Optics Notes", subjectCode: "AS1108", category: "notes", subcategory: null, filename: "physics_optics.pdf", filepath: "/uploads/defaults/physics_optics.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-evs-1", title: "Environmental Science Important Topics", subjectCode: "ES1115", category: "topics", subcategory: null, filename: "evs_imp_topics.pdf", filepath: "/uploads/defaults/evs_imp_topics.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-fc-1", title: "Fundamentals of Comm. Mid Term 2 Solved", subjectCode: "CC1101", category: "papers", subcategory: "mid-term-2", filename: "fc_mid2_solved.pdf", filepath: "/uploads/defaults/fc_mid2_solved.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-py-q", title: "Python Top 20 Most Repeated Exam Questions", subjectCode: "CS1139", category: "questions", subcategory: null, filename: "python_basics.pdf", filepath: "/uploads/defaults/python_basics.pdf", isDefault: true, uploadedAt: new Date().toISOString() },
        { id: "def-eee-q", title: "EEE Expected Mid & End Term Questions", subjectCode: "EE1118", category: "questions", subcategory: null, filename: "eee_mid1_2025.pdf", filepath: "/uploads/defaults/eee_mid1_2025.pdf", isDefault: true, uploadedAt: new Date().toISOString() }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (err) {
    return { users: [], loginLogs: [], downloadLogs: [], materials: [] };
  }
}

function writeDB(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}

// --- SUPABASE INITIALIZATION ---
const isSupabaseConfigured = () => {
  return process.env.SUPABASE_URL && 
         !process.env.SUPABASE_URL.includes('xyzcompany.supabase.co') && 
         (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);
};

let supabase = null;
if (isSupabaseConfigured()) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
  );
} else {
  console.log("ℹ️  Using local database.json (Supabase credentials not configured)");
}

// --- MULTER CONFIG ---
const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'document-' + uniqueSuffix + (ext ? ext : '.pdf'));
  }
});

const upload = multer({ 
  storage: isSupabaseConfigured() ? multer.memoryStorage() : diskStorage,
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('users').select('id').limit(1);
      return res.json({ status: 'ok', db: error ? 'error' : 'connected (supabase)' });
    } catch (e) {
      return res.json({ status: 'ok', db: 'local (fallback)' });
    }
  }
  res.json({ status: 'ok', db: 'local (database.json)' });
});

// Auth: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });
    const emailLower = email.toLowerCase();

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: existingUser } = await supabase.from('users').select('*').eq('email', emailLower).single();
        if (existingUser) return res.status(400).json({ error: 'Email already registered' });

        const newUser = { id: uuidv4(), name, email: emailLower, password, isGoogle: false };
        const { error } = await supabase.from('users').insert(newUser);
        if (error) throw error;
        return res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
      } catch (err) {
        console.warn("Supabase error, falling back to local DB:", err.message);
      }
    }

    // Local DB Fallback
    const dbData = readDB();
    if (dbData.users.some(u => u.email.toLowerCase() === emailLower)) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    const newUser = { id: uuidv4(), name, email: emailLower, password, isGoogle: false, createdAt: new Date().toISOString() };
    dbData.users.push(newUser);
    writeDB(dbData);

    res.status(201).json({ message: 'Registration successful', user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Auth: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, isGoogleLogin, name } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.toLowerCase();
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').toLowerCase();
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const isAdminEmail = emailLower === adminEmail;

    if (isSupabaseConfigured() && supabase) {
      try {
        let { data: user } = await supabase.from('users').select('*').eq('email', emailLower).single();
        if (isGoogleLogin) {
          if (!user) {
            user = { id: uuidv4(), name: name || email.split('@')[0], email: emailLower, password: 'OAuthMockPassword123', isGoogle: true };
            await supabase.from('users').insert(user);
          }
        } else {
          if (!user) {
            if (isAdminEmail && password === adminPassword) {
              user = { id: uuidv4(), name: 'System Admin', email: emailLower, password: adminPassword, isGoogle: false };
              await supabase.from('users').insert(user);
            } else {
              return res.status(401).json({ error: 'Invalid email or password' });
            }
          } else if (user.password !== password && !(isAdminEmail && password === adminPassword)) {
            return res.status(401).json({ error: 'Invalid email or password' });
          }
        }

        await supabase.from('login_logs').insert({
          id: uuidv4(),
          userId: user.id,
          name: user.name,
          email: user.email,
          method: isGoogleLogin ? 'Google OAuth' : (isAdminEmail && password === adminPassword ? 'Admin Credentials' : 'Email/Password')
        });

        return res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, isAdmin: isAdminEmail } });
      } catch (err) {
        console.warn("Supabase error, falling back to local DB:", err.message);
      }
    }

    // Local DB Fallback
    const dbData = readDB();
    let user = dbData.users.find(u => u.email.toLowerCase() === emailLower);

    if (isGoogleLogin) {
      if (!user) {
        user = { id: uuidv4(), name: name || email.split('@')[0], email: emailLower, password: 'OAuthMockPassword123', isGoogle: true, createdAt: new Date().toISOString() };
        dbData.users.push(user);
      }
    } else {
      if (!user) {
        if (isAdminEmail && password === adminPassword) {
          user = { id: uuidv4(), name: 'System Admin', email: emailLower, password: adminPassword, isGoogle: false, createdAt: new Date().toISOString() };
          dbData.users.push(user);
        } else {
          return res.status(401).json({ error: 'Invalid email or password' });
        }
      } else if (user.password !== password && !(isAdminEmail && password === adminPassword)) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    const loginLog = {
      id: uuidv4(),
      userId: user.id,
      name: user.name,
      email: user.email,
      timestamp: new Date().toISOString(),
      method: isGoogleLogin ? 'Google OAuth' : (isAdminEmail && password === adminPassword ? 'Admin Credentials' : 'Email/Password')
    };
    dbData.loginLogs = dbData.loginLogs || [];
    dbData.loginLogs.unshift(loginLog);
    writeDB(dbData);

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, isAdmin: isAdminEmail } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin: Logins Audit
app.get('/api/admin/logins', async (req, res) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: logs } = await supabase.from('login_logs').select('*').order('timestamp', { ascending: false });
      if (logs) return res.json(logs);
    } catch (err) {
      console.warn("Supabase error:", err.message);
    }
  }
  const dbData = readDB();
  res.json(dbData.loginLogs || []);
});

// Admin: Downloads Audit
app.get('/api/admin/downloads', async (req, res) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: logs } = await supabase.from('download_logs').select('*').order('timestamp', { ascending: false });
      if (logs) return res.json(logs);
    } catch (err) {
      console.warn("Supabase error:", err.message);
    }
  }
  const dbData = readDB();
  res.json(dbData.downloadLogs || []);
});

// Admin: Users List
app.get('/api/admin/users', async (req, res) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: users } = await supabase.from('users').select('id, name, email, isGoogle, createdAt').order('createdAt', { ascending: false });
      if (users) return res.json(users);
    } catch (err) {
      console.warn("Supabase error:", err.message);
    }
  }
  const dbData = readDB();
  res.json(dbData.users.map(u => ({ id: u.id, name: u.name, email: u.email, isGoogle: !!u.isGoogle, createdAt: u.createdAt })));
});

// Materials: Get List
app.get('/api/materials', async (req, res) => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: materials } = await supabase.from('materials').select('*').order('uploadedAt', { ascending: false });
      if (materials && materials.length > 0) return res.json(materials);
    } catch (err) {
      console.warn("Supabase error:", err.message);
    }
  }
  const dbData = readDB();
  res.json(dbData.materials || []);
});

// Materials: Upload PDF
app.post('/api/materials/upload', upload.single('file'), async (req, res) => {
  try {
    const { title, subjectCode, category, subcategory, year } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file' });
    if (!title || !subjectCode || !category) return res.status(400).json({ error: 'Title, subject code, and category are required' });

    if (isSupabaseConfigured() && supabase) {
      try {
        const ext = path.extname(req.file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'document-' + uniqueSuffix + (ext ? ext : '.pdf');

        const { error: uploadError } = await supabase.storage.from('materials').upload(filename, req.file.buffer, { contentType: req.file.mimetype });
        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(filename);
          const newMaterial = {
            id: uuidv4(), title, subjectCode, category, subcategory: subcategory || null, year: year || null,
            filename: req.file.originalname, filepath: publicUrlData.publicUrl, isDefault: false
          };
          await supabase.from('materials').insert(newMaterial);
          return res.status(201).json({ message: 'Material uploaded successfully', material: newMaterial });
        }
      } catch (err) {
        console.warn("Supabase upload error, falling back to local file storage:", err.message);
      }
    }

    // Local Storage Fallback
    const dbData = readDB();
    const newMaterial = {
      id: uuidv4(),
      title,
      subjectCode,
      category,
      subcategory: subcategory || null,
      year: year || null,
      filename: req.file.originalname,
      filepath: `/uploads/${req.file.filename}`,
      isDefault: false,
      uploadedAt: new Date().toISOString()
    };
    dbData.materials.push(newMaterial);
    writeDB(dbData);

    res.status(201).json({ message: 'Material uploaded successfully', material: newMaterial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Materials: Delete PDF
app.delete('/api/materials/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: material } = await supabase.from('materials').select('filepath').eq('id', id).single();
        if (material && material.filepath) {
          const filename = material.filepath.split('/').pop().split('?')[0];
          await supabase.storage.from('materials').remove([filename]).catch(() => {});
        }
        await supabase.from('materials').delete().eq('id', id);
        return res.json({ message: 'Material deleted successfully' });
      } catch (err) {
        console.warn("Supabase delete error:", err.message);
      }
    }

    // Local Fallback
    const dbData = readDB();
    const index = dbData.materials.findIndex(m => m.id === id);
    if (index !== -1) {
      const mat = dbData.materials[index];
      if (!mat.isDefault && mat.filepath) {
        const fullPath = path.join(__dirname, mat.filepath);
        if (fs.existsSync(fullPath)) {
          try { fs.unlinkSync(fullPath); } catch (e) {}
        }
      }
      dbData.materials.splice(index, 1);
      writeDB(dbData);
    }
    res.json({ message: 'Material deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Downloads: Log Event
app.post('/api/downloads', async (req, res) => {
  try {
    const { name, email, subjectCode, title, filename } = req.body;
    if (!email || !filename) return res.status(400).json({ error: 'Email and filename are required' });

    const log = { id: uuidv4(), name: name || 'Guest', email, subjectCode: subjectCode || 'N/A', title: title || filename, filename, timestamp: new Date().toISOString() };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('download_logs').insert(log);
        return res.status(201).json({ message: 'Download logged successfully', log });
      } catch (err) {
        console.warn("Supabase download log error:", err.message);
      }
    }

    const dbData = readDB();
    dbData.downloadLogs = dbData.downloadLogs || [];
    dbData.downloadLogs.unshift(log);
    writeDB(dbData);

    res.status(201).json({ message: 'Download logged successfully', log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Requests: Get List (sorted by highest net votes)
app.get('/api/requests', async (req, res) => {
  const dbData = readDB();
  const sorted = (dbData.requests || []).slice().sort((a, b) => {
    const scoreA = (a.votes?.yes || 0) - (a.votes?.no || 0);
    const scoreB = (b.votes?.yes || 0) - (b.votes?.no || 0);
    return scoreB - scoreA;
  });
  res.json(sorted);
});

// Requests: Submit New Student Request
app.post('/api/requests', async (req, res) => {
  try {
    const { title, subjectCode, category, requestedBy } = req.body;
    if (!title || !subjectCode) {
      return res.status(400).json({ error: 'Title and subject code are required' });
    }

    const dbData = readDB();
    dbData.requests = dbData.requests || [];
    const newRequest = {
      id: uuidv4(),
      title,
      subjectCode,
      category: category || 'notes',
      requestedBy: requestedBy || 'Anonymous Student',
      status: 'open',
      votes: { yes: 1, no: 0 },
      votedUsers: requestedBy ? { [requestedBy]: 'yes' } : {},
      requestedAt: new Date().toISOString()
    };

    dbData.requests.unshift(newRequest);
    writeDB(dbData);

    res.status(201).json({ message: 'Request submitted successfully', request: newRequest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Requests: Vote on a Request (Yes / No Poll)
app.post('/api/requests/:id/vote', async (req, res) => {
  try {
    const { id } = req.params;
    const { voteType, userIdentifier } = req.body; // voteType: 'yes' | 'no'
    if (!['yes', 'no'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type' });
    }

    const dbData = readDB();
    const request = (dbData.requests || []).find(r => r.id === id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (!request.votes) request.votes = { yes: 0, no: 0 };
    if (!request.votedUsers) request.votedUsers = {};

    const userId = userIdentifier || 'guest';
    const previousVote = request.votedUsers[userId];

    if (previousVote === voteType) {
      // Toggle off / remove vote if clicking same button again
      request.votes[voteType] = Math.max(0, (request.votes[voteType] || 0) - 1);
      delete request.votedUsers[userId];
    } else {
      if (previousVote) {
        // Decrease previous vote count
        request.votes[previousVote] = Math.max(0, (request.votes[previousVote] || 0) - 1);
      }
      // Increase new vote count
      request.votes[voteType] = (request.votes[voteType] || 0) + 1;
      request.votedUsers[userId] = voteType;
    }

    // Re-sort all requests by net score
    dbData.requests.sort((a, b) => {
      const scoreA = (a.votes?.yes || 0) - (a.votes?.no || 0);
      const scoreB = (b.votes?.yes || 0) - (b.votes?.no || 0);
      return scoreB - scoreA;
    });

    writeDB(dbData);
    res.json({ message: 'Vote recorded', request, allRequests: dbData.requests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Requests: Delete / Fulfill Request
app.delete('/api/requests/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const dbData = readDB();
    dbData.requests = (dbData.requests || []).filter(r => r.id !== id);
    writeDB(dbData);
    res.json({ message: 'Request removed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
