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
