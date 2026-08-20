import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, User, LogOut, Menu, BookOpen, ChevronDown, ChevronUp, Key, Search, FileText, Flag } from 'lucide-react';

export default function Navbar({ user, onLogout, theme, toggleTheme, toggleSidebar, materials = [], onViewFile, onReportFile }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState('');
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
        <div className="logo" onClick={() => window.location.hash = 'home'}>
          <img src="/logo.png" alt="Logo" className="nav-logo-img" />
        </div>
      </div>

      <div className="nav-right">
        {user && (
          <div className={`global-search-container ${showSearch ? 'active' : ''}`} ref={searchRef}>
            <button 
              className="search-toggle-btn"
              onClick={() => setShowSearch(true)}
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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                    window.location.hash = 'profile';
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
    </nav>
  );
}
