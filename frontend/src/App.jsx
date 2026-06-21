import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import SubjectGrid from './components/SubjectGrid';
import SubjectDetail from './components/SubjectDetail';
import Downloads from './components/Downloads';
import AdminPanel from './components/AdminPanel';
import MockPdfViewer from './components/MockPdfViewer';
import Footer from './components/Footer';
import { API_URL } from './config';

export default function App() {
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('backbenchers_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global UI State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('backbenchers_theme') || 'light';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.innerWidth < 768);
  const [activeView, setActiveView] = useState('home'); // home, subject-detail, downloads, admin
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Materials & Downloads State
  const [materials, setMaterials] = useState([]);
  const [downloadedFiles, setDownloadedFiles] = useState(() => {
    const saved = localStorage.getItem('backbenchers_downloads');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePdfFile, setActivePdfFile] = useState(null);

  // Fetch materials from API
  const fetchMaterials = async () => {
    try {
      const response = await fetch(`${API_URL}/api/materials`);
      if (response.ok) {
        const data = await response.json();
        setMaterials(data);
      }
    } catch (err) {
      console.error('Error fetching materials from API:', err);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  // Handle browser back button (History API)
  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state) {
        setActiveView(event.state.view || 'home');
        setSelectedSubject(event.state.subject || null);
        setActivePdfFile(event.state.pdfFile || null);
      } else {
        setActiveView('home');
        setSelectedSubject(null);
        setActivePdfFile(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Initialize current state in history if not present
    if (window.history.state) {
      setActiveView(window.history.state.view || 'home');
      setSelectedSubject(window.history.state.subject || null);
      setActivePdfFile(window.history.state.pdfFile || null);
    } else {
      window.history.replaceState({ 
        view: activeView, 
        subject: selectedSubject, 
        pdfFile: activePdfFile 
      }, '', '');
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update theme html attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('backbenchers_theme', theme);
  }, [theme]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarCollapsed(false);
      } else {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('backbenchers_user', JSON.stringify(userData));
    // Fetch materials upon login to make sure we're sync'd
    fetchMaterials();
    const nextView = userData.isAdmin ? 'admin' : 'home';
    setActiveView(nextView);
    window.history.replaceState({ view: nextView, subject: null, pdfFile: null }, '', '');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('backbenchers_user');
    setActiveView('home');
    window.history.replaceState({ view: 'home', subject: null, pdfFile: null }, '', '');
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    setActiveView('subject-detail');
    window.history.pushState({ view: 'subject-detail', subject, pdfFile: activePdfFile }, '', '');
  };

  const handleViewFile = (file) => {
    setActivePdfFile(file);
    window.history.pushState({ view: activeView, subject: selectedSubject, pdfFile: file }, '', '');
  };

  // Physically download file and log transaction in backend
  const handleDownloadFile = async (file) => {
    try {
      // 1. Log to server
      if (user) {
        await fetch(`${API_URL}/api/downloads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: user.name,
            email: user.email,
            subjectCode: file.subjectCode,
            title: file.title,
            filename: file.filename
          })
        });
      }

      // 2. Trigger browser file download (blob fetch or custom file download)
      // Since these are PDF/text guides, we trigger a browser download from the server path
      const fileUrl = file.filepath.startsWith('http') ? file.filepath : `${API_URL}${file.filepath}`;
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', file.filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 3. Add to local downloads list if not already there
      const isExist = downloadedFiles.some(d => d.id === file.id);
      if (!isExist) {
        const newDownload = {
          ...file,
          downloadedAt: new Date().toISOString()
        };
        const updated = [newDownload, ...downloadedFiles];
        setDownloadedFiles(updated);
        localStorage.setItem('backbenchers_downloads', JSON.stringify(updated));
      }
    } catch (err) {
      console.error('Download processing failed:', err);
    }
  };

  const handleRemoveDownload = (fileId) => {
    const updated = downloadedFiles.filter(f => f.id !== fileId);
    setDownloadedFiles(updated);
    localStorage.setItem('backbenchers_downloads', JSON.stringify(updated));
  };

  // Render core views
  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return <SubjectGrid onSelectSubject={handleSelectSubject} />;
      case 'subject-detail':
        return (
          <SubjectDetail 
            subject={selectedSubject} 
            materials={materials} 
            onBack={() => window.history.back()}
            onViewFile={handleViewFile}
            onDownloadFile={handleDownloadFile}
          />
        );
      case 'downloads':
        return (
          <Downloads 
            downloadedFiles={downloadedFiles} 
            onViewFile={handleViewFile}
            onRemoveDownload={handleRemoveDownload}
          />
        );
      case 'admin':
        return user?.isAdmin ? <AdminPanel onMaterialUploaded={fetchMaterials} /> : <SubjectGrid onSelectSubject={handleSelectSubject} />;
      default:
        return <SubjectGrid onSelectSubject={handleSelectSubject} />;
    }
  };

  // If user is not logged in, render auth page
  if (!user) {
    return <Auth onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        theme={theme} 
        toggleTheme={toggleTheme} 
        toggleSidebar={toggleSidebar}
      />
      
      <div className="main-wrapper">
        <div 
          className={`sidebar-overlay ${!sidebarCollapsed ? 'active' : ''}`} 
          onClick={() => setSidebarCollapsed(true)}
        ></div>
        <Sidebar 
          activeView={activeView} 
          setActiveView={(view) => {
            if (view === activeView) {
              if (window.innerWidth < 768) setSidebarCollapsed(true);
              return;
            }
            setActiveView(view);
            const newSubject = view === 'home' ? null : selectedSubject;
            if (view === 'home') setSelectedSubject(null);
            window.history.pushState({ view, subject: newSubject, pdfFile: activePdfFile }, '', '');
            if (window.innerWidth < 768) setSidebarCollapsed(true);
          }}
          isCollapsed={sidebarCollapsed}
          isAdmin={user?.isAdmin}
        />
        
        <main className="content-container">
          <div style={{ flex: 1 }}>
            {renderMainContent()}
          </div>
          {activeView === 'home' && <Footer />}
        </main>
      </div>

      {activePdfFile && (
        <MockPdfViewer 
          file={activePdfFile} 
          onClose={() => window.history.back()}
          onDownload={handleDownloadFile}
        />
      )}
    </div>
  );
}
