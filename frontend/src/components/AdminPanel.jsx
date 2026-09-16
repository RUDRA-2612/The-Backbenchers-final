import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, Users, History, Download, FileText, CheckCircle, AlertCircle, Trash2, Edit2, Flag, Ban, MessageSquare, Search, User } from 'lucide-react';
import { API_URL } from '../config';

import { masterSubjects } from '../data/subjects';

export default function AdminPanel({ onMaterialUploaded }) {
  const [adminTab, setAdminTab] = useState('upload'); // upload, logins, downloads, students
  const [logins, setLogins] = useState([]);
  const [downloads, setDownloads] = useState([]);
  const [students, setStudents] = useState([]);
  const [blockedEmails, setBlockedEmails] = useState([]);
  const [newBlockedEmail, setNewBlockedEmail] = useState('');
  const [materials, setMaterials] = useState([]);
  const [reports, setReports] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [selectedUserEmail, setSelectedUserEmail] = useState('');
  const [showUserSearch, setShowUserSearch] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowUserSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Form State
  const [title, setTitle] = useState('');
  const [selectedYear, setSelectedYear] = useState('year1');
  const [selectedSemester, setSelectedSemester] = useState('1');
  const [subjectCode, setSubjectCode] = useState('CS1139');
  const [category, setCategory] = useState('notes');
  const [subcategory, setSubcategory] = useState('mid-term');
  const [year, setYear] = useState('2025');
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  // Fetch admin logs
  const fetchLogs = async () => {
    try {
      const timestamp = Date.now();
      
      const loginRes = await fetch(`${API_URL}/api/admin/logins?t=${timestamp}`, { cache: 'no-store' });
      const loginData = await loginRes.json();
      setLogins(loginData);

      const downloadRes = await fetch(`${API_URL}/api/admin/downloads?t=${timestamp}`, { cache: 'no-store' });
      const downloadData = await downloadRes.json();
      setDownloads(downloadData);

      const studentRes = await fetch(`${API_URL}/api/admin/users?t=${timestamp}`, { cache: 'no-store' });
      const studentData = await studentRes.json();
      setStudents(studentData);

      const blockedRes = await fetch(`${API_URL}/api/admin/blocked-emails?t=${timestamp}`, { cache: 'no-store' });
      const blockedData = await blockedRes.json();
      setBlockedEmails(blockedData);

      const materialRes = await fetch(`${API_URL}/api/materials?t=${timestamp}`);
      const materialData = await materialRes.json();
      setMaterials(materialData);

      const reportRes = await fetch(`${API_URL}/api/admin/reports?t=${timestamp}`, { cache: 'no-store' });
      if (reportRes.ok) {
        const reportData = await reportRes.json();
        setReports(reportData);
      }
    } catch (err) {
      console.error('Error fetching admin details:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [adminTab]);

  const handleBlockEmail = async (e) => {
    e.preventDefault();
    if (!newBlockedEmail) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/block-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newBlockedEmail })
      });
      if (res.ok) {
        setNewBlockedEmail('');
        fetchLogs();
        alert('Email blocked successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to block email');
      }
    } catch (err) {
      alert('Error blocking email');
    }
  };

  const handleUnblockEmail = async (email) => {
    if (!window.confirm(`Are you sure you want to unblock ${email}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/unblock-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        fetchLogs();
        alert('Email unblocked successfully!');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to unblock email');
      }
    } catch (err) {
      alert('Error unblocking email');
    }
  };

  const handleDeleteReport = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report? Make sure the issue is resolved first.')) return;
    try {
      const res = await fetch(`${API_URL}/api/admin/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter(r => r.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete report');
      }
    } catch (e) {
      console.error("Error deleting report", e);
      alert('Error deleting report');
    }
  };

  // Synchronize dynamic form dropdowns
  useEffect(() => {
    if (masterSubjects[selectedYear]) {
      if (masterSubjects[selectedYear].semesters) {
        const sems = Object.keys(masterSubjects[selectedYear].semesters);
        if (sems.length > 0 && !sems.includes(selectedSemester)) {
          setSelectedSemester(sems[0]);
        }
      } else if (masterSubjects[selectedYear].branches) {
        const branches = Object.keys(masterSubjects[selectedYear].branches);
        if (branches.length > 0 && !branches.includes(selectedSemester)) {
          setSelectedSemester(branches[0]);
        }
      }
    }
  }, [selectedYear, selectedSemester]);

  useEffect(() => {
    let subjects = [];
    if (masterSubjects[selectedYear]) {
      if (masterSubjects[selectedYear].semesters && masterSubjects[selectedYear].semesters[selectedSemester]) {
        subjects = masterSubjects[selectedYear].semesters[selectedSemester];
      } else if (masterSubjects[selectedYear].branches && masterSubjects[selectedYear].branches[selectedSemester]) {
        subjects = masterSubjects[selectedYear].branches[selectedSemester];
      }
    }
    
    if (subjects.length > 0) {
      if (!subjects.some(s => s.code === subjectCode)) {
        setSubjectCode(subjects[0].code);
      }
    } else {
      setSubjectCode('');
    }
  }, [selectedSemester, selectedYear, subjectCode]);

  useEffect(() => {
    if (subjectCode === 'IL1107' && year !== '2025') {
      setYear('2025');
    }
  }, [subjectCode, year]);

  useEffect(() => {
    if (subjectCode.startsWith('CC') && subcategory === 'mid-term') {
      setSubcategory('end-term');
    }
  }, [subjectCode, subcategory]);

  let currentSubjectObj = null;
  if (masterSubjects[selectedYear]) {
    if (masterSubjects[selectedYear].semesters && masterSubjects[selectedYear].semesters[selectedSemester]) {
       currentSubjectObj = masterSubjects[selectedYear].semesters[selectedSemester].find(s => s.code === subjectCode);
    } else if (masterSubjects[selectedYear].branches && masterSubjects[selectedYear].branches[selectedSemester]) {
       currentSubjectObj = masterSubjects[selectedYear].branches[selectedSemester].find(s => s.code === subjectCode);
    }
  }

  const handleDeleteMaterial = async (id) => {
    if (!window.confirm("Are you sure you want to delete this material?")) return;
    try {
      const res = await fetch(`${API_URL}/api/materials/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMaterials(materials.filter(m => m.id !== id));
        onMaterialUploaded();
      }
    } catch (e) {
      console.error("Error deleting material", e);
    }
  };

  const handleRenameTitle = async (id, currentTitle) => {
    const newTitle = window.prompt("Enter new title for this material:", currentTitle);
    if (!newTitle || newTitle.trim() === '' || newTitle === currentTitle) return;

    try {
      const res = await fetch(`${API_URL}/api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle.trim() })
      });
      
      if (res.ok) {
        alert('Title updated successfully!');
        fetchLogs();
      } else {
        const errorData = await res.json();
        alert('Failed to update title: ' + (errorData.error || 'Unknown error'));
      }
    } catch (e) {
      console.error("Error updating title", e);
      alert('Error updating title: ' + e.message);
    }
  };

  const handleUpdateFile = async (id, file) => {
    if (!file) return;
    setUpdatingId(id);
    
    try {
      // 1. Get signed URL
      const signedUrlRes = await fetch(`${API_URL}/api/materials/signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const signedUrlData = await signedUrlRes.json();
      if (!signedUrlRes.ok) throw new Error(signedUrlData.error || 'Failed to get upload URL');

      // 2. Upload file directly to Supabase Storage
      const uploadRes = await fetch(signedUrlData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${signedUrlData.token}`
        }
      });
      if (!uploadRes.ok) throw new Error('Failed to upload file to storage');

      // 3. Update DB
      const res = await fetch(`${API_URL}/api/materials/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, filepath: signedUrlData.publicUrl })
      });
      
      if (res.ok) {
        alert('File replaced successfully!');
        fetchLogs();
      } else {
        const errorData = await res.json();
        alert('Failed to replace file: ' + (errorData.error || 'Unknown error'));
      }
    } catch (e) {
      console.error("Error updating file", e);
      alert('Error updating file: ' + e.message);
    } finally {
      setUpdatingId(null);
    }
  };

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

    try {
      // 1. Get signed URL
      const signedUrlRes = await fetch(`${API_URL}/api/materials/signed-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name })
      });
      const signedUrlData = await signedUrlRes.json();
      if (!signedUrlRes.ok) throw new Error(signedUrlData.error || 'Failed to get upload URL');

      // 2. Upload file directly to Supabase Storage
      const uploadRes = await fetch(signedUrlData.signedUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${signedUrlData.token}`
        }
      });
      if (!uploadRes.ok) throw new Error('Failed to upload file to storage');

      // 3. Save record to DB
      const recordPayload = {
        title,
        subjectCode,
        category,
        subcategory: category === 'papers' ? subcategory : null,
        year: category === 'papers' ? year : null,
        filename: file.name,
        filepath: signedUrlData.publicUrl
      };

      const recordRes = await fetch(`${API_URL}/api/materials/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordPayload)
      });
      const recordData = await recordRes.json();
      if (!recordRes.ok) throw new Error(recordData.error || 'Failed to save record');

      setUploadMessage({ type: 'success', text: 'PDF material uploaded successfully!' });
      setTitle('');
      setFile(null);
      // Reset file input element safely
      const fileInput = document.getElementById('pdf-file-input');
      if (fileInput) {
        fileInput.value = '';
      }

      // Trigger parent callback to refresh materials list
      onMaterialUploaded();
    } catch (err) {
      setUploadMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const searchLower = userSearchQuery.trim().toLowerCase();
  
  // Users matching the search query for the dropdown
  const userSearchResults = searchLower && !selectedUserEmail ? students.filter(s => 
    s.email.toLowerCase().includes(searchLower) || s.name.toLowerCase().includes(searchLower)
  ).slice(0, 6) : [];

  // The user currently selected from the dropdown
  const selectedUserLower = selectedUserEmail.trim().toLowerCase();
  const foundUser = selectedUserLower ? students.find(s => s.email.toLowerCase() === selectedUserLower) : null;
  const userLogins = selectedUserLower ? logins.filter(l => l.email.toLowerCase() === selectedUserLower) : [];
  const userDownloads = selectedUserLower ? downloads.filter(d => d.email.toLowerCase() === selectedUserLower) : [];
  const lastLogin = userLogins.length > 0 ? userLogins[0].timestamp : null;

  const handleSelectUser = (email) => {
    setSelectedUserEmail(email);
    setUserSearchQuery(email); // Keep the email in the input box
  };

  return (
    <div>
      <div className="downloads-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2>Administrator Panel</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Manage study materials, monitor student logins, and track downloads activity.</p>
        </div>

        {/* Global Admin User Search */}
        <div className={`global-search-container ${showUserSearch ? 'active' : ''}`} ref={searchRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button 
            className="search-toggle-btn"
            onClick={() => setShowUserSearch(true)}
            aria-label="Search Users"
          >
            <Search size={18} />
          </button>
          <div className="search-input-wrapper">
            <input 
              type="text" 
              className="global-search-input" 
              style={{ width: '100%' }}
              placeholder="Search by student email or name..." 
              value={userSearchQuery}
              onChange={(e) => {
                setUserSearchQuery(e.target.value);
                setSelectedUserEmail(''); // Clear selection when typing
              }}
              autoFocus={showUserSearch}
            />
            {showUserSearch && searchLower && !selectedUserEmail && (
              <div className="search-results-dropdown">
                {userSearchResults.length > 0 ? (
                  userSearchResults.map(user => (
                    <div key={user.id} className="search-result-item" onClick={() => handleSelectUser(user.email)}>
                      <User size={16} className="result-icon" />
                      <div className="result-text">
                        <div className="result-title">{user.name}</div>
                        <div className="result-code">{user.email}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-result-empty">No users found.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedUserLower && (
        <div className="user-search-results admin-card" style={{ marginTop: '1rem', marginBottom: '2rem' }}>
            {foundUser ? (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderLeft: '4px solid #22c55e', borderRadius: '4px' }}>
                <h4 style={{ color: '#22c55e', marginBottom: '0.5rem' }}>User Found!</h4>
                <p><strong>Name:</strong> {foundUser.name}</p>
                <p><strong>Email:</strong> {foundUser.email}</p>
                <p><strong>Joined:</strong> {new Date(foundUser.createdAt).toLocaleDateString()}</p>
              </div>
            ) : (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid #ef4444', borderRadius: '4px' }}>
                <h4 style={{ color: '#ef4444' }}>User not found</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No user is registered with this email ID.</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Last Login</h4>
                {lastLogin ? (
                  <p style={{ fontSize: '1.1rem', fontWeight: '500', color: 'var(--text-primary)' }}>
                    {new Date(lastLogin).toLocaleString()}
                  </p>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No login history found.</p>
                )}
              </div>

              <div style={{ flex: '1 1 300px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                <h4 style={{ marginBottom: '1rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-light)' }}>Download History ({userDownloads.length})</h4>
                {userDownloads.length > 0 ? (
                  <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {userDownloads.map(d => (
                      <li key={d.id} style={{ marginBottom: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-elevated)', borderRadius: '6px', border: '1px solid var(--border-light)' }}>
                        <p style={{ fontWeight: '500', marginBottom: '0.25rem' }}>{d.title}</p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {d.subjectCode} • {new Date(d.timestamp).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>No downloads found for this user.</p>
                )}
              </div>
            </div>
          </div>
        )}

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
          className={`tab-btn ${adminTab === 'manage' ? 'active' : ''}`}
          onClick={() => setAdminTab('manage')}
        >
          <FileText size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Manage Materials
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
        <button
          className={`tab-btn ${adminTab === 'blocked' ? 'active' : ''}`}
          onClick={() => setAdminTab('blocked')}
        >
          <Ban size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          Blocked Students
        </button>
        <button
          className={`tab-btn ${adminTab === 'reports' ? 'active' : ''}`}
          onClick={() => setAdminTab('reports')}
        >
          <Flag size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          User Reports
        </button>
        <button
          className={`tab-btn ${adminTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setAdminTab('feedback')}
        >
          <MessageSquare size={16} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
          User Feedback
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

              <div className="form-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: '1 1 45%' }}>
                  <label className="form-label" htmlFor="docYearSelect">Year</label>
                  <select
                    id="docYearSelect"
                    className="form-input"
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {Object.keys(masterSubjects).map(yKey => (
                      <option key={yKey} value={yKey}>{masterSubjects[yKey].title}</option>
                    ))}
                  </select>
                </div>
                
                <div style={{ flex: '1 1 45%' }}>
                  <label className="form-label" htmlFor="docSemesterSelect">
                    {masterSubjects[selectedYear]?.branches ? 'Branch' : 'Semester'}
                  </label>
                  <select
                    id="docSemesterSelect"
                    className="form-input"
                    value={selectedSemester}
                    onChange={(e) => setSelectedSemester(e.target.value)}
                    disabled={!masterSubjects[selectedYear] || (!masterSubjects[selectedYear].semesters && !masterSubjects[selectedYear].branches)}
                  >
                    {masterSubjects[selectedYear]?.semesters && Object.keys(masterSubjects[selectedYear].semesters).map(sem => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                    {masterSubjects[selectedYear]?.branches && Object.keys(masterSubjects[selectedYear].branches).map(branch => (
                      <option key={branch} value={branch}>{branch.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="docSubject">Subject</label>
                <select
                  id="docSubject"
                  className="form-input"
                  value={subjectCode}
                  onChange={(e) => setSubjectCode(e.target.value)}
                  disabled={!masterSubjects[selectedYear] || (!masterSubjects[selectedYear].semesters?.[selectedSemester] && !masterSubjects[selectedYear].branches?.[selectedSemester])}
                >
                  {(masterSubjects[selectedYear]?.semesters?.[selectedSemester] || masterSubjects[selectedYear]?.branches?.[selectedSemester] || []).map(s => (
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
                  <option value="papers">Previous Year Papers</option>
                </select>
              </div>

              {category === 'papers' && (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="docSubcategory">Exam Subcategory</label>
                    <select
                      id="docSubcategory"
                      className="form-input"
                      value={subcategory}
                      onChange={(e) => setSubcategory(e.target.value)}
                    >
                      {!subjectCode.startsWith('CC') && <option value="mid-term">Mid Term</option>}
                      <option value="end-term">End Term</option>
                      <option value="quizzes">Quizzes</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label" htmlFor="docYear">Year</label>
                    <select
                      id="docYear"
                      className="form-input"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                    >
                      <option value="2025">2025</option>
                      {subjectCode !== 'IL1107' && (
                        <>
                          <option value="2024">2024</option>
                          <option value="2023">2023</option>
                        </>
                      )}
                    </select>
                  </div>
                </>
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

        {/* TAB 4.5: BLOCKED STUDENTS */}
        {adminTab === 'blocked' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <Ban size={20} style={{ color: '#ff4d4f' }} />
              Blocked Students
            </h3>

            <div className="admin-upload-form" style={{ maxWidth: '500px', marginBottom: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: '8px' }}>
              <form onSubmit={handleBlockEmail} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                  <label className="form-label" htmlFor="blockEmail">Block an Email Address</label>
                  <input
                    id="blockEmail"
                    type="email"
                    className="form-input"
                    placeholder="student@jklu.edu.in"
                    value={newBlockedEmail}
                    onChange={(e) => setNewBlockedEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn" style={{ backgroundColor: '#ff4d4f', color: '#fff', border: 'none' }}>
                  Block User
                </button>
              </form>
            </div>

            {blockedEmails.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Blocked Date</th>
                      <th>Email Address</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockedEmails.map(b => (
                      <tr key={b.id}>
                        <td>{new Date(b.created_at).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>{b.email}</td>
                        <td>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem 1rem', color: '#22c55e', borderColor: '#22c55e' }} 
                            onClick={() => handleUnblockEmail(b.email)}
                          >
                            Unblock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <CheckCircle size={32} style={{ color: '#22c55e' }} />
                <p>No students are currently blocked.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: MANAGE MATERIALS */}
        {adminTab === 'manage' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <FileText size={20} />
              Manage Uploaded Materials
            </h3>
            {materials.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Upload Date</th>
                      <th>Title</th>
                      <th>Subject</th>
                      <th>Category</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materials.map(m => (
                      <tr key={m.id}>
                        <td>{new Date(m.uploadedAt).toLocaleDateString()}</td>
                        <td style={{ fontWeight: '600' }}>{m.title}</td>
                        <td style={{ fontFamily: 'monospace' }}>{m.subjectCode}</td>
                        <td>
                          <span className="tag-method" style={{ backgroundColor: 'var(--bg-card-hover)', color: 'var(--text-primary)' }}>
                            {m.category} {m.subcategory && `> ${m.subcategory}`} {m.year && `(${m.year})`}
                          </span>
                        </td>
                        <td style={{ display: 'flex', gap: '0.5rem' }}>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="file" 
                              id={`update-file-${m.id}`} 
                              style={{ display: 'none' }} 
                              accept=".pdf"
                              onChange={(e) => handleUpdateFile(m.id, e.target.files[0])}
                            />
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', color: 'var(--text-primary)' }} 
                              onClick={() => handleRenameTitle(m.id, m.title)} 
                              title="Edit Title"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              className="btn btn-secondary" 
                              style={{ padding: '0.4rem', color: 'var(--accent)' }} 
                              onClick={() => document.getElementById(`update-file-${m.id}`).click()} 
                              title="Replace PDF"
                              disabled={updatingId === m.id}
                            >
                              {updatingId === m.id ? '...' : <FileText size={16} />}
                            </button>
                          </div>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', color: '#ff4d4f', borderColor: '#ff4d4f' }} 
                            onClick={() => handleDeleteMaterial(m.id)} 
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <FileText size={32} />
                <p>No study materials uploaded yet.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: REPORTS */}
        {adminTab === 'reports' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <Flag size={20} style={{ color: '#ff4d4f' }} />
              User Reports
            </h3>
            {reports.filter(r => r.title !== 'FEEDBACK').length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Reported Item</th>
                      <th>Issue Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.filter(r => r.title !== 'FEEDBACK').map((r, idx) => (
                      <tr key={r.id || idx}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: '600' }}>{r.userName}</td>
                        <td>{r.userEmail}</td>
                        <td style={{ color: 'var(--accent)', fontWeight: '500' }}>
                          {r.materialId === 'GENERAL' ? (
                            <span style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
                              General Site Feedback
                            </span>
                          ) : (
                            r.title
                          )}
                        </td>
                        <td style={{ maxWidth: '300px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.description}</td>
                        <td>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', color: '#22c55e', borderColor: '#22c55e' }} 
                            onClick={() => handleDeleteReport(r.id)} 
                            title="Mark as Resolved & Delete"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <CheckCircle size={32} style={{ color: '#22c55e' }} />
                <p>No reports found. Everything is looking good!</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: FEEDBACK */}
        {adminTab === 'feedback' && (
          <div className="admin-card">
            <h3 className="admin-title">
              <MessageSquare size={20} style={{ color: '#3b82f6' }} />
              User Feedback
            </h3>
            {reports.filter(r => r.title === 'FEEDBACK').length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>User</th>
                      <th>Email</th>
                      <th>Feedback Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.filter(r => r.title === 'FEEDBACK').map((r, idx) => (
                      <tr key={r.id || idx}>
                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(r.timestamp).toLocaleString()}</td>
                        <td style={{ fontWeight: '600' }}>{r.userName}</td>
                        <td>{r.userEmail}</td>
                        <td style={{ maxWidth: '400px', whiteSpace: 'normal', wordBreak: 'break-word' }}>{r.description}</td>
                        <td>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', color: '#22c55e', borderColor: '#22c55e' }} 
                            onClick={() => handleDeleteReport(r.id)} 
                            title="Mark as Read & Delete"
                          >
                            <CheckCircle size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state" style={{ padding: '2rem' }}>
                <CheckCircle size={32} style={{ color: '#22c55e' }} />
                <p>No feedback received yet.</p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
