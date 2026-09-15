import React, { useEffect, useState } from 'react';
import { X, Download, ShieldAlert } from 'lucide-react';

export default function MockPdfViewer({ file, user, onClose, onDownload }) {
  const [isBlurred, setIsBlurred] = useState(false);
  const isProtected = user && !user.isAdmin;

  // Prevent scrolling the body when PDF viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Anti-screenshot protections
  useEffect(() => {
    if (!isProtected) return;

    // 1. Blur on focus loss (Detects Snipping Tool / OS Overlays)
    const handleBlur = () => setIsBlurred(true);
    const handleFocus = () => setIsBlurred(false);
    
    // 2. Prevent Keyboard Shortcuts (PrintScreen, Ctrl+S, Ctrl+P, Ctrl+C)
    const handleKeyDown = (e) => {
      if (
        e.key === 'PrintScreen' ||
        (e.ctrlKey && ['p', 's', 'c', 'x'].includes(e.key.toLowerCase())) ||
        (e.metaKey && ['p', 's', 'c', 'x'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
        alert("Action disabled for security reasons.");
      }
    };

    // 3. Prevent Right Click
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isProtected]);

  // Generate an array for repeated watermarks
  const watermarks = Array(20).fill(user?.email || 'Student');

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          <div className="pdf-viewer-controls">
            {!isProtected && (
              <button className="pdf-control-btn" onClick={() => onDownload(file)} title="Download Document">
                <Download size={18} />
              </button>
            )}
            <button className="pdf-control-btn" onClick={onClose} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="pdf-body" style={{ position: 'relative' }}>
          
          {/* WATERMARK OVERLAY */}
          {isProtected && (
            <div className="pdf-watermark-overlay" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              pointerEvents: 'none', zIndex: 10, display: 'flex', flexWrap: 'wrap', 
              justifyContent: 'space-around', alignItems: 'center', overflow: 'hidden',
              opacity: 0.15
            }}>
              {watermarks.map((text, i) => (
                <div key={i} style={{
                  transform: 'rotate(-30deg)', padding: '2rem', fontSize: '1.2rem',
                  fontWeight: 'bold', color: '#000', userSelect: 'none'
                }}>
                  {text}
                </div>
              ))}
            </div>
          )}

          {/* BLUR OVERLAY (When Snipping tool opens) */}
          {isBlurred && (
            <div className="pdf-blur-overlay" style={{
              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
              backgroundColor: '#111', zIndex: 20, display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center', color: '#fff'
            }}>
              <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
              <h3>Security Warning</h3>
              <p>Screenshots and screen recording are disabled.</p>
              <p style={{ fontSize: '0.85rem', color: '#888', marginTop: '0.5rem' }}>Click here to resume viewing.</p>
            </div>
          )}

          {/* Using object tag to prefer native PDF viewer which handles touchpad zoom natively.
              If the browser doesn't support native PDF (like mobile), it will fallback to Google Docs viewer */}
          <object 
            data={`${file.filepath}#toolbar=0&navpanes=0&scrollbar=1`} 
            type="application/pdf"
            width="100%" 
            height="100%" 
            style={{ border: 'none', display: 'block' }}
          >
            <iframe 
              src={`https://docs.google.com/viewer?url=${encodeURIComponent(file.filepath)}&embedded=true`} 
              title={file.title} 
              width="100%" 
              height="100%" 
              style={{ border: 'none', backgroundColor: '#fff' }}
            />
          </object>
        </div>
      </div>
    </div>
  );
}
