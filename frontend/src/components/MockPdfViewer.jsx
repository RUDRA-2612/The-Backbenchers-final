import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export default function MockPdfViewer({ file, onClose }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);

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

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset) => {
    setPageNumber(prevPageNumber => prevPageNumber + offset);
  }

  const previousPage = () => {
    if (pageNumber > 1) changePage(-1);
  }

  const nextPage = () => {
    if (pageNumber < numPages) changePage(1);
  }

  const zoomIn = () => setScale(prev => Math.min(prev + 0.3, 3.0));
  const zoomOut = () => setScale(prev => Math.max(prev - 0.3, 0.6));

  return (
    <div className="pdf-viewer-overlay">
      <div className="pdf-viewer-container" style={{ userSelect: 'none' }}>
        <div className="pdf-viewer-header">
          <div className="pdf-title-box">
            <span className="pdf-tag">PDF</span>
            <span className="pdf-title">{file.title}</span>
          </div>
          
          {numPages && (
            <div className="pdf-pagination" style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: '#f1f1f1' }}>
              <button className="pdf-control-btn" onClick={previousPage} disabled={pageNumber <= 1} style={{ opacity: pageNumber <= 1 ? 0.3 : 1, cursor: pageNumber <= 1 ? 'not-allowed' : 'pointer' }}>
                <ChevronLeft size={20} />
              </button>
              <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                Page {pageNumber} of {numPages}
              </span>
              <button className="pdf-control-btn" onClick={nextPage} disabled={pageNumber >= numPages} style={{ opacity: pageNumber >= numPages ? 0.3 : 1, cursor: pageNumber >= numPages ? 'not-allowed' : 'pointer' }}>
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          <div className="pdf-viewer-controls" style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="pdf-control-btn" onClick={zoomOut} title="Zoom Out">
              <ZoomOut size={18} />
            </button>
            <button className="pdf-control-btn" onClick={zoomIn} title="Zoom In">
              <ZoomIn size={18} />
            </button>
            <div style={{ width: '1px', backgroundColor: 'var(--border)', margin: '0 4px' }}></div>
            <button className="pdf-control-btn" onClick={onClose} title="Close PDF Viewer" style={{ color: '#ef4444' }}>
              <X size={18} />
            </button>
          </div>
        </div>
        
        <div className="pdf-body" style={{ overflow: 'auto', backgroundColor: '#e5e7eb', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '2rem 0' }}>
          <Document
            file={file.filepath}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)', padding: '4rem' }}>
                <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
                <p style={{ fontWeight: 500 }}>Loading PDF securely...</p>
              </div>
            }
            error={
              <div style={{ color: '#ef4444', padding: '4rem', textAlign: 'center', fontWeight: 500 }}>
                Failed to load PDF. It might be corrupted or the file path is incorrect.
              </div>
            }
          >
            {numPages && (
              <div style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)', backgroundColor: 'white' }}>
                <Page 
                  pageNumber={pageNumber} 
                  scale={scale} 
                  renderTextLayer={false} 
                  renderAnnotationLayer={false}
                  loading={<div style={{ padding: '4rem', display: 'flex', justifyContent: 'center' }}><Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} /></div>}
                />
              </div>
            )}
          </Document>
        </div>
      </div>
    </div>
  );
}
