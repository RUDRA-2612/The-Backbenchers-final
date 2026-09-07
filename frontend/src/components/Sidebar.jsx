import React, { useState } from 'react';
import { Home, Download, ShieldAlert, Bookmark, Star } from 'lucide-react';
import CreditsModal from './CreditsModal';

export default function Sidebar({ activeView, setActiveView, isCollapsed, isAdmin }) {
  const [showCreditsModal, setShowCreditsModal] = useState(false);

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button 
        className={`sidebar-link ${activeView === 'home' || activeView === 'subject-detail' ? 'active' : ''}`}
        onClick={() => setActiveView('home')}
      >
        <Home size={20} />
        <span>Home</span>
      </button>

      <button 
        className={`sidebar-link ${activeView === 'downloads' ? 'active' : ''}`}
        onClick={() => setActiveView('downloads')}
      >
        <Download size={20} />
        <span>My Downloads</span>
      </button>

      <button 
        className={`sidebar-link ${activeView === 'saved' ? 'active' : ''}`}
        onClick={() => setActiveView('saved')}
      >
        <Bookmark size={20} />
        <span>Saved Documents</span>
      </button>

      {isAdmin && (
        <button 
          className={`sidebar-link ${activeView === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveView('admin')}
        >
          <ShieldAlert size={20} />
          <span>Admin Panel</span>
        </button>
      )}

      <div style={{ flexGrow: 1 }} />

      <button 
        className="sidebar-link"
        onClick={() => setShowCreditsModal(true)}
      >
        <Star size={20} />
        <span>Credits</span>
      </button>

      {/* Credits Modal */}
      {showCreditsModal && (
        <CreditsModal onClose={() => setShowCreditsModal(false)} />
      )}
    </aside>
  );
}
