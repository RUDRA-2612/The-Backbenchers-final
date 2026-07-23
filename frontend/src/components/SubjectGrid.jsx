import React, { useState, useEffect } from 'react';
import { Terminal, Zap, Calculator, Leaf, Radio, Cpu, ArrowRight, Book, Search, PlusCircle, HelpCircle, Eye, Download, CheckCircle, FileText } from 'lucide-react';
import { API_URL } from '../config';

const subjects = [
  { name: 'Programming 1 (Python)', code: 'CS1139', icon: Terminal, desc: 'Introductory programming, control flow, functions, lists, and file handling.' },
  { name: 'Electrical and Electronics Engineering (EEE)', code: 'EE1118', icon: Cpu, desc: 'DC circuits, KVL/KCL, network theorems, AC circuits, and semiconductor diodes.' },
  { name: 'Calculus', code: 'AS1109', icon: Calculator, desc: 'Limits, continuity, single variable differentiation, integration, and infinite series.' },
  { name: 'Applied Physics', code: 'AS1108', icon: Zap, desc: 'Wave optics, interference, diffraction, polarization, and quantum mechanics.' },
  { name: 'Environmental Science and Sustainability', code: 'ES1115', icon: Leaf, desc: 'Ecosystems, biodiversity, pollution control, global warming, and sustainable dev.' },
  { name: 'Fundamental of Communication', code: 'CC1101', icon: Radio, desc: 'Basics of signals, modulation techniques (AM/FM), and data transmission systems.' },
  { name: 'Introduction to Indian Knowledge System (IKS)', code: 'IL1107', icon: Book, desc: 'Overview of ancient Indian sciences, philosophy, mathematics, and holistic wellness.' }
];

