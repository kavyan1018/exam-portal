import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Save, AlertCircle } from 'lucide-react';

export default function CreateExamView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default to today and 7 days later
  const now = new Date();
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const formatIsoForInput = (d) => d.toISOString().slice(0, 16);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startWindow: formatIsoForInput(now),
    endWindow: formatIsoForInput(nextWeek),
    durationMinutes: 30,
    passMarks: 10,
    negativeMarkPerQuestion: 0,
    randomizeQuestions: true,
    randomizeOptions: true,
    maxViolationsAllowed: 3,
    enableWebcam: true,
    status: 'PUBLISHED',
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...form,
        durationMinutes: parseInt(form.durationMinutes),
        passMarks: parseFloat(form.passMarks),
        negativeMarkPerQuestion: parseFloat(form.negativeMarkPerQuestion),
        maxViolationsAllowed: parseInt(form.maxViolationsAllowed),
      };
      const res = await api.post('/api/v1/faculty/exams', payload);
      navigate(`/faculty/exam/${res.data.id}/questions`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Faculty Console
        </Link>
        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Author New MCQ Examination</h1>
      </div>

      <div className="card">
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Exam Title *</label>
            <input
              type="text"
              name="title"
              required
              className="form-input"
              placeholder="e.g. Mid-Term Assessment: Computer Networks (CS402)"
              value={form.title}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Instructions / Description</label>
            <textarea
              name="description"
              rows={3}
              className="form-textarea"
              placeholder="Provide exam rules, topics covered, and guidelines for students..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Window Opens (Start) *</label>
              <input
                type="datetime-local"
                name="startWindow"
                required
                className="form-input"
                value={form.startWindow}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Window Closes (End) *</label>
              <input
                type="datetime-local"
                name="endWindow"
                required
                className="form-input"
                value={form.endWindow}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Duration (Minutes) *</label>
              <input
                type="number"
                name="durationMinutes"
                min="1"
                required
                className="form-input"
                value={form.durationMinutes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Passing Marks</label>
              <input
                type="number"
                step="0.5"
                name="passMarks"
                className="form-input"
                value={form.passMarks}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Negative Mark / Wrong Answer</label>
              <input
                type="number"
                step="0.25"
                name="negativeMarkPerQuestion"
                className="form-input"
                placeholder="0 for none"
                value={form.negativeMarkPerQuestion}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '8px', border: '1px solid #e2e8f0', margin: '1.25rem 0' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem' }}>
              Security & Anti-Cheating Settings
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', fontSize: '0.9rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="enableWebcam"
                  checked={form.enableWebcam}
                  onChange={handleChange}
                />
                <span>Enable Webcam Proctoring Snapshots</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="randomizeQuestions"
                  checked={form.randomizeQuestions}
                  onChange={handleChange}
                />
                <span>Randomize Question Order per Student</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  name="randomizeOptions"
                  checked={form.randomizeOptions}
                  onChange={handleChange}
                />
                <span>Randomize Answer Choices (A, B, C, D)</span>
              </label>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#475569' }}>Max Allowed Violations:</span>
                <input
                  type="number"
                  name="maxViolationsAllowed"
                  min="1"
                  max="10"
                  className="form-input"
                  style={{ width: '70px', padding: '0.35rem' }}
                  value={form.maxViolationsAllowed}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Publishing Status</label>
            <select
              name="status"
              className="form-select"
              value={form.status}
              onChange={handleChange}
            >
              <option value="PUBLISHED">Published (Visible to Students)</option>
              <option value="DRAFT">Draft (Under Preparation)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to="/faculty" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={loading} className="btn btn-primary">
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Create & Add Questions'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
