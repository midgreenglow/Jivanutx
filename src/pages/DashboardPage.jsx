import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardPage.css';

const TOKEN_KEY = 'jivanu_token';

const DOC_TYPES = [
  { value: 'blood_report', label: 'Blood Report' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'scan', label: 'Scan / Imaging' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'vaccination', label: 'Vaccination Record' },
  { value: 'other', label: 'Other' }
];

const DOC_TYPE_ICONS = {
  blood_report: '🩸',
  prescription: '💊',
  scan: '🔬',
  discharge_summary: '🏥',
  vaccination: '💉',
  other: '📄'
};

function formatDate(str) {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem(TOKEN_KEY)}` };
}

// ── Upload Modal ──────────────────────────────────────────────────────────────

function UploadModal({ onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('blood_report');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) { setError('Please select a file'); return; }
    if (!title.trim()) { setError('Please enter a title'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title.trim());
      fd.append('doc_type', docType);
      fd.append('description', description);
      const res = await fetch('/api/documents/upload', { method: 'POST', headers: authHeaders(), body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Upload failed'); return; }
      onUploaded(data.document);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>Upload Document</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            Document Title
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. CBC Report — May 2025" required />
          </label>
          <label>
            Document Type
            <select value={docType} onChange={(e) => setDocType(e.target.value)}>
              {DOC_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label>
            Notes (optional)
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Any notes about this document…" rows={2} />
          </label>
          <label className="file-label">
            File (PDF or image, max 25 MB)
            <div className="file-drop" onClick={() => fileRef.current?.click()}>
              {file ? (
                <span className="file-chosen">📎 {file.name}</span>
              ) : (
                <span>Click to choose or drag & drop</span>
              )}
              <input ref={fileRef} type="file" accept=".pdf,image/*" onChange={(e) => setFile(e.target.files[0])} style={{ display: 'none' }} />
            </div>
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Uploading…' : 'Upload'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Edit Profile Modal ────────────────────────────────────────────────────────

function ProfileModal({ user, onClose, onSaved }) {
  const [name, setName] = useState(user.name || '');
  const [dob, setDob] = useState(user.dob || '');
  const [bloodGroup, setBloodGroup] = useState(user.blood_group || '');
  const [phone, setPhone] = useState(user.phone || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/me', {
        method: 'PUT',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, dob, blood_group: bloodGroup, phone })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Failed to save'); return; }
      onSaved(data.user);
    } catch {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h3>Edit Profile</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="upload-form">
          <label>
            Full Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </label>
          <label>
            Date of Birth
            <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </label>
          <label>
            Blood Group
            <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="">Select</option>
              {['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </label>
          {error && <p className="form-error">{error}</p>}
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>{loading ? 'Saving…' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Document Card ─────────────────────────────────────────────────────────────

function DocCard({ doc, onDelete }) {
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const isReport = doc.source === 'reports';

  async function handleDelete() {
    if (!confirming) { setConfirming(true); return; }
    setDeleting(true);
    try {
      const endpoint = isReport ? `/api/reports?id=${doc.id}` : `/api/documents/${doc.id}`;
      const res = await fetch(endpoint, { method: 'DELETE', headers: authHeaders() });
      if (res.ok) onDelete(doc.id, isReport);
    } finally {
      setDeleting(false);
      setConfirming(false);
    }
  }

  return (
    <div className="doc-card">
      <div className="doc-icon">{DOC_TYPE_ICONS[doc.doc_type] || '📄'}</div>
      <div className="doc-info">
        <div className="doc-title">{doc.title}</div>
        <div className="doc-meta">
          <span className={`doc-type-badge type-${doc.doc_type}`}>{DOC_TYPES.find((t) => t.value === doc.doc_type)?.label || 'Report'}</span>
          <span className="doc-date">{formatDate(doc.uploaded_at)}</span>
        </div>
        {doc.description && <div className="doc-desc">{doc.description}</div>}
      </div>
      <div className="doc-actions">
        <a href={doc.url} target="_blank" rel="noreferrer" className="doc-btn view-btn" title="View">View</a>
        <button
          className={`doc-btn delete-btn ${confirming ? 'confirming' : ''}`}
          onClick={handleDelete}
          disabled={deleting}
          title={confirming ? 'Tap again to confirm' : 'Delete'}
        >
          {deleting ? '…' : confirming ? 'Confirm?' : 'Delete'}
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [legacyReports, setLegacyReports] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [docFilter, setDocFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { navigate('/signin'); return; }
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    try {
      const [meRes, docsRes, repsRes] = await Promise.all([
        fetch('/api/me', { headers: authHeaders() }),
        fetch('/api/documents', { headers: authHeaders() }),
        fetch('/api/reports', { headers: authHeaders() })
      ]);
      if (meRes.status === 401) { navigate('/signin'); return; }
      const [meData, docsData, repsData] = await Promise.all([meRes.json(), docsRes.json(), repsRes.json()]);
      setUser(meData.user);
      setDocuments(docsData.documents || []);
      setLegacyReports(repsData.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  function handleUploaded(doc) {
    setDocuments((prev) => [{ ...doc }, ...prev]);
    setShowUpload(false);
  }

  function handleDelete(id, isReport) {
    if (isReport) setLegacyReports((prev) => prev.filter((r) => r.id !== id));
    else setDocuments((prev) => prev.filter((d) => d.id !== id));
  }

  const allDocs = [
    ...documents,
    ...legacyReports.map((r) => ({ ...r, source: 'reports', doc_type: 'blood_report' }))
  ];

  const filteredDocs = docFilter === 'all' ? allDocs : allDocs.filter((d) => d.doc_type === docFilter);
  const bloodReports = allDocs.filter((d) => d.doc_type === 'blood_report');

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.email || '?')[0].toUpperCase();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading your health dashboard…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      {/* Sidebar */}
      <aside className="dash-sidebar">
        <div className="patient-card">
          <div className="patient-avatar">{initials}</div>
          <div className="patient-name">{user?.name || 'Patient'}</div>
          <div className="patient-email">{user?.email || user?.phone}</div>
          <div className="patient-meta-row">
            {user?.blood_group && <span className="meta-pill blood">{user.blood_group}</span>}
            {user?.dob && <span className="meta-pill">{formatDate(user.dob)}</span>}
          </div>
          <button className="edit-profile-btn" onClick={() => setShowProfile(true)}>Edit Profile</button>
        </div>

        <nav className="dash-nav">
          {[
            { id: 'overview', icon: '⊞', label: 'Overview' },
            { id: 'blood', icon: '🩸', label: 'Blood Reports' },
            { id: 'documents', icon: '📁', label: 'All Documents' }
          ].map((tab) => (
            <button
              key={tab.id}
              className={`dash-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="nav-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <button className="upload-fab-sidebar" onClick={() => setShowUpload(true)}>
          + Upload Document
        </button>
      </aside>

      {/* Main content */}
      <main className="dash-main">
        {/* Overview */}
        {activeTab === 'overview' && (
          <section className="dash-section">
            <h2 className="dash-heading">Health Overview</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-num">{allDocs.length}</div>
                <div className="stat-label">Total Documents</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{bloodReports.length}</div>
                <div className="stat-label">Blood Reports</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{documents.filter((d) => d.doc_type === 'prescription').length}</div>
                <div className="stat-label">Prescriptions</div>
              </div>
              <div className="stat-card">
                <div className="stat-num">{documents.filter((d) => d.doc_type === 'scan').length}</div>
                <div className="stat-label">Scans</div>
              </div>
            </div>

            <h3 className="section-subheading">Recent Documents</h3>
            {allDocs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No documents uploaded yet.</p>
                <button className="btn-primary" onClick={() => setShowUpload(true)}>Upload your first document</button>
              </div>
            ) : (
              <div className="doc-list">
                {allDocs.slice(0, 5).map((doc) => (
                  <DocCard key={`${doc.source || 'doc'}-${doc.id}`} doc={doc} onDelete={handleDelete} />
                ))}
                {allDocs.length > 5 && (
                  <button className="see-all-btn" onClick={() => setActiveTab('documents')}>
                    See all {allDocs.length} documents →
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Blood Reports tab */}
        {activeTab === 'blood' && (
          <section className="dash-section">
            <div className="section-header">
              <h2 className="dash-heading">Blood Reports</h2>
              <button className="btn-primary small" onClick={() => setShowUpload(true)}>+ Upload</button>
            </div>
            {bloodReports.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🩸</div>
                <p>No blood reports found.</p>
                <button className="btn-primary" onClick={() => setShowUpload(true)}>Upload a blood report</button>
              </div>
            ) : (
              <div className="doc-list">
                {bloodReports.map((doc) => (
                  <DocCard key={`${doc.source || 'doc'}-${doc.id}`} doc={doc} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* All Documents tab */}
        {activeTab === 'documents' && (
          <section className="dash-section">
            <div className="section-header">
              <h2 className="dash-heading">All Documents</h2>
              <button className="btn-primary small" onClick={() => setShowUpload(true)}>+ Upload</button>
            </div>
            <div className="filter-bar">
              <button className={`filter-chip ${docFilter === 'all' ? 'active' : ''}`} onClick={() => setDocFilter('all')}>All</button>
              {DOC_TYPES.map((t) => (
                <button key={t.value} className={`filter-chip ${docFilter === t.value ? 'active' : ''}`} onClick={() => setDocFilter(t.value)}>
                  {DOC_TYPE_ICONS[t.value]} {t.label}
                </button>
              ))}
            </div>
            {filteredDocs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <p>{docFilter === 'all' ? 'No documents uploaded yet.' : `No ${DOC_TYPES.find((t) => t.value === docFilter)?.label} found.`}</p>
                <button className="btn-primary" onClick={() => setShowUpload(true)}>Upload document</button>
              </div>
            ) : (
              <div className="doc-list">
                {filteredDocs.map((doc) => (
                  <DocCard key={`${doc.source || 'doc'}-${doc.id}`} doc={doc} onDelete={handleDelete} />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onUploaded={handleUploaded} />}
      {showProfile && user && (
        <ProfileModal
          user={user}
          onClose={() => setShowProfile(false)}
          onSaved={(updated) => { setUser(updated); setShowProfile(false); }}
        />
      )}
    </div>
  );
}
