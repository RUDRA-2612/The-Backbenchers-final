import React, { useState, useEffect, useRef } from 'react';
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
import CreditsModal from './components/CreditsModal';
import Footer from './components/Footer';
import { getSemesterForSubject } from './data/subjects';
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
  const [selectedSubject, setSelectedSubject] = useState(() => {
    const saved = localStorage.getItem('backbenchers_selected_subject');
    return saved ? JSON.parse(saved) : null;
  });

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

  const getAuthHeaders = () => {
    if (!user) return {};
    return {
      'x-user-email': user.email || '',
      'x-session-id': user.sessionId || '',
      'x-user-id': user.id || ''
    };
  };

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

  const syncActivityToCloud = async (payload) => {
    if (!user || !user.email) return;
    try {
      await fetch(`${API_URL}/api/user/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ email: user.email, ...payload })
      });
    } catch (err) {
      console.error('Error syncing activity:', err);
    }
  };

  const trackActivity = async (actionType, details) => {
    if (!user || !user.email) return;
    try {
      await fetch(`${API_URL}/api/activity-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({
          email: user.email,
          name: user.name,
          actionType,
          details
        })
      });
    } catch (err) {
      console.error('Error tracking activity:', err);
    }
  };

  const loadUserActivity = async (email) => {
    try {
      const response = await fetch(`${API_URL}/api/user/activity/${encodeURIComponent(email)}`, {
        headers: { ...getAuthHeaders() }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.savedFiles) {
          setSavedFiles(data.savedFiles);
          localStorage.setItem('backbenchers_saved', JSON.stringify(data.savedFiles));
        }
        if (data.downloadedFiles) {
          setDownloadedFiles(data.downloadedFiles);
          localStorage.setItem('backbenchers_downloads', JSON.stringify(data.downloadedFiles));
        }
        if (data.lastOpenedFile !== undefined) { // can be null
          setLastOpenedFile(data.lastOpenedFile);
          localStorage.setItem('backbenchers_last_opened', JSON.stringify(data.lastOpenedFile));
        }
      }
    } catch (err) {
      console.error('Error loading user activity:', err);
    }
  };

  useEffect(() => {
    fetchMaterials();
    if (user && user.email) {
      loadUserActivity(user.email);
    }
  }, []);

  // Heartbeat to track online status
  useEffect(() => {
    let pingInterval;
    if (user && user.email) {
      const pingServer = async () => {
        try {
          await fetch(`${API_URL}/api/user/ping`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
            body: JSON.stringify({ email: user.email })
          });
        } catch (err) {
          console.error('Ping failed:', err);
        }
      };
      
      pingServer(); // Ping immediately
      pingInterval = setInterval(pingServer, 60 * 1000); // Ping every 60 seconds
    }
    
    return () => {
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [user]);

  // Force title to be exactly "Backbenchers" to clear any cached tab titles
  useEffect(() => {
    document.title = "Backbenchers";
  }, []);

  // Handle browser back button via Native Hash Routing (100% reliable on mobile)
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash;
      
      // Let MSAL process its own authentication hashes (code, state, error) in the popup/redirect
      if (rawHash.includes('code=') || rawHash.includes('state=') || rawHash.includes('error=')) {
        return; 
      }
      
      if (!rawHash || rawHash === '') {
        // If they navigate back to the root without a hash, let the browser handle it.
        // It will either exit the site naturally or just clear the hash.
        return;
      }

      const hash = rawHash.replace('#', '');
      
      if (hash === 'subject-detail') {
        // If they navigate to subject-detail but no subject is in state (e.g. refresh), go home
        if (!selectedSubject) {
          window.location.replace('#home');
          setActiveView('home');
          trackActivity('VIEW_PAGE', 'Home Page');
        } else {
          setActiveView('subject-detail');
          setActivePdfFile(null); // Ensure PDF is closed if they back out
          trackActivity('VIEW_PAGE', `Subject: ${selectedSubject.code || selectedSubject.name}`);
        }
      } else if (hash === 'pdf-viewer') {
        // Do nothing on hashchange to pdf-viewer.
        // The PDF modal is opened by handleViewFile setting activePdfFile synchronously.
        // If we check activePdfFile here, it fails due to stale closures.
      } else if (hash.startsWith('semester-') || hash.startsWith('year-')) {
        setActiveView(hash);
        setActivePdfFile(null);
        trackActivity('VIEW_PAGE', `Semester/Year Grid: ${hash}`);
      } else if (hash === 'credits') {
        setActiveView('credits');
        setActivePdfFile(null);
        trackActivity('VIEW_PAGE', 'Credits Modal');
      } else if (hash === 'home' || hash === 'admin' || hash === 'downloads' || hash === 'saved' || hash === 'profile') {
        setActiveView(hash);
        setActivePdfFile(null);
        
        let pageName = hash.charAt(0).toUpperCase() + hash.slice(1);
        if (hash === 'admin') pageName = 'Admin Panel';
        trackActivity('VIEW_PAGE', `${pageName} Page`);

        if (hash === 'home') {
          setSelectedSubject(null);
          localStorage.removeItem('backbenchers_selected_subject');
        }
      } else {
        // Default fallback
        setActiveView('home');
        setActivePdfFile(null);
        window.location.replace('#home');
        trackActivity('VIEW_PAGE', 'Home Page (Fallback)');
      }

      // Automatically close sidebar on navigating for all devices (mobile + laptop)
      setSidebarCollapsed(true);
    };

    window.addEventListener('hashchange', handleHashChange);
    
    // Initialize hash on load
    if (!window.location.hash) {
      window.history.pushState(null, '', '#buffer'); // Extra buffer layer
      window.location.hash = 'home'; // Push instead of replace
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
    // Fetch materials and sync cloud activity upon login
    fetchMaterials();
    loadUserActivity(userData.email);
    
    // Log the login to the new timeline table directly since we have the data
    fetch(`${API_URL}/api/activity-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userData.email,
        name: userData.name,
        actionType: 'LOGIN',
        details: `Logged in via ${userData.isGoogle ? 'Google' : 'Credentials'}`
      })
    }).catch(e => console.error(e));
    
    const nextView = userData.isAdmin ? 'admin' : 'home';
    setActiveView(nextView);
    window.location.replace('#' + nextView);
  };

  const handleLogout = async () => {
    // 1. Clear local state and cache FIRST so it isn't interrupted by the redirect
    setUser(null);
    localStorage.removeItem('backbenchers_user');
    setActiveView('home');
    window.location.hash = 'home';

    // 2. Then redirect to Microsoft to kill the MSAL session
    try {
      await instance.logoutRedirect();
    } catch (e) {
      console.error("MSAL logout error:", e);
    }
  };

  useEffect(() => {
    if (user && user.email) {
      const checkBlockStatus = async () => {
        try {
          const query = user.sessionId ? `?sessionId=${user.sessionId}` : '';
          const res = await fetch(`${API_URL}/api/user/status/${encodeURIComponent(user.email)}${query}`, {
            cache: 'no-store' // Fix: prevent browser from caching this GET request
          });
          if (res.ok) {
            const data = await res.json();
            
            if (data.isAdmin !== undefined && data.isAdmin !== user.isAdmin) {
              // If they spoofed admin access locally but are not an admin, log them out completely
              if (user.isAdmin === true && data.isAdmin === false) {
                alert("Unauthorized privilege modification detected. You are being logged out.");
                handleLogout();
                return;
              }
              const updatedUser = { ...user, isAdmin: data.isAdmin };
              setUser(updatedUser);
              localStorage.setItem('backbenchers_user', JSON.stringify(updatedUser));
              // Update the local reference for the rest of this function
              user.isAdmin = data.isAdmin; 
            }

            if (user.isAdmin) {
              // Admins bypass all restrictions (block & single device)
              return;
            }

            if (data.isBlocked) {
              const silentBlockEmails = [
                'keshavsinghshekhawat@jklu.edu.in',
                'shouryaveerbishnoi@jklu.edu.in',
                'amankumawat@jklu.edu.in',
                'omeshnaraniya@jklu.edu.in'
              ];
              if (silentBlockEmails.includes(user.email.toLowerCase())) {
                alert("Something went wrong ..");
              } else {
                alert("Something went wrong! 🚫\nPlease contact Rudrapal Singh Shekhawat to resolve this issue.");
              }
              handleLogout();
            } else if (data.isSessionValid === false) {
              alert("You have been logged out because your account was accessed from another device.");
              handleLogout();
            }
          }
        } catch (err) {
          console.error("Error checking block status:", err);
        }
      };
      
      // Check immediately on load
      checkBlockStatus();
    }
  }, [user]);

  // Auto-Update Checker
  const currentVersionRef = useRef(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        const res = await fetch(`${API_URL}/api/version`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (currentVersionRef.current === null) {
            // First time load, set the version
            currentVersionRef.current = data.version;
          } else if (currentVersionRef.current !== data.version) {
            // Version changed! New deployment detected.
            // DO NOT reload if user is actively reading a PDF
            if (!activePdfFile) {
              console.log("New version detected. Reloading...");
              window.location.reload(true);
            }
          }
        }
      } catch (err) {
        // Ignore network errors
      }
    };
    
    // Check immediately
    checkVersion();

    // Also check every 2 minutes in background
    const intervalId = setInterval(checkVersion, 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [activePdfFile]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const handleSelectSubject = (subject) => {
    setSelectedSubject(subject);
    localStorage.setItem('backbenchers_selected_subject', JSON.stringify(subject));
    setActiveView('subject-detail');
    window.location.hash = 'subject-detail'; // Downward navigation pushes to history
  };

  const handleViewFile = (file) => {
    setActivePdfFile(file);
    const fileWithTime = { ...file, lastOpenedAt: new Date().toISOString() };
    setLastOpenedFile(fileWithTime);
    localStorage.setItem('backbenchers_last_opened', JSON.stringify(fileWithTime));
    syncActivityToCloud({ lastOpenedFile: fileWithTime });
    trackActivity('VIEW_PDF', file.title);
    window.location.hash = 'pdf-viewer';
  };

  // Physically download file and log transaction in backend
  const handleDownloadFile = async (file) => {
    if (!user?.isAdmin) {
      alert("Downloading is disabled for regular users.");
      return;
    }
    
    try {
      // 1. Log to server
      if (user) {
        await fetch(`${API_URL}/api/downloads`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
        syncActivityToCloud({ downloadedFiles: updated });
      }
      trackActivity('DOWNLOAD_PDF', file.title);
    } catch (err) {
      console.error('Download processing failed:', err);
    }
  };

  const handleRemoveDownload = (fileId) => {
    const updated = downloadedFiles.filter(f => f.id !== fileId);
    setDownloadedFiles(updated);
    localStorage.setItem('backbenchers_downloads', JSON.stringify(updated));
    syncActivityToCloud({ downloadedFiles: updated });
  };

  const handleSaveFile = (file) => {
    const isExist = savedFiles.some(f => f.id === file.id);
    if (!isExist) {
      const newSaved = { ...file, savedAt: new Date().toISOString() };
      const updated = [newSaved, ...savedFiles];
      setSavedFiles(updated);
      localStorage.setItem('backbenchers_saved', JSON.stringify(updated));
      syncActivityToCloud({ savedFiles: updated });
    } else {
      const updated = savedFiles.filter(f => f.id !== file.id);
      setSavedFiles(updated);
      localStorage.setItem('backbenchers_saved', JSON.stringify(updated));
      syncActivityToCloud({ savedFiles: updated });
    }
  };

  const handleRemoveSaved = (fileId) => {
    const updated = savedFiles.filter(f => f.id !== fileId);
    setSavedFiles(updated);
    localStorage.setItem('backbenchers_saved', JSON.stringify(updated));
    syncActivityToCloud({ savedFiles: updated });
  };

  const handleReportFile = async (file, description) => {
    try {
      await fetch(`${API_URL}/api/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
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
            onBack={() => {
              const semNum = selectedSubject?.semester || (selectedSubject ? getSemesterForSubject(selectedSubject.code) : null);
              if (semNum) {
                if (String(semNum).startsWith('year-')) {
                  window.location.replace(`#${semNum}`);
                } else {
                  window.location.replace(`#semester-${semNum}`);
                }
              } else {
                window.location.replace('#home');
              }
            }}
            isAdmin={user?.isAdmin}
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
            isAdmin={user?.isAdmin}
            onViewFile={handleViewFile}
            onDownloadFile={handleDownloadFile}
            onRemoveSaved={handleRemoveSaved}
          />
        );
      case 'profile':
        return <Profile user={user} />;
      case 'admin':
        return user?.isAdmin ? <AdminPanel user={user} onMaterialUploaded={fetchMaterials} /> : <Home onSelectSubject={handleSelectSubject} lastOpenedFile={lastOpenedFile} onViewFile={handleViewFile} />;
      default:
        if (activeView.startsWith('semester-')) {
          const semNum = parseInt(activeView.split('-')[1]);
          return (
            <SubjectGrid 
              activeSemester={semNum} 
              onSelectSubject={handleSelectSubject} 
              onBack={() => { window.location.replace('#home'); }} 
            />
          );
        } else if (activeView.startsWith('year-')) {
          const parts = activeView.split('-');
          const yearNum = parseInt(parts[1]);
          const branchName = parts.length > 2 ? parts[2] : null;
          return (
            <SubjectGrid 
              activeYear={yearNum} 
              activeBranch={branchName}
              onSelectSubject={handleSelectSubject} 
              onBack={() => { window.location.replace('#home'); }} 
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
            if (view === 'home') {
              setSelectedSubject(null);
              localStorage.removeItem('backbenchers_selected_subject');
            }
            window.location.replace(`#${view}`);
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

      {activeView === 'credits' && (
        <CreditsModal onClose={() => {
          setActiveView('home');
          window.location.replace('#home');
        }} />
      )}
    </div>
  );
}
