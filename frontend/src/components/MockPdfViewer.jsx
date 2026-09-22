import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { ANALYTICS_EVENTS, trackMaterial } from '../analytics';

export default function MockPdfViewer({ file, onClose, onDownload }) {
  const [isMobile, setIsMobile] = useState(false);
  const openedAt = React.useRef(0);

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

  return (
    <div className="pdf-viewer-overlay">
      <style>
        {`
          @media print {
            body { display: none !important; }
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
            <iframe 
              src={`/pdfjs/web/viewer.html?file=${encodeURIComponent(file.filepath)}#zoom=auto`} 
              title={file.title} 
              width="100%" 
              height="100%" 
              style={{ border: 'none', backgroundColor: '#fff', display: 'block' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
