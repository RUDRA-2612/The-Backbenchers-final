import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, User, LogOut, Menu, BookOpen, ChevronDown, ChevronUp, Key } from 'lucide-react';

export default function Navbar({ user, onLogout, theme, toggleTheme, toggleSidebar }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
        setShowProfileDetails(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
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
                <div 
                  className="dropdown-header" 
                  style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: showProfileDetails ? '1px solid var(--border)' : 'none', paddingBottom: showProfileDetails ? '0.75rem' : '0' }} 
                  onClick={() => setShowProfileDetails(!showProfileDetails)}
                >
                  <div className="dropdown-name" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <User size={16} />
                    <span>Profile</span>
                  </div>
                  {showProfileDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>

                {showProfileDetails && (
                  <div className="profile-details" style={{ padding: '0.75rem 0', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div>
                      <div className="dropdown-name" style={{ fontSize: '0.95rem' }}>{user.name}</div>
                      <div className="dropdown-email">{user.email}</div>
                    </div>
                    <button className="btn btn-secondary" style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}>
                      <Key size={14} /> Change Password
                    </button>
                  </div>
                )}

                <div style={{ marginTop: showProfileDetails ? '0.25rem' : '0.75rem', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <button className="dropdown-logout" onClick={onLogout}>
                    <LogOut size={16} />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
