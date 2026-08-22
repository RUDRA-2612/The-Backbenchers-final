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

// Removed seedDatabase logic to prevent fake documents

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
    const { email, password, provider, isGoogleLogin, name, microsoftAccountId } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const emailLower = email.trim().toLowerCase();
    
    if (!emailLower.endsWith('@jklu.edu.in')) {
      return res.status(403).json({ error: 'Access restricted. Please use your @jklu.edu.in email address.' });
    }

    // Check if user is blocked
    const { data: blockedUser } = await supabase.from('blocked_emails').select('id').eq('email', emailLower).single();
    if (blockedUser) {
      return res.status(403).json({ error: "Your account access has been paused. Please contact the administrator for assistance." });
    }

    const isAdminEmail = emailLower === 'rudrapalsinghshekhawat@jklu.edu.in' || emailLower === 'amanjhajharia@jklu.edu.in';

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

app.get('/api/admin/blocked-emails', async (req, res) => {
  try {
    const { data: blocked, error } = await supabase.from('blocked_emails').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json(blocked);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/block-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailLower = email.trim().toLowerCase();
    
    // Check if already blocked
    const { data: existing } = await supabase.from('blocked_emails').select('*').eq('email', emailLower).single();
    if (existing) return res.status(400).json({ error: 'Email is already blocked' });

    const { error } = await supabase.from('blocked_emails').insert({ email: emailLower });
    if (error) throw error;
    res.json({ message: 'Email blocked successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/admin/unblock-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const emailLower = email.trim().toLowerCase();

    const { error } = await supabase.from('blocked_emails').delete().eq('email', emailLower);
    if (error) throw error;
    res.json({ message: 'Email unblocked successfully' });
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
    
    res.json({ isBlocked: !!blockedUser, isSessionValid });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/admin/reports', async (req, res) => {
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

app.post('/api/materials/signed-url', async (req, res) => {
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

app.post('/api/materials/record', async (req, res) => {
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

app.post('/api/materials/upload', upload.single('file'), async (req, res) => {
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

app.delete('/api/materials/:id', async (req, res) => {
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

app.put('/api/materials/:id', async (req, res) => {
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

app.post('/api/report', async (req, res) => {
  try {
    const { materialId, title, description, userEmail, userName } = req.body;
    console.log(`\n=== NEW REPORT RECEIVED ===`);
    console.log(`Material: ${title} (${materialId})`);
    console.log(`From: ${userName || 'Unknown'} (${userEmail || 'Unknown'})`);
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

app.get('/api/user/activity/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data, error } = await supabase.from('user_activity').select('*').eq('email', email.toLowerCase()).single();
    
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

app.post('/api/user/activity', async (req, res) => {
  try {
    const { email, savedFiles, downloadedFiles, lastOpenedFile } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const payload = {
      email: email.toLowerCase(),
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

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
}

module.exports = app;
