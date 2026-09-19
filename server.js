require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Set a global version for this server deployment
const SERVER_VERSION = Date.now();

app.use(cors());
app.use(express.json());

// Reports are now stored in Supabase 'reports' table

// --- SUPABASE INITIALIZATION ---
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.warn("WARNING: Supabase URL or Anon Key is missing in .env");
}

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'public-anon-key'
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

const adminEmails = [
  'rudrapalsinghshekhawat@jklu.edu.in',
  'amanjhajharia@jklu.edu.in',
  'aahan@jklu.edu.in',
  'raghurajsinghshekhawat@jklu.edu.in'
];

const verifyAdmin = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];
    const userId = req.headers['x-user-id'];
    
    if (!email || !userId) return res.status(401).json({ error: 'Unauthorized: Missing credentials' });
    const emailLower = email.trim().toLowerCase();
    
    if (!adminEmails.includes(emailLower)) {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    
    // Admins bypass single-device session checks. We authenticate them via their private UUID.
    const { data: adminUser } = await supabase.from('users').select('id').eq('email', emailLower).single();
    if (!adminUser || adminUser.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during auth' });
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const email = req.headers['x-user-email'];
    const sessionId = req.headers['x-session-id'];
    const userId = req.headers['x-user-id'];

    if (!email) return res.status(401).json({ error: 'Unauthorized: Missing email' });
    const emailLower = email.trim().toLowerCase();
    req.verifiedEmail = emailLower;

    if (adminEmails.includes(emailLower)) {
      if (!userId) return res.status(401).json({ error: 'Unauthorized: Missing admin credentials' });
      const { data: adminUser } = await supabase.from('users').select('id').eq('email', emailLower).single();
      if (!adminUser || adminUser.id !== userId) return res.status(401).json({ error: 'Unauthorized: Invalid admin credentials' });
      return next();
    }

    if (!sessionId) return res.status(401).json({ error: 'Unauthorized: Missing session' });
    const { data: activeSession } = await supabase.from('active_sessions').select('session_id').eq('email', emailLower).single();
    if (!activeSession || activeSession.session_id !== sessionId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid session' });
    }

    next();
  } catch (err) {
    res.status(500).json({ error: 'Internal server error during user auth' });
  }
};

// --- API ROUTES ---

app.get('/api/health', async (req, res) => {
  const { error } = await supabase.from('users').select('id').limit(1);
  res.json({ status: 'ok', db: error ? 'error' : 'connected' });
});

