import React from 'react';
import { Bookmark, Eye, Trash2, Download } from 'lucide-react';

export default function Saved({ savedFiles, onViewFile, onDownloadFile, onRemoveSaved }) {
  return (
    <div>
      <div className="downloads-header">
        <h2>My Saved Documents</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Quickly access your bookmarked notes, PYQs, and exam questions.</p>
      </div>

      {savedFiles.length > 0 ? (
        <div className="resources-list">
          {savedFiles.map((file, index) => (
            <div key={`${file.id}-${index}`} className="resource-item">
              <div className="resource-info">
                <div className="resource-icon-box" style={{ color: 'var(--accent)', backgroundColor: 'var(--accent-soft)' }}>
                  <Bookmark size={22} />
                </div>
                <div className="resource-text">
                  <h4 className="resource-title">{file.title}</h4>
                  <span className="resource-meta">
                    Subject: <strong>{file.subjectCode}</strong> | Saved on: {new Date(file.savedAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
              <div className="resource-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary btn-accent-light" 
                    onClick={() => onViewFile(file)}
                    title="View Document"
                    style={{ padding: '0.5rem' }}
                  >
                    <Eye size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Open File</span>
                  </button>
                  <button 
                    className="btn btn-secondary btn-accent-light" 
                    onClick={() => onDownloadFile(file)}
                    title="Download PDF"
                    style={{ padding: '0.5rem' }}
                  >
                    <Download size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Download</span>
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => onRemoveSaved(file.id)}
                    title="Remove from Saved"
                    style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'var(--border)' }}
                  >
                    <Trash2 size={18} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Bookmark size={48} />
          <h3>No saved documents yet</h3>
          <p>Explore subjects and click the save button to bookmark materials for later.</p>
        </div>
      )}
    </div>
  );
}
