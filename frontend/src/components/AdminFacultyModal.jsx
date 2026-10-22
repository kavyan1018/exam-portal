import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { X, UserPlus, Trash2, ShieldCheck, Mail, UserCheck } from 'lucide-react';

export default function AdminFacultyModal({ onClose }) {
  const [facultyList, setFacultyList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '', // Faculty ID / Department code
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      const res = await api.get('/api/v1/admin/faculty');
      setFacultyList(res.data);
    } catch (err) {
      console.error("Failed to load faculty members", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFaculty = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await api.post('/api/v1/admin/faculty', {
        ...form,
        role: 'ROLE_FACULTY',
      });
      setSuccess(`Faculty account created for ${form.fullName}!`);
      setForm({ fullName: '', email: '', password: '', studentId: '' });
      fetchFaculty();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add faculty member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFaculty = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove faculty account: ${name}?`)) return;
    try {
      await api.delete(`/api/v1/admin/faculty/${id}`);
      fetchFaculty();
    } catch (err) {
      alert("Failed to remove faculty member");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '820px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={26} color="#dc2626" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Admin Portal: Faculty Access Management
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Only you (Admin) can authorize and provision new faculty examiner accounts.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {/* Add Faculty Form */}
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={18} color="#2563eb" />
              <span>Create New Faculty Account</span>
            </h4>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            {success && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
                {success}
              </div>
            )}

            <form onSubmit={handleAddFaculty}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="e.g. Dr. Ramesh Kumar"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Official Email *</label>
                  <input
                    type="email"
                    required
                    className="form-input"
                    placeholder="e.g. ramesh@college.edu"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Faculty ID / Dept Code</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. FAC-CS-02"
                    value={form.studentId}
                    onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                  />
                </div>

                <div>
                  <label className="form-label">Initial Password * (min 6 chars)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="form-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <button type="submit" disabled={submitting} className="btn btn-primary btn-sm">
                  <UserPlus size={15} />
                  <span>{submitting ? 'Creating...' : 'Authorize & Create Faculty'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Existing Faculty List */}
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem' }}>
            Authorized Faculty Members ({facultyList.length})
          </h4>

          {loading ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Loading faculty directory...</p>
          ) : facultyList.length === 0 ? (
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>No faculty accounts added yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {facultyList.map((fac) => (
                <div
                  key={fac.id}
                  style={{
                    background: 'white',
                    border: '1px solid #e2e8f0',
                    padding: '0.85rem 1rem',
                    borderRadius: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <strong style={{ color: '#0f172a', fontSize: '0.95rem' }}>{fac.fullName}</strong>
                    <div style={{ fontSize: '0.825rem', color: '#64748b', display: 'flex', gap: '1rem', marginTop: '2px' }}>
                      <span>Email: {fac.email}</span>
                      <span>ID: {fac.studentId || 'N/A'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteFaculty(fac.id, fac.fullName)}
                    className="btn btn-danger btn-sm"
                    title="Revoke faculty access"
                  >
                    <Trash2 size={14} />
                    <span>Revoke</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
