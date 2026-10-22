import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'ROLE_FACULTY' || user.role === 'ROLE_ADMIN') {
        navigate('/faculty');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'kavyan') {
      setEmail('kavvyanfaculty@gmail.com');
      setPassword('kavyan@faculty22');
    } else if (role === 'student') {
      setEmail('student@college.edu');
      setPassword('Student@123');
    } else {
      setEmail('faculty@college.edu');
      setPassword('Faculty@123');
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: '#eff6ff', borderRadius: '50%', color: '#2563eb', marginBottom: '1rem' }}>
            <ShieldCheck size={36} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Sign in to Exam Portal</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Enter your institutional credentials to continue
          </p>
        </div>

        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '0.75rem', borderRadius: '6px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. student@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              required
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #e2e8f0' }}>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>QUICK LOGIN SHORTCUTS:</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <button type="button" onClick={() => fillDemo('kavyan')} className="btn btn-secondary btn-sm" style={{ fontWeight: 700, color: '#dc2626' }}>
              Kavyan (Admin)
            </button>
            <button type="button" onClick={() => fillDemo('faculty')} className="btn btn-secondary btn-sm">
              Faculty Demo
            </button>
            <button type="button" onClick={() => fillDemo('student')} className="btn btn-secondary btn-sm">
              Student Demo
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: '#64748b', marginTop: '1.5rem' }}>
          Don't have an account? <Link to="/register" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>Register as Student</Link>
        </p>
      </div>
    </div>
  );
}
