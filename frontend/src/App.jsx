import React, { useState, useEffect } from 'react';
import { useMsal } from '@azure/msal-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Auth from './components/Auth';
import Home from './components/Home';
import SubjectGrid from './components/SubjectGrid';
import SubjectDetail from './components/SubjectDetail';
import Downloads from './components/Downloads';
import Saved from './components/Saved';
import AdminPanel from './components/AdminPanel';
import Profile from './components/Profile';
import MockPdfViewer from './components/MockPdfViewer';
import Footer from './components/Footer';
import { API_URL } from './config';

export default function App() {
  const { instance } = useMsal();
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('backbenchers_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global UI State
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('backbenchers_theme') || 'light';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeView, setActiveView] = useState('home'); // home, subject-detail, downloads, admin
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Materials & Downloads State
  const [materials, setMaterials] = useState([]);
  const [downloadedFiles, setDownloadedFiles] = useState(() => {
    const saved = localStorage.getItem('backbenchers_downloads');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedFiles, setSavedFiles] = useState(() => {
    const saved = localStorage.getItem('backbenchers_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePdfFile, setActivePdfFile] = useState(null);

  const [lastOpenedFile, setLastOpenedFile] = useState(() => {
    const saved = localStorage.getItem('backbenchers_last_opened');
    return saved ? JSON.parse(saved) : null;
  });

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

  // Handle browser back button via Native Hash Routing (100% reliable on mobile)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      // Let MSAL process its own authentication hashes (code, state, error) in the popup/redirect
      if (rawHash.includes('code=') || rawHash.includes('state=') || rawHash.includes('error=')) {
        return; 
      }
      
      const hash = rawHash.replace('#', '');
      
      if (hash === 'subject-detail') {
        // If they navigate to subject-detail but no subject is in state (e.g. refresh), go home
        if (!selectedSubject) {
          window.location.replace('#home');
          setActiveView('home');
        } else {
          setActiveView('subject-detail');
          setActivePdfFile(null); // Ensure PDF is closed if they back out
        }
      } else if (hash === 'pdf-viewer') {
        // Do nothing on hashchange to pdf-viewer.
        // The PDF modal is opened by handleViewFile setting activePdfFile synchronously.
        // If we check activePdfFile here, it fails due to stale closures.
      } else if (hash.startsWith('semester-')) {
        setActiveView(hash);
        setActivePdfFile(null);
      } else if (hash === 'home' || hash === 'admin' || hash === 'downloads' || hash === 'saved' || hash === 'profile') {
        setActiveView(hash);
        setActivePdfFile(null);
        if (hash === 'home') setSelectedSubject(null);
      } else {
        // Default fallback
        setActiveView('home');
        setActivePdfFile(null);
        window.location.replace('#home');
      }

      // Automatically close sidebar on navigating for all devices (mobile + laptop)
      setSidebarCollapsed(true);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initialize hash on load
    if (!window.location.hash) {
      window.location.replace('#home');
    } else {
      handleHashChange();
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [selectedSubject]);

  // Update theme html attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('backbenchers_theme', theme);
  }, [theme]);

  // Handle window resize for sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };
    
    const handleScroll = () => {
      if (window.innerWidth < 768 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sidebarCollapsed]);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('backbenchers_user', JSON.stringify(userData));
    // Fetch materials upon login to make sure we're sync'd
    fetchMaterials();
    const nextView = userData.isAdmin ? 'admin' : 'home';
    setActiveView(nextView);
    window.location.hash = nextView;
  };

  const handleLogout = async () => {
    // 1. Clear local state and cache FIRST so it isn't interrupted by the redirect
    setUser(null);
    localStorage.removeItem('backbenchers_user');
    setActiveView('home');
    window.location.hash = 'home';

    // 2. Then redirect to Microsoft to kill the MSAL session
    try {
      await instance.logoutRedirect({
        postLogoutRedirectUri: window.location.origin
      });
    } catch (e) {
      console.error("MSAL logout error:", e);
    }
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
    window.location.hash = 'subject-detail';
  };

  const handleViewFile = (file) => {
    setActivePdfFile(file);
    const fileWithTime = { ...file, lastOpenedAt: new Date().toISOString() };
    setLastOpenedFile(fileWithTime);
    localStorage.setItem('backbenchers_last_opened', JSON.stringify(fileWithTime));
    window.location.hash = 'pdf-viewer';
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
      let fileUrl = file.filepath.startsWith('http') ? file.filepath : `${API_URL}${file.filepath}`;
      
      // Force Supabase to send as attachment for direct local download
      if (fileUrl.includes('supabase.co/storage')) {
        fileUrl += '?download=';
      }
      
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', file.filename || 'download.pdf');
      link.setAttribute('target', '_blank'); // fallback
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

  const handleSaveFile = (file) => {
    const isExist = savedFiles.some(f => f.id === file.id);
    if (!isExist) {
      const newSaved = { ...file, savedAt: new Date().toISOString() };
      const updated = [newSaved, ...savedFiles];
      setSavedFiles(updated);
      localStorage.setItem('backbenchers_saved', JSON.stringify(updated));
    } else {
      const updated = savedFiles.filter(f => f.id !== file.id);
      setSavedFiles(updated);
      localStorage.setItem('backbenchers_saved', JSON.stringify(updated));
    }
  };

  const handleRemoveSaved = (fileId) => {
    const updated = savedFiles.filter(f => f.id !== fileId);
    setSavedFiles(updated);
    localStorage.setItem('backbenchers_saved', JSON.stringify(updated));
  };

  const handleReportFile = async (file, description) => {
    try {
      await fetch(`${API_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          materialId: file.id,
          title: file.title,
          description,
          userEmail: user?.email,
          userName: user?.name
        })
      });
    } catch (err) {
      console.error('Error reporting file:', err);
    }
  };

  // Render core views
  const renderMainContent = () => {
    switch (activeView) {
      case 'home':
        return <Home onSelectSubject={handleSelectSubject} lastOpenedFile={lastOpenedFile} onViewFile={handleViewFile} />;
      case 'subject-detail':
        return (
          <SubjectDetail 
            subject={selectedSubject} 
            materials={materials} 
            savedFiles={savedFiles}
            onBack={() => window.history.back()}
            onViewFile={handleViewFile}
            onDownloadFile={handleDownloadFile}
            onSaveFile={handleSaveFile}
            onReportFile={handleReportFile}
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
      case 'saved':
        return (
          <Saved 
            savedFiles={savedFiles} 
            onViewFile={handleViewFile}
            onDownloadFile={handleDownloadFile}
            onRemoveSaved={handleRemoveSaved}
          />
        );
      case 'profile':
        return <Profile user={user} />;
      case 'admin':
        return user?.isAdmin ? <AdminPanel onMaterialUploaded={fetchMaterials} /> : <Home onSelectSubject={handleSelectSubject} lastOpenedFile={lastOpenedFile} onViewFile={handleViewFile} />;
      default:
        if (activeView.startsWith('semester-')) {
          const semNum = parseInt(activeView.split('-')[1]);
          return (
            <SubjectGrid 
              activeSemester={semNum} 
              onSelectSubject={handleSelectSubject} 
              onBack={() => { window.location.hash = 'home'; }} 
            />
          );
        }
        return <Home onSelectSubject={handleSelectSubject} lastOpenedFile={lastOpenedFile} onViewFile={handleViewFile} />;
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
        materials={materials}
        onViewFile={handleViewFile}
        onReportFile={handleReportFile}
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
              setSidebarCollapsed(true);
              return;
            }
            setActiveView(view);
            if (view === 'home') setSelectedSubject(null);
            window.location.hash = view;
            setSidebarCollapsed(true);
          }}
          isCollapsed={sidebarCollapsed}
          isAdmin={user?.isAdmin}
        />
        
        <main 
          className="content-container"
          onClick={() => {
            if (!sidebarCollapsed) {
              setSidebarCollapsed(true);
            }
          }}
        >
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