export default function SubjectGrid({ onSelectSubject, materials = [], onViewFile, onDownloadFile, user }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [requests, setRequests] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqTitle, setReqTitle] = useState('');
  const [reqSubjectCode, setReqSubjectCode] = useState('CS1139');
  const [reqCategory, setReqCategory] = useState('notes');
  const [reqMsg, setReqMsg] = useState('');

  // Fetch Student Requests
  const fetchRequests = async () => {
    try {
      const res = await fetch(`${API_URL}/api/requests`);
      if (res.ok) {
        const data = await res.json();
        setRequests(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setReqMsg('');
    try {
      const res = await fetch(`${API_URL}/api/requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: reqTitle,
          subjectCode: reqSubjectCode,
          category: reqCategory,
          requestedBy: user?.name || user?.email || 'Student'
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');

      setReqMsg('Request submitted successfully!');
      setReqTitle('');
      fetchRequests();
      setTimeout(() => setShowRequestModal(false), 1200);
    } catch (err) {
      setReqMsg(err.message);
    }
  };

  // Filter materials for Live Search
  const searchResults = searchQuery.trim() === '' ? [] : materials.filter(item => {
    const q = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(q) ||
           item.subjectCode?.toLowerCase().includes(q) ||
           item.category?.toLowerCase().includes(q) ||
           item.filename?.toLowerCase().includes(q);
  });

  const handleVote = async (requestId, voteType) => {
    try {
      const userIdentifier = user?.email || user?.name || 'guest';
      const res = await fetch(`${API_URL}/api/requests/${requestId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ voteType, userIdentifier })
      });
      const data = await res.json();
      if (res.ok && data.allRequests) {
        setRequests(data.allRequests);
      }
    } catch (err) {
      console.error('Error recording vote:', err);
    }
  };

  return (
    <div>
      <div className="hero-section">
        <h1 className="hero-title" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '0.45em', fontWeight: '500', color: 'var(--text-secondary)', lineHeight: '1' }}>Welcome to</span>
          <span className="hero-brand-name">
            {"Backbenchers".split('').map((char, idx) => (
              <span 
                key={idx} 
                className="dance-letter" 
                style={{ 
                  animationDelay: `${idx * 0.04}s`,
                  color: idx >= 4 ? 'var(--accent)' : 'var(--text-primary)'
                }}
              >
                {char}
              </span>
            ))}
          </span>
        </h1>
        <p className="hero-subtitle">Open-source B.Tech student portal for notes, PYQs, solutions, formula sheets, and important exam questions.</p>

        {/* Live Search Bar */}
        <div style={{ maxWidth: '600px', margin: '1.5rem auto 0 auto', position: 'relative', width: '100%' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '16px' }} />
            <input 
              type="text"
              className="form-input"
              style={{
                paddingLeft: '48px',
                paddingRight: '16px',
                height: '52px',
                borderRadius: '26px',
                fontSize: '1rem',
                border: '2px solid var(--accent)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                background: 'var(--bg-card)'
              }}
              placeholder="Search notes, PYQs, topics, formulas by title or subject code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Request Notes Button */}
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <button
            className="btn btn-primary"
            style={{ borderRadius: '20px', padding: '0.5rem 1.2rem', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
            onClick={() => setShowRequestModal(true)}
          >
            <PlusCircle size={18} />
            <span>Request Missing Notes / Paper</span>
          </button>
        </div>
      </div>

      {/* Live Search Results View */}
      {searchQuery.trim() !== '' && (
        <div style={{ marginBottom: '2.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Search Results for "{searchQuery}" ({searchResults.length})
          </h3>
          {searchResults.length > 0 ? (
            <div className="resources-list">
              {searchResults.map((file) => (
                <div key={file.id} className="resource-item">
                  <div className="resource-info">
                    <div className="resource-icon-box">
                      <FileText size={22} />
                    </div>
                    <div className="resource-text">
                      <h4 className="resource-title">{file.title}</h4>
                      <span className="resource-meta">
                        Subject: <strong>{file.subjectCode}</strong> | Category: <span style={{ textTransform: 'capitalize' }}>{file.category}</span>
                      </span>
                    </div>
                  </div>
                  <div className="resource-actions">
                    <button 
                      className="btn btn-secondary btn-accent-light" 
                      onClick={() => onViewFile(file)}
                      style={{ padding: '0.5rem' }}
                    >
                      <Eye size={18} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>View</span>
                    </button>
                    <button 
                      className="btn btn-secondary btn-accent-light" 
                      onClick={() => onDownloadFile(file)}
                      style={{ padding: '0.5rem' }}
                    >
                      <Download size={18} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <Search size={36} />
              <p>No materials matched your search query. Try searching for a subject code like <strong>CS1139</strong> or <strong>AS1109</strong>.</p>
            </div>
          )}
        </div>
      )}

      {/* Subject Cards Grid */}
      <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Browse Subjects</h3>
      <div className="subjects-grid">
        {subjects.map((sub) => {
          const IconComponent = sub.icon;
          return (
            <div 
              key={sub.code} 
              className="subject-card"
              onClick={() => onSelectSubject(sub)}
            >
              <div className="subject-card-header">
                <span className="subject-code">{sub.code}</span>
                <h3 className="subject-title">{sub.name}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>{sub.desc}</p>
              </div>
              <div className="subject-card-footer">
                <span>View Study Materials <ArrowRight size={16} /></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Open Student Requests & Priority Polling Board */}
      {requests.length > 0 && (
        <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: 'var(--accent-soft)', color: 'var(--accent)', padding: '0.5rem', borderRadius: '8px', display: 'flex' }}>
                <HelpCircle size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', margin: 0, color: 'var(--text-main)' }}>Student Resource Requests & Priority Poll</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Highest voted requests are prioritized by contributors & admins first!</span>
              </div>
            </div>
            <span style={{ fontSize: '0.85rem', background: 'var(--bg-main)', padding: '0.3rem 0.8rem', borderRadius: '20px', border: '1px solid var(--border)', fontWeight: '600', color: 'var(--text-muted)' }}>
              {requests.length} Open Requests
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem', marginTop: '1.25rem' }}>
            {requests.map((req, idx) => {
              const yesCount = req.votes?.yes || 0;
              const noCount = req.votes?.no || 0;
              const total = yesCount + noCount;
              const yesPercent = total > 0 ? Math.round((yesCount / total) * 100) : 100;
              const userIdentifier = user?.email || user?.name || 'guest';
              const userVote = req.votedUsers ? req.votedUsers[userIdentifier] : null;

              return (
                <div 
                  key={req.id} 
                  style={{ 
                    padding: '1.2rem', 
                    background: 'var(--bg-main)', 
                    borderRadius: '12px', 
                    border: idx === 0 ? '2px solid var(--accent)' : '1px solid var(--border)',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justify: 'space-between',
                    boxShadow: idx === 0 ? '0 4px 15px rgba(99, 102, 241, 0.15)' : 'none'
                  }}
                >
                  <div>
                    {idx === 0 && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)',
                        padding: '0.2rem 0.6rem',
                        borderRadius: '20px',
                        marginBottom: '0.6rem'
                      }}>
                        🔥 High Priority (#1 Most Requested)
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 'bold', background: 'var(--bg-card)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border)' }}>
                        {req.subjectCode}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        Category: <strong>{req.category}</strong>
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text-main)', margin: '0.4rem 0 0.5rem 0', lineHeight: '1.3' }}>
                      {req.title}
                    </h4>

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.8rem' }}>
                      Requested by: <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{req.requestedBy}</span>
                    </div>
                  </div>

                  {/* Priority Bar */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.3rem', fontWeight: '600' }}>
                      <span>Student Need Score</span>
                      <span style={{ color: 'var(--accent)' }}>{yesPercent}% Yes ({yesCount} votes)</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden', marginBottom: '0.8rem' }}>
                      <div style={{ width: `${yesPercent}%`, height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: '3px', transition: 'width 0.3s ease' }}></div>
                    </div>

                    {/* Voting Poll Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        type="button"
                        className="btn"
                        style={{
                          flex: 1,
                          fontSize: '0.8rem',
                          padding: '0.4rem 0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          borderRadius: '8px',
                          background: userVote === 'yes' ? 'var(--accent)' : 'var(--bg-card)',
                          color: userVote === 'yes' ? '#ffffff' : 'var(--text-main)',
                          border: userVote === 'yes' ? '1px solid var(--accent)' : '1px solid var(--border)',
                          fontWeight: '600'
                        }}
                        onClick={() => handleVote(req.id, 'yes')}
                      >
                        👍 Yes, I need this! ({yesCount})
                      </button>

                      <button
                        type="button"
                        className="btn"
                        style={{
                          fontSize: '0.8rem',
                          padding: '0.4rem 0.6rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                          borderRadius: '8px',
                          background: userVote === 'no' ? 'rgba(239, 68, 68, 0.15)' : 'var(--bg-card)',
                          color: userVote === 'no' ? '#ef4444' : 'var(--text-muted)',
                          border: userVote === 'no' ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid var(--border)',
                          fontWeight: '500'
                        }}
                        onClick={() => handleVote(req.id, 'no')}
                      >
                        👎 No ({noCount})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Request Notes Modal */}
      {showRequestModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="admin-card" style={{ maxWidth: '500px', width: '100%', position: 'relative' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} color="var(--accent)" />
              Request Missing Study Resource
            </h3>

            {reqMsg && (
              <div className="upload-success" style={{ marginBottom: '1rem', padding: '0.5rem', borderRadius: '6px', fontSize: '0.9rem' }}>
                {reqMsg}
              </div>
            )}

            <form onSubmit={handleCreateRequest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Resource Title / Description</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Calculus Unit 2 Differential Equations Notes"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Subject</label>
                <select
                  className="form-input"
                  value={reqSubjectCode}
                  onChange={(e) => setReqSubjectCode(e.target.value)}
                >
                  {subjects.map(s => (
                    <option key={s.code} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={reqCategory}
                  onChange={(e) => setReqCategory(e.target.value)}
                >
                  <option value="notes">Notes</option>
                  <option value="papers">PYQs & Solutions</option>
                  <option value="formulas">Formula Sheets</option>
                  <option value="questions">Important Questions</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Submit Request
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
