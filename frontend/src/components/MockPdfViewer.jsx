import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function MockPdfViewer({ file, onClose }) {
  
  // Prevent scrolling the body when PDF viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
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
      <div className="pdf-viewer-container">
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          <div className="pdf-viewer-controls">
            <button className="pdf-control-btn" onClick={onClose} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="pdf-body">
          {/* Using object tag to prefer native PDF viewer which handles touchpad zoom natively.
              If the browser doesn't support native PDF (like mobile), it will fallback to Google Docs viewer */}
          <object 
            data={`${file.filepath}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`} 
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
