import React from 'react';
import { Home, Download, ShieldAlert, Bookmark, Star } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, isCollapsed, isAdmin }) {

  const handleCreditsClick = () => {
    // Push a new history entry so back button can close the credits modal
    window.history.pushState({ creditsOpen: true }, '', window.location.href.split('#')[0] + '#credits');
    setActiveView('credits');
  };

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

      <button 
        className={`sidebar-link ${activeView === 'credits' ? 'active' : ''}`}
        onClick={handleCreditsClick}
      >
        <Star size={20} />
        <span>Credits</span>
      </button>
    </aside>
  );
}
