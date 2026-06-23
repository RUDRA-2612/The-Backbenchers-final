import React, { useState, useRef } from 'react';
import { X, Download, Maximize, Minimize } from 'lucide-react';

export default function MockPdfViewer({ file, onClose, onDownload }) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const overlayRef = useRef(null);

  const toggleFullscreen = () => {
    const elem = overlayRef.current;
    if (!document.fullscreenElement) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(err => console.log(err));
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className="pdf-viewer-overlay" ref={overlayRef} style={{ backgroundColor: isFullscreen ? '#0f172a' : '' }}>
      <div className="pdf-viewer-container" style={{ height: isFullscreen ? '100vh' : '', width: isFullscreen ? '100vw' : '', maxWidth: isFullscreen ? '100vw' : '', maxHeight: isFullscreen ? '100vh' : '', borderRadius: isFullscreen ? '0' : '' }}>
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          <div className="pdf-viewer-controls">
            <button className="pdf-control-btn" onClick={toggleFullscreen} title="Full Screen">
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>
            <button className="pdf-control-btn" onClick={() => onDownload(file)} title="Download Document">
              <Download size={18} />
            </button>
            <button className="pdf-control-btn" onClick={onClose} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="pdf-body" style={{ height: isFullscreen ? 'calc(100vh - 60px)' : '80vh', backgroundColor: '#e2e8f0', display: 'flex', justifyContent: 'center' }}>
          <iframe 
            src={`${file.filepath}#toolbar=0`} 
            title={file.title} 
            width="100%" 
            height="100%" 
            style={{ border: 'none', backgroundColor: '#fff' }}
          />
        </div>
      </div>
    </div>
  );
}
