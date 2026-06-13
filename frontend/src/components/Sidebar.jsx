import React from 'react';
import { Home, Download, ShieldAlert } from 'lucide-react';

export default function Sidebar({ activeView, setActiveView, isCollapsed }) {
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
        className={`sidebar-link ${activeView === 'admin' ? 'active' : ''}`}
        onClick={() => setActiveView('admin')}
      >
        <ShieldAlert size={20} />
        <span>Admin Panel</span>
      </button>
    </aside>
  );
}
