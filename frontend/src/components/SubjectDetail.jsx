import React, { useState } from 'react';
import { ArrowLeft, Eye, Download, FileText, Calendar, BookOpen, AlertCircle, Bookmark } from 'lucide-react';

export default function SubjectDetail({ subject, materials, onBack, onViewFile, onDownloadFile }) {
  const [activeTab, setActiveTab] = useState('papers'); // papers, notes, formulas, topics
  const [activeSubTab, setActiveSubTab] = useState('mid-term-1'); // mid-term-1, mid-term-2, end-term
  const [activeYear, setActiveYear] = useState('2025');

  // Filter materials based on current subject and active tab
  const filteredMaterials = materials.filter(item => {
    if (item.subjectCode !== subject.code) return false;
    if (item.category !== activeTab) return false;
    if (activeTab === 'papers') {
      if (item.subcategory !== activeSubTab) return false;
      if (item.year && activeYear !== 'All' && item.year !== activeYear) return false;
      return true;
    }
    return true;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'papers': return <Calendar size={22} />;
      case 'notes': return <BookOpen size={22} />;
      case 'formulas': return <Bookmark size={22} />;
      case 'topics': return <AlertCircle size={22} />;
      default: return <FileText size={22} />;
    }
  };

  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={18} />
        <span>Back to Subjects</span>
      </button>

      <div className="subject-header-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <h2 className="subject-header-title">{subject.name}</h2>
        <span className="subject-header-code" style={{ alignSelf: 'flex-start', fontSize: '0.9rem', padding: '0.2rem 0.6rem' }}>{subject.code}</span>
        <p style={{ color: 'var(--text-secondary)' }}>Access all syllabus resources in one place.</p>
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'papers' ? 'active' : ''}`}
          onClick={() => setActiveTab('papers')}
        >
          Previous Year Papers & Solutions
        </button>
        <button 
          className={`tab-btn ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
        <button 
          className={`tab-btn ${activeTab === 'formulas' ? 'active' : ''}`}
          onClick={() => setActiveTab('formulas')}
        >
          Formula Sheets
        </button>
        <button 
          className={`tab-btn ${activeTab === 'topics' ? 'active' : ''}`}
          onClick={() => setActiveTab('topics')}
        >
          Important Topics
        </button>
      </div>

      {/* Subtabs for Papers */}
      {activeTab === 'papers' && (
        <div className="subtabs-container">
          <button 
            className={`subtab-btn ${activeSubTab === 'mid-term-1' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('mid-term-1')}
          >
            Mid Term 1
          </button>
        <>
          <div className="subtabs-container">
            <button 
              className={`subtab-btn ${activeSubTab === 'mid-term-1' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('mid-term-1')}
            >
              Mid Term 1
            </button>
            <button 
              className={`subtab-btn ${activeSubTab === 'mid-term-2' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('mid-term-2')}
            >
              Mid Term 2
            </button>
            <button 
              className={`subtab-btn ${activeSubTab === 'end-term' ? 'active' : ''}`}
              onClick={() => setActiveSubTab('end-term')}
            >
              End Term
            </button>
          </div>

          <div className="subtabs-container" style={{ marginTop: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.5rem' }}>Year:</span>
            <button 
              className={`subtab-btn ${activeYear === '2025' ? 'active' : ''}`}
              onClick={() => setActiveYear('2025')}
            >
              2025
            </button>
            <button 
              className={`subtab-btn ${activeYear === '2024' ? 'active' : ''}`}
              onClick={() => setActiveYear('2024')}
            >
              2024
            </button>
            <button 
              className={`subtab-btn ${activeYear === '2023' ? 'active' : ''}`}
              onClick={() => setActiveYear('2023')}
            >
              2023
            </button>
            <button 
              className={`subtab-btn ${activeYear === 'All' ? 'active' : ''}`}
              onClick={() => setActiveYear('All')}
            >
              All
            </button>
          </div>
        </>
      )}

      {/* Resource list */}
      {filteredMaterials.length > 0 ? (
        <div className="resources-list">
          {filteredMaterials.map((file) => (
            <div key={file.id} className="resource-item">
              <div className="resource-info">
                <div className="resource-icon-box">
                  {getCategoryIcon(file.category)}
                </div>
                <div className="resource-text">
                  <h4 className="resource-title">{file.title}</h4>
                  <span className="resource-meta">
                    Added: {new Date(file.uploadedAt).toLocaleDateString()}
                    {file.year && <span style={{ marginLeft: '10px', color: 'var(--accent)' }}>Year: {file.year}</span>}
                  </span>
                </div>
              </div>
              <div className="resource-actions">
                <button 
                  className="btn btn-secondary btn-accent-light" 
                  onClick={() => onViewFile(file)}
                  title="View Document Online"
                  style={{ padding: '0.5rem' }}
                >
                  <Eye size={18} />
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>View Online</span>
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
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No study materials uploaded yet</h3>
          <p>Go to the Admin Panel if you want to upload notes or papers for this subject.</p>
        </div>
      )}
    </div>
  );
}
