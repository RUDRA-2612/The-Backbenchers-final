import React, { useState, useEffect, useRef } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { ANALYTICS_EVENTS, trackMaterial } from '../analytics';
import { API_URL } from '../config';
import { secureStorage } from '../utils/secureStorage';

export default function MockPdfViewer({ file, authHeaders, onClose, onDownload }) {
  const [isMobile, setIsMobile] = useState(false);
  const [blobUrl, setBlobUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const openedAt = useRef(0);

  useEffect(() => {
    openedAt.current = Date.now();
  }, []);

  const closeViewer = () => {
    trackMaterial(ANALYTICS_EVENTS.MATERIAL_CLOSE, file, {
      reading_duration_seconds: Math.round((Date.now() - openedAt.current) / 1000),
    });
    onClose();
  };

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check on initial load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  // Prevent scrolling the body when PDF viewer is open and prevent layout shift
  useEffect(() => {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, []);

  // Block Keyboard shortcuts (Ctrl+S, Ctrl+P) and Right Click
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener('keydown', handleKeyDown, { capture: true });
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: true });
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  // Load PDF content securely via in-memory Blob URL
  useEffect(() => {
    let isMounted = true;
    let activeBlobUrl = null;

    const loadDocument = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Special case for static disclaimer/policy file
        if (file.id === 'disclaimer' || file.filepath === '/Disclaimer_and_Content_Policy.pdf') {
          if (isMounted) {
            setBlobUrl('/Disclaimer_and_Content_Policy.pdf');
            setIsLoading(false);
          }
          return;
        }

        // Resolve auth headers
        let headers = authHeaders;
        if (!headers || Object.keys(headers).length === 0) {
          try {
            const saved = secureStorage.getItem('backbenchers_user');
            if (saved) {
              const u = JSON.parse(saved);
              headers = {
                'x-user-email': u.email || '',
                'x-session-id': u.sessionId || '',
                'x-user-id': u.id || ''
              };
            }
          } catch (e) {}
        }

        const response = await fetch(`${API_URL}/api/materials/${file.id}/view`, {
          headers: headers || {}
        });

        if (!response.ok) {
          throw new Error(`Failed to load document (${response.status})`);
        }

        const blob = await response.blob();
        if (!isMounted) return;

        activeBlobUrl = URL.createObjectURL(blob);
        setBlobUrl(activeBlobUrl);
      } catch (err) {
        console.error('Failed to securely load document:', err);
        if (isMounted) {
          setError('Unable to load document securely. Please verify your connection or try again.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isMounted = false;
      if (activeBlobUrl) {
        URL.revokeObjectURL(activeBlobUrl);
      }
    };
  }, [file.id, file.filepath]);

  return (
    <div className="pdf-viewer-overlay">
      <style>
        {`
          @media print {
            body { display: none !important; }
          }
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          <div className="pdf-viewer-controls">
            <button className="pdf-control-btn" onClick={closeViewer} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="pdf-body">
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {isLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: 'var(--text-secondary)' }}>
                <Loader2 size={36} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontWeight: 500, fontSize: '0.95rem' }}>Loading document securely...</p>
              </div>
            )}
            
            {!isLoading && error && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem', color: '#ef4444', textAlign: 'center', padding: '2rem' }}>
                <AlertCircle size={40} />
                <p style={{ fontWeight: 600, maxWidth: '400px' }}>{error}</p>
                <button className="btn btn-secondary" onClick={closeViewer} style={{ marginTop: '0.5rem' }}>Close</button>
              </div>
            )}

            {!isLoading && !error && blobUrl && (
              <iframe 
                src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(blobUrl)}#zoom=auto`} 
                title={file.title} 
                width="100%" 
                height="100%" 
                style={{ border: 'none', backgroundColor: '#fff', display: 'block' }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

