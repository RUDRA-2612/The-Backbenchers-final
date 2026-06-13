import React, { useState, useEffect } from 'react';
import { UploadCloud, Users, History, Download, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const subjectsList = [
  { code: 'CS1139', name: 'Programming 1 (Python)' },
  { code: 'EE1118', name: 'Electrical and Electronics Engineering (EEE)' },
  { code: 'AS1109', name: 'Calculus' },
  { code: 'AS1108', name: 'Applied Physics' },
  { code: 'ES1115', name: 'Environmental Science and Sustainability' },
  { code: 'CC1101', name: 'Fundamental of Communication' }
];

export default function AdminPanel({ onMaterialUploaded }) {
  const [adminTab, setAdminTab] = useState('upload'); // upload, logins, downloads, students
  const [logins, setLogins] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [students, setStudents] = useState([]);

  // Form State
  const [title, setTitle] = useState('');
  const [subjectCode, setSubjectCode] = useState('CS1139');
  const [category, setCategory] = useState('notes');
  const [subcategory, setSubcategory] = useState('mid-term-1');
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Fetch admin logs
  const fetchLogs = async () => {
    try {
      const loginRes = await fetch('http://localhost:5000/api/admin/logins');
      const loginData = await loginRes.json();
      setLogins(loginData);

      const downloadRes = await fetch('http://localhost:5000/api/admin/downloads');
      const downloadData = await downloadRes.json();
      setDownloads(downloadData);

      const studentRes = await fetch('http://localhost:5000/api/admin/users');
      const studentData = await studentRes.json();
      setStudents(studentData);
    } catch (err) {
      console.error('Error fetching admin details:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [adminTab]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadMessage({ type: '', text: '' });

    if (!file) {
      setUploadMessage({ type: 'error', text: 'Please select a PDF file to upload.' });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subjectCode', subjectCode);
    formData.append('category', category);
    if (category === 'papers') {
      formData.append('subcategory', subcategory);
    }
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/api/materials/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadMessage({ type: 'success', text: 'PDF material uploaded successfully!' });
      setTitle('');
      setFile(null);
      // Reset file input element
      document.getElementById('pdf-file-input').value = '';
      
      // Trigger parent callback to refresh materials list
      onMaterialUploaded();
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="downloads-header">
        <h2>Administrator Panel</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Manage study materials, monitor student logins, and track downloads activity.</p>
      </div>

      {/* Admin tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${adminTab === 'upload' ? 'active' : ''}`}
          onClick={() => setAdminTab('upload')}
        >
          <UploadCloud size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Upload Study Material
        </button>
        <button 
          className={`tab-btn ${adminTab === 'logins' ? 'active' : ''}`}
          onClick={() => setAdminTab('logins')}
        >
          <History size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Student Login Audit
        </button>
        <button 
          className={`tab-btn ${adminTab === 'downloads' ? 'active' : ''}`}
          onClick={() => setAdminTab('downloads')}
        >
          <Download size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Downloads Audit
        </button>
        <button 
          className={`tab-btn ${adminTab === 'students' ? 'active' : ''}`}
          onClick={() => setAdminTab('students')}
        >
          <Users size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Registered Students
        </button>
      </div>

      {/* Admin content */}
      <div className="admin-content" style={{ marginTop: '1.5rem' }}>
        
        {/* TAB 1: UPLOAD FORM */}
        {adminTab === 'upload' && (
          <div className="admin-card" style={{ maxWidth: '600px' }}>
            <h3 className="admin-title">
              <UploadCloud size={20} />
              Upload PDF Document
            </h3>

            {uploadMessage.text && (
              <div 
                className={uploadMessage.type === 'success' ? 'upload-success' : 'auth-error'}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {uploadMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span>{uploadMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="admin-upload-form">
              <div className="form-group">
                <label className="form-label" htmlFor="docTitle">Document Title</label>
                <input 
                  id="docTitle"
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Unit 3 - Electrostatics Lecture Notes"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required 
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="docSubject">Subject</label>
                <select 
                  id="docSubject"
                  className="form-input"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                >
                  {subjectsList.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="docCategory">Resource Category</label>
                <select 
                  id="docCategory"
                  className="form-input"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="notes">Notes</option>
                  <option value="papers">Previous Year Papers & Solutions</option>
                  <option value="formulas">Formula Sheets</option>
                  <option value="topics">Important Topics</option>
                </select>
              </div>

              {category === 'papers' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="docSubcategory">Exam Subcategory</label>
                  <select 
                    id="docSubcategory"
                    className="form-input"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                  >
                    <option value="mid-term-1">Mid Term 1</option>
                    <option value="mid-term-2">Mid Term 2</option>
                    <option value="end-term">End Term</option>
                  </select>
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="pdf-file-input">PDF File Attachment</label>
                <input 
                  id="pdf-file-input"
                  type="file" 
                  className="form-input" 
                  accept=".pdf"
                  onChange={handleFileChange}
                  required 
                />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Only .pdf format files are supported.</span>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ marginTop: '0.5rem' }}
                disabled={loading}
              >
                {loading ? 'Uploading File...' : 'Upload Document'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: LOGIN LOGS */}
        {adminTab === 'logins' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <History size={20} />
              Login Activity Log
            </h3>
            {logins.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Student Name</th>
                      <th>Student Email</th>
                      <th>Method</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logins.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: '600' }}>{log.name}</td>
                        <td>{log.email}</td>
                        <td>
                          <span className="tag-method" style={{ 
                            backgroundColor: log.method.includes('Google') ? 'rgba(66, 133, 244, 0.1)' : 'var(--accent-soft)',
                            color: log.method.includes('Google') ? '#4285f4' : 'var(--accent)'
                          }}>
                            {log.method}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <History size={32} />
                <p>No login activity logged yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: DOWNLOAD LOGS */}
        {adminTab === 'downloads' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <Download size={20} />
              Resource Downloads Log
            </h3>
            {downloads.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Student Name</th>
                      <th>Student Email</th>
                      <th>Subject Code</th>
                      <th>Downloaded File</th>
                    </tr>
                  </thead>
                  <tbody>
                    {downloads.map(log => (
                      <tr key={log.id}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: '600' }}>{log.name}</td>
                        <td>{log.email}</td>
                        <td style={{ fontFamily: 'monospace' }}>{log.subjectCode}</td>
                        <td style={{ color: 'var(--accent)', fontWeight: '500' }}>{log.title}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Download size={32} />
                <p>No study guides downloaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REGISTERED STUDENTS */}
        {adminTab === 'students' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <Users size={20} />
              Registered Student Accounts
            </h3>
            {students.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Account Created</th>
                      <th>Full Name</th>
                      <th>Email Address</th>
                      <th>Google Account</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => (
                      <tr key={s.id}>
                        <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>{s.name}</td>
                        <td>{s.email}</td>
                        <td>{s.isGoogle ? 'Yes (Gmail)' : 'No (Credentials)'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <Users size={32} />
                <p>No student accounts created yet.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
