import React from 'react';
import { Download, Eye, Trash2, Calendar, FileText } from 'lucide-react';

export default function Downloads({ downloadedFiles, onViewFile, onRemoveDownload }) {
  return (
    <div>
      <div className="downloads-header">
        <h2>My Downloaded Documents</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Access your downloaded notes, PYQs, and formula sheets offline.</p>
      </div>

      {downloadedFiles.length > 0 ? (
        <div className="resources-list">
          {downloadedFiles.map((file, index) => (
            <div key={`${file.id}-${index}`} className="resource-item">
              <div className="resource-info">
                <div className="resource-icon-box">
                  <Download size={22} />
                </div>
                <div className="resource-text">
                  <h4 className="resource-title">{file.title}</h4>
                  <span className="resource-meta">
                    Subject: <strong>{file.subjectCode}</strong> | Downloaded: {new Date(file.downloadedAt || Date.now()).toLocaleTimeString()}
                  </span>
                </div>
              </div>
              <div className="resource-actions">
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
                  className="btn btn-secondary" 
                  onClick={() => onRemoveDownload(file.id)}
                  title="Remove from Downloads"
                  style={{ padding: '0.5rem', color: '#ef4444', borderColor: 'var(--border)' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Download size={48} />
          <h3>No downloaded documents yet</h3>
          <p>Explore subjects from the home page and click download to build your offline library.</p>
        </div>
      )}
    </div>
  );
}
