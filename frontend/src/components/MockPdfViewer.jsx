import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function MockPdfViewer({ file, onClose, onDownload }) {
  
  // Prevent scrolling the body when PDF viewer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container" style={{ width: '90vw', maxWidth: '1200px', height: '90vh' }}>
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          <div className="pdf-viewer-controls">
            <button className="pdf-control-btn" onClick={() => onDownload(file)} title="Download Document">
              <Download size={18} />
            </button>
            <button className="pdf-control-btn" onClick={onClose} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="pdf-body" style={{ height: 'calc(100% - 60px)', width: '100%', backgroundColor: '#e2e8f0' }}>
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
