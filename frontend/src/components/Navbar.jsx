import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, User, LogOut, Menu, BookOpen, ChevronDown, ChevronUp, Key, Search, FileText, Flag, Shield, MessageSquare, Star } from 'lucide-react';
import { API_URL } from '../config';
import { ANALYTICS_EVENTS, track, trackMaterial } from '../analytics';

export default function Navbar({ user, onLogout, theme, toggleTheme, toggleSidebar, materials = [], onViewFile, onReportFile }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackDescription, setFeedbackDescription] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  const handleReportSubmit = () => {
    if (reportDescription.trim() === '') return;
    if (onReportFile) {
      onReportFile({ id: null, title: 'GENERAL' }, reportDescription);
    }
    setShowReportModal(false);
    setReportDescription('');
    alert('Report submitted successfully. Thank you!');
  };

  const handleFeedbackSubmit = () => {
    if (feedbackDescription.trim() === '' && feedbackRating === 0) return;
    
    if (feedbackDescription.trim() === '' && feedbackRating > 0) {
      if (!window.confirm("Do you want to submit your rating without any text feedback?")) {
        return;
      }
    }

    if (onReportFile) {
      let finalDesc = feedbackDescription;
      if (feedbackRating > 0) {
        finalDesc = `[Rating: ${feedbackRating}/5]\n${feedbackDescription}`;
      }
      onReportFile({ id: null, title: 'FEEDBACK' }, finalDesc.trim());
    }
    setShowFeedbackModal(false);
    setFeedbackDescription('');
    setFeedbackRating(0);
    alert('Feedback submitted successfully. Thank you!');
  };

  useEffect(() => {
    if (showFeedbackModal && user) {
      const getAuthHeaders = () => ({
        'x-user-email': user.email || '',
        'x-session-id': user.sessionId || '',
        'x-user-id': user.id || ''
      });
      fetch(`${API_URL}/api/user/feedback`, { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(data => {
          if (data && data.description) {
             const match = data.description.match(/^\[Rating: (\d)\/5\]\n?([\s\S]*)$/);
             if (match) {
               setFeedbackRating(parseInt(match[1]));
               setFeedbackDescription(match[2]);
             } else {
               setFeedbackRating(0);
               setFeedbackDescription(data.description);
             }
          }
        })
        .catch(e => console.error("Error fetching feedback:", e));
    }
  }, [showFeedbackModal, user]);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowProfileDetails(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    }

    function handleScroll() {
      setShowDropdown(false);
      setShowProfileDetails(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Handle mobile back button to close search
  useEffect(() => {
    const handlePopState = () => {
      if (showSearch) {
        setShowSearch(false);
      }
    };

    if (showSearch) {
      window.history.pushState({ searchOpen: true }, '');
      window.addEventListener('popstate', handlePopState);
    } else {
      if (window.history.state && window.history.state.searchOpen) {
        window.history.back();
      }
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [showSearch]);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const searchResults = searchQuery.trim() ? materials.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (m.subjectCode && m.subjectCode.toLowerCase().includes(searchQuery.toLowerCase()))
  ).slice(0, 6) : [];

  const handleSelectResult = (file) => {
    track(ANALYTICS_EVENTS.SEARCH, { search_result_count: searchResults.length, search_selected: true });
    trackMaterial(ANALYTICS_EVENTS.INTERACTION, file, { interaction_name: 'search_result_open' });
    setShowSearch(false);
    setSearchQuery('');
    if (onViewFile) onViewFile(file);
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <button className="menu-toggle" onClick={toggleSidebar} aria-label="Toggle Sidebar">
          <Menu size={22} />
        </button>
        <div className="logo" onClick={() => { window.history.pushState(null, '', '/'); window.dispatchEvent(new Event('popstate')); }}>
          <img src="/logo.png" alt="Logo" className="nav-logo-img smart-logo" />
          <span className="desktop-only" style={{ marginLeft: '5px' }}>Back<span>benchers</span></span>
        </div>
      </div>

      <div className="nav-right">
        {user && (
          <div className={`global-search-container ${showSearch ? 'active' : ''}`} ref={searchRef}>
            <button 
              className="search-toggle-btn"
              onClick={() => {
                track(ANALYTICS_EVENTS.INTERACTION, { interaction_name: showSearch ? 'search_close' : 'search_open' });
                setShowSearch(!showSearch);
              }}
              aria-label="Search Materials"
            >
              <Search size={18} />
            </button>
            <div className="search-input-wrapper">
              <input 
                type="text" 
                className="global-search-input" 
                placeholder="Search by subject or code..." 
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (e.target.value.length === 1) track(ANALYTICS_EVENTS.SEARCH, { search_started: true });
                }}
                autoFocus={showSearch}
              />
              {showSearch && searchQuery.trim() && (
                <div className="search-results-dropdown">
                  {searchResults.length > 0 ? (
                    searchResults.map(file => (
                      <div key={file.id} className="search-result-item" onClick={() => handleSelectResult(file)}>
                        <FileText size={16} className="result-icon" />
                        <div className="result-text">
                          <div className="result-title">{file.title}</div>
                          <div className="result-code">{file.subjectCode}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="search-result-empty">No PDFs found.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          <span className="theme-text desktop-only">
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </span>
        </button>

        {user && (
          <div className="profile-container" ref={dropdownRef}>
            <button className="profile-trigger" onClick={() => setShowDropdown(!showDropdown)}>
              <div className="profile-avatar">
                {getInitials(user.name)}
              </div>
              <span className="profile-name">{user.name}</span>
            </button>

            {showDropdown && (
              <div className="profile-dropdown">
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowDropdown(false);
                    window.history.pushState(null, '', '/profile'); window.dispatchEvent(new Event('popstate'));;
                  }}
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowDropdown(false);
                    setShowReportModal(true);
                  }}
                >
                  <Flag size={16} />
                  <span>Report Issue</span>
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowDropdown(false);
                    setShowFeedbackModal(true);
                  }}
                >
                  <MessageSquare size={16} />
                  <span>Feedback</span>
                </button>
                <button 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowDropdown(false);
                    if (onViewFile) {
                      onViewFile({ id: 'disclaimer', title: 'Disclaimer and Content Policy', filepath: '/Disclaimer_and_Content_Policy.pdf' });
                    }
                  }}
                >
                  <Shield size={16} />
                  <span>Disclaimer & Policy</span>
                </button>
                <button 
                  className="dropdown-item danger" 
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* General Report Modal */}
      {showReportModal && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Report Issue</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Reporting: <strong>General Website Issue</strong>
            </p>
            <textarea 
              style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="Describe the issue you found on the website (e.g. broken link, display issue, bug)..."
              value={reportDescription}
              onChange={e => setReportDescription(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowReportModal(false)}>Cancel</button>
              <button className="btn btn-primary" style={{ backgroundColor: '#ff4d4f', color: '#fff' }} onClick={handleReportSubmit}>Submit Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Submit Feedback</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              We value your thoughts! Tell us how we can improve.
            </p>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedbackRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    color: star <= feedbackRating ? '#fbbf24' : 'var(--border-color)',
                    transition: 'transform 0.1s ease, color 0.2s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.2)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                  title={`${star} Star${star > 1 ? 's' : ''}`}
                >
                  <Star size={32} fill={star <= feedbackRating ? '#fbbf24' : 'none'} strokeWidth={1.5} />
                </button>
              ))}
            </div>

            <textarea 
              style={{ width: '100%', height: '100px', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              placeholder="Share your ideas, suggestions, or feedback here (optional)..."
              value={feedbackDescription}
              onChange={e => setFeedbackDescription(e.target.value)}
            />
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleFeedbackSubmit}>Submit Feedback</button>
            </div>
          </div>
        </div>
      )}

    </nav>
  );
}