app.get('/api/version', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.json({ version: SERVER_VERSION });
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
    const { email, password, provider, isGoogleLogin, name, microsoftAccountId } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.trim().toLowerCase();
    
    if (!emailLower.endsWith('@jklu.edu.in')) {
      return res.status(403).json({ error: 'Access restricted. Please use your @jklu.edu.in email address.' });
    }

    const isAdminEmail = adminEmails.includes(emailLower);
    const isSuperAdmin = emailLower === 'rudrapalsinghshekhawat@jklu.edu.in';

    // Check if user is blocked (Only Super Admin bypasses this restriction)
    if (!isSuperAdmin) {
      const { data: blockedUser } = await supabase.from('blocked_emails').select('id').eq('email', emailLower).single();
      if (blockedUser) {
        const silentBlockEmails = [
          'keshavsinghshekhawat@jklu.edu.in',
          'shouryaveerbishnoi@jklu.edu.in',
          'amankumawat@jklu.edu.in',
          'omeshnaraniya@jklu.edu.in'
        ];
        if (silentBlockEmails.includes(emailLower)) {
          return res.status(403).json({ error: "Something went wrong .." });
        }
        return res.status(403).json({ error: "Something went wrong! 🚫\nPlease contact Rudrapal Singh Shekhawat to resolve this issue." });
      }
    }

    let { data: user, error: findError } = await supabase.from('users').select('*').eq('email', emailLower).single();

    if (provider === 'Microsoft' || isGoogleLogin) {
      if (!user) {
        user = {
          id: uuidv4(),
          name: name || email.split('@')[0],
          email: emailLower,
          password: 'OAuthMockPassword123',
          isGoogle: true // isGoogle is used in DB to represent any OAuth user to disable password changes
        };
        // If we wanted to store microsoftAccountId, we'd add it here after adding the column to Supabase
        const { error: insertError } = await supabase.from('users').insert(user);
        if (insertError) throw insertError;
      } else if (name && user.name !== name) {
        // Update user's name in case they changed it in Microsoft Entra ID
        await supabase.from('users').update({ name: name }).eq('id', user.id);
        user.name = name;
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
      method: provider ? `${provider} OAuth` : (isGoogleLogin ? 'Google OAuth' : 'Email/Password')
    });

    // Create session for Single Device Login
    const sessionId = uuidv4();
    await supabase.from('active_sessions').upsert({
      email: emailLower,
      session_id: sessionId
    }, { onConflict: 'email' });

    res.json({ message: 'Login successful', user: { id: user.id, name: user.name, email: user.email, isAdmin: isAdminEmail, sessionId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { email, oldPassword, newPassword } = req.body;
    if (!email || !oldPassword || !newPassword) return res.status(400).json({ error: 'All fields are required' });

    const emailLower = email.toLowerCase();
    
    const { data: user, error: findError } = await supabase.from('users').select('*').eq('email', emailLower).single();
    if (findError || !user) return res.status(404).json({ error: 'User not found' });
    
    if (user.isGoogle) return res.status(400).json({ error: 'Cannot change password for Google logged-in accounts' });
    if (user.password !== oldPassword) return res.status(401).json({ error: 'Incorrect old password' });

    const { error: updateError } = await supabase.from('users').update({ password: newPassword }).eq('id', user.id);
    if (updateError) throw updateError;

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logins', verifyAdmin, async (req, res) => {
  try {
    const { data: logs, error } = await supabase.from('login_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/downloads', verifyAdmin, async (req, res) => {
  try {
    const { data: logs, error } = await supabase.from('download_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(logs);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('id, name, email, isGoogle, createdAt').order('createdAt', { ascending: false });
    if (error) throw error;
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/blocked-emails', verifyAdmin, async (req, res) => {
  try {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    const { data, error } = await supabase.from('blocked_emails').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/user-activities', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('user_activity').select('*');
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/block-email', verifyAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailLower = email.trim().toLowerCase();
    
    if (emailLower === 'rudrapalsinghshekhawat@jklu.edu.in') {
      return res.status(403).json({ error: 'Super Admin cannot be blocked!' });
    }
    
    // Check if already blocked
    const { data: existing } = await supabase.from('blocked_emails').select('*').eq('email', emailLower).single();
    if (existing) return res.status(400).json({ error: 'Email is already blocked' });

    const { error } = await supabase.from('blocked_emails').insert({ email: emailLower });
    if (error) throw error;
    res.json({ message: 'Email blocked successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/unblock-email', verifyAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailLower = email.trim().toLowerCase();

    // Use ilike and select() to handle any accidental spaces in the database, and verify deletion
    const { data, error } = await supabase.from('blocked_emails').delete().ilike('email', `%${emailLower}%`).select();
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Email not found in blocked list (it might have been deleted already or never blocked).' });
    }
    
    res.json({ message: 'Email unblocked successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/reports', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('reports').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/reports/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('reports').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Report deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/user/status/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { sessionId } = req.query;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailLower = email.trim().toLowerCase();
    
    const { data: blockedUser, error } = await supabase.from('blocked_emails').select('id').eq('email', emailLower).single();
    
    // PGRST116 means zero rows returned from .single(), which means they are not blocked.
    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    let isSessionValid = true;
    if (sessionId) {
      const { data: activeSession } = await supabase.from('active_sessions').select('session_id').eq('email', emailLower).single();
      if (activeSession && activeSession.session_id !== sessionId) {
        isSessionValid = false;
      }
    }
    
    const isAdmin = adminEmails.includes(emailLower);
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.json({ isBlocked: !!blockedUser, isSessionValid, isAdmin });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/reports', verifyAdmin, async (req, res) => {
  try {
    const { data: reports, error } = await supabase.from('reports').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/materials', async (req, res) => {
  try {
    const { data: materials, error } = await supabase.from('materials').select('*').order('uploadedAt', { ascending: false });
    if (error) throw error;
    res.json(materials);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/materials/signed-url', verifyAdmin, async (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });
    
    // Generate unique filename
    const ext = path.extname(filename);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const uniqueFilename = 'document-' + uniqueSuffix + (ext ? ext : '.pdf');

    const { data, error } = await supabase.storage.from('materials').createSignedUploadUrl(uniqueFilename);
    if (error) throw error;
    
    // Also return the public URL so frontend knows what to save
    const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(uniqueFilename);
    
    res.json({ ...data, publicUrl: publicUrlData.publicUrl, uniqueFilename });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/materials/record', verifyAdmin, async (req, res) => {
  try {
    const { title, subjectCode, category, subcategory, year, filename, filepath } = req.body;
    if (!title || !subjectCode || !category || !filepath) return res.status(400).json({ error: 'Missing required fields' });

    const newMaterial = {
      id: uuidv4(),
      title,
      subjectCode,
      category,
      subcategory: subcategory || null,
      year: year || null,
      filename,
      filepath,
      isDefault: false
    };

    const { error: insertError } = await supabase.from('materials').insert(newMaterial);
    if (insertError) throw insertError;

    res.status(201).json({ message: 'Material uploaded successfully', material: newMaterial });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/materials/upload', verifyAdmin, upload.single('file'), async (req, res) => {
  // Keeping this for backward compatibility if needed
  try {
    const { title, subjectCode, category, subcategory, year } = req.body;
    if (!req.file) return res.status(400).json({ error: 'Please upload a PDF file' });
    if (!title || !subjectCode || !category) return res.status(400).json({ error: 'Title, subject code, and category are required' });

    const ext = path.extname(req.file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = 'document-' + uniqueSuffix + (ext ? ext : '.pdf');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('materials')
      .upload(filename, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage.from('materials').getPublicUrl(filename);
    const fileUrl = publicUrlData.publicUrl;

    const newMaterial = {
      id: uuidv4(),
      title,
      subjectCode,
      category,
      subcategory: subcategory || null,
      year: year || null,
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

app.delete('/api/materials/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get the material to find the filepath
    const { data: material, error: fetchError } = await supabase.from('materials').select('filepath').eq('id', id).single();
    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
    
    // 2. Extract filename from public URL and delete from storage
    if (material && material.filepath) {
      const filename = material.filepath.split('/').pop();
      const cleanFilename = filename.split('?')[0]; // Remove query params if any
      await supabase.storage.from('materials').remove([cleanFilename]).catch(e => console.error("Storage cleanup error:", e));
    }
    
    // 3. Delete from database
    const { error } = await supabase.from('materials').delete().eq('id', id);
    if (error) throw error;
    
    res.json({ message: 'Material and file deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/materials/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { filename, filepath, title } = req.body;
    if (!filename && !filepath && !title) return res.status(400).json({ error: 'No fields to update' });

    // 1. Get the old material to find the old filepath
    const { data: oldMaterial } = await supabase.from('materials').select('filepath').eq('id', id).single();
    
    // 2. Delete the old file from storage to prevent orphans (if filepath is being updated)
    if (filepath && oldMaterial && oldMaterial.filepath && oldMaterial.filepath !== filepath) {
      const oldFilename = oldMaterial.filepath.split('/').pop().split('?')[0];
      await supabase.storage.from('materials').remove([oldFilename]).catch(e => console.error("Storage cleanup error:", e));
    }

    const updateData = {};
    if (filename) updateData.filename = filename;
    if (filepath) updateData.filepath = filepath;
    if (title) updateData.title = title;

    const { data, error } = await supabase.from('materials').update(updateData).eq('id', id).select();
    if (error) throw error;

    res.json({ message: 'Material file updated successfully', material: data[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/downloads', verifyUser, async (req, res) => {
  try {
    const { name, subjectCode, title, filename } = req.body;
    if (!filename) return res.status(400).json({ error: 'Filename is required' });

    const log = {
      id: uuidv4(),
      name: name || 'Guest',
      email: req.verifiedEmail,
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

app.post('/api/report', verifyUser, async (req, res) => {
  try {
    const { materialId, title, description, userName } = req.body;
    const userEmail = req.verifiedEmail;
    console.log(`\n=== NEW REPORT RECEIVED ===`);
    console.log(`Material: ${title} (${materialId})`);
    console.log(`From: ${userName || 'Unknown'} (${userEmail})`);
    console.log(`Issue: ${description}`);
    console.log(`===========================\n`);
    
    // Store report in Supabase
    const newReport = {
      id: uuidv4(),
      materialId,
      title,
      description,
      userEmail,
      userName,
      timestamp: new Date().toISOString()
    };
    
    const { error } = await supabase.from('reports').insert(newReport);
    if (error) throw error;
    
    res.status(200).json({ success: true, message: 'Report received successfully', report: newReport });
  } catch (err) {
    console.error('Error saving report:', err);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

app.get('/api/user/activity/:email', verifyUser, async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    if (email.toLowerCase() !== req.verifiedEmail) {
      return res.status(403).json({ error: 'Forbidden: Cannot access other users activity' });
    }

    const { data, error } = await supabase.from('user_activity').select('*').eq('email', req.verifiedEmail).single();
    
    // If no data exists yet for this user, just return empty arrays
    if (error && error.code === 'PGRST116') {
      return res.json({ savedFiles: [], downloadedFiles: [], lastOpenedFile: null });
    }
    
    if (error) throw error;
    
    res.json({
      savedFiles: data.saved_files || [],
      downloadedFiles: data.downloaded_files || [],
      lastOpenedFile: data.last_opened_file || null
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/activity-logs', verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('activity_logs').select('*').order('timestamp', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/activity-log', verifyUser, async (req, res) => {
  try {
    const { name, actionType, details } = req.body;
    if (!actionType) return res.status(400).json({ error: 'actionType is required' });

    const newLog = {
      user_email: req.verifiedEmail,
      user_name: name || 'Unknown',
      action_type: actionType,
      details: details || ''
    };

    const { error } = await supabase.from('activity_logs').insert(newLog);
    if (error) throw error;

    res.status(201).json({ success: true, message: 'Activity logged' });
  } catch (err) {
    console.error('Activity log error:', err);
    res.status(500).json({ error: 'Failed to log activity' });
  }
});

app.post('/api/user/activity', verifyUser, async (req, res) => {
  try {
    const { savedFiles, downloadedFiles, lastOpenedFile } = req.body;

    const payload = {
      email: req.verifiedEmail,
      updated_at: new Date().toISOString()
    };
    
    if (savedFiles !== undefined) payload.saved_files = savedFiles;
    if (downloadedFiles !== undefined) payload.downloaded_files = downloadedFiles;
    if (lastOpenedFile !== undefined) payload.last_opened_file = lastOpenedFile;

    const { error } = await supabase.from('user_activity').upsert(payload, { onConflict: 'email' });
    if (error) throw error;

    res.json({ success: true, message: 'Activity synced successfully' });
  } catch (err) {
    console.error('Activity sync error:', err);
    res.status(500).json({ error: 'Failed to sync activity' });
  }
});

app.post('/api/user/ping', verifyUser, async (req, res) => {
  try {
    const { error } = await supabase.from('user_activity').upsert({
      email: req.verifiedEmail,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' });
    
    if (error) throw error;

    res.json({ success: true, message: 'Ping recorded successfully' });
  } catch (err) {
    console.error('Ping error:', err);
    res.status(500).json({ error: 'Failed to record ping' });
  }
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
