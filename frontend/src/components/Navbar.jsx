import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, User, LogOut, Menu, BookOpen, ChevronDown, ChevronUp, Key, Search, FileText } from 'lucide-react';

export default function Navbar({ user, onLogout, theme, toggleTheme, toggleSidebar, materials = [], onViewFile }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

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
      setShowSearch(false);
    }

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
                  className="dropdown-logout" 
                  style={{ color: 'var(--text-primary)', borderBottom: '1px solid var(--border)', borderRadius: '8px 8px 0 0', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} 
                  onClick={() => {
                    setShowDropdown(false);
                    window.location.hash = 'profile';
                  }}
                >
                  <User size={16} />
                  <span>Profile</span>
                </button>
                <button 
                  className="dropdown-logout" 
                  style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}
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
    </nav>
  );
}
