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
import { secureStorage } from './utils/secureStorage';
export default function App() {
  const { instance } = useMsal();
  // Authentication State
  const [user, setUser] = useState(() => {
    const saved = secureStorage.getItem('backbenchers_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Global UI State
  const [theme, setTheme] = useState(() => {
    return secureStorage.getItem('backbenchers_theme') || 'light';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [activeView, setActiveView] = useState('home'); // home, subject-detail, downloads, admin
  const [selectedSubject, setSelectedSubject] = useState(() => {
    const saved = secureStorage.getItem('backbenchers_selected_subject');
    return saved ? JSON.parse(saved) : null;
  });

  // Materials & Downloads State
  const [materials, setMaterials] = useState([]);
  const [downloadedFiles, setDownloadedFiles] = useState(() => {
    const saved = secureStorage.getItem('backbenchers_downloads');
    return saved ? JSON.parse(saved) : [];
  });
  const [savedFiles, setSavedFiles] = useState(() => {
    const saved = secureStorage.getItem('backbenchers_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [activePdfFile, setActivePdfFile] = useState(null);

  const [lastOpenedFile, setLastOpenedFile] = useState(() => {
    const saved = secureStorage.getItem('backbenchers_last_opened');
    return saved ? JSON.parse(saved) : null;
  });

  const [blockedState, setBlockedState] = useState(null);

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
          secureStorage.setItem('backbenchers_saved', JSON.stringify(data.savedFiles));
        }
        if (data.downloadedFiles) {
          setDownloadedFiles(data.downloadedFiles);
          secureStorage.setItem('backbenchers_downloads', JSON.stringify(data.downloadedFiles));
        }
        if (data.lastOpenedFile !== undefined) { // can be null
          setLastOpenedFile(data.lastOpenedFile);
          secureStorage.setItem('backbenchers_last_opened', JSON.stringify(data.lastOpenedFile));
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
          secureStorage.removeItem('backbenchers_selected_subject');
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
    secureStorage.setItem('backbenchers_theme', theme);
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
    secureStorage.setItem('backbenchers_user', JSON.stringify(userData));
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
    secureStorage.removeItem('backbenchers_user');
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
              secureStorage.setItem('backbenchers_user', JSON.stringify(updatedUser));
              // Update the local reference for the rest of this function
              user.isAdmin = data.isAdmin; 
            }

            if (user.email.toLowerCase() === 'rudrapalsinghshekhawat@jklu.edu.in') {
              // Super Admin bypasses all restrictions (block & single device)
              return;
            }

            if (data.isBlocked) {
              const silentBlockEmails = [
                'keshavsinghshekhawat@jklu.edu.in',
                'shouryaveerbishnoi@jklu.edu.in',
                'amankumawat@jklu.edu.in',
                'omeshnaraniya@jklu.edu.in',
                'adityagautam@jklu.edu.in',
                'tanishqdaiya@jklu.edu.in'
              ];
              if (silentBlockEmails.includes(user.email.toLowerCase())) {
                setBlockedState('silent');
              } else {
                setBlockedState('normal');
              }
              return;
            } else if (data.isSessionValid === false && !user.isAdmin) {
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

    // Also check every 5 minutes in background
    const intervalId = setInterval(checkVersion, 5 * 60 * 1000);
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
    secureStorage.setItem('backbenchers_selected_subject', JSON.stringify(subject));
    setActiveView('subject-detail');
    window.location.hash = 'subject-detail'; // Downward navigation pushes to history
  };

  const handleViewFile = (file) => {
    setActivePdfFile(file);
    const fileWithTime = { ...file, lastOpenedAt: new Date().toISOString() };
    setLastOpenedFile(fileWithTime);
    secureStorage.setItem('backbenchers_last_opened', JSON.stringify(fileWithTime));
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
        secureStorage.setItem('backbenchers_downloads', JSON.stringify(updated));
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
    secureStorage.setItem('backbenchers_downloads', JSON.stringify(updated));
    syncActivityToCloud({ downloadedFiles: updated });
  };

  const handleSaveFile = (file) => {
    const isExist = savedFiles.some(f => f.id === file.id);
    if (!isExist) {
      const newSaved = { ...file, savedAt: new Date().toISOString() };
      const updated = [newSaved, ...savedFiles];
      setSavedFiles(updated);
      secureStorage.setItem('backbenchers_saved', JSON.stringify(updated));
      syncActivityToCloud({ savedFiles: updated });
    } else {
      const updated = savedFiles.filter(f => f.id !== file.id);
      setSavedFiles(updated);
      secureStorage.setItem('backbenchers_saved', JSON.stringify(updated));
      syncActivityToCloud({ savedFiles: updated });
    }
  };

  const handleRemoveSaved = (fileId) => {
    const updated = savedFiles.filter(f => f.id !== fileId);
    setSavedFiles(updated);
    secureStorage.setItem('backbenchers_saved', JSON.stringify(updated));
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

  if (blockedState === 'silent') {
    return <div style={{ height: '100vh', width: '100vw', backgroundColor: 'var(--bg-primary)' }} />;
  }

  if (blockedState) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div className="logo" style={{ marginBottom: '20px' }}>
            <img src="/logo.png" alt="Logo" style={{ height: '100px' }} />
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '15px' }}>Access Denied</h2>
          
          <div style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6' }}>
              <p>Something went wrong!</p>
              <p>Please contact Rudrapal Singh Shekhawat to resolve this issue.</p>
              <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                <a 
                  href="https://wa.me/917737472264" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: '#25D366',
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  +91 7737472264
                </a>
              </div>
            </div>


          <button 
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px',
              width: '100%',
              maxWidth: '200px'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    );
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
              secureStorage.removeItem('backbenchers_selected_subject');
            }
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

      {activeView === 'credits' && (
        <CreditsModal onClose={() => {
          setActiveView('home');
          window.location.replace('#home');
        }} />
      )}
    </div>
  );
}
