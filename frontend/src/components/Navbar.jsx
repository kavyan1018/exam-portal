import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, User, Server } from 'lucide-react';
import api from '../api/client';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [serverStatus, setServerStatus] = useState('checking'); // 'checking', 'online', 'waking'

  useEffect(() => {
    let isMounted = true;
    const checkServerHealth = async () => {
      try {
        await api.get('/api/v1/health', { timeout: 4000 });
        if (isMounted) setServerStatus('online');
      } catch (err) {
        if (isMounted) setServerStatus('waking');
      }
    };
    checkServerHealth();
    const interval = setInterval(checkServerHealth, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {serverStatus === 'waking' && (
        <div style={{ background: '#fef3c7', color: '#92400e', padding: '6px 16px', fontSize: '13px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderBottom: '1px solid #fde68a' }}>
          <Server size={15} className="animate-spin" />
          <span>Connecting to secure backend server (waking up free cloud instance, please allow a few moments)...</span>
        </div>
      )}
      <header className="navbar">
        <Link to="/" className="navbar-brand">
          <ShieldCheck size={28} color="#2563eb" />
          <span>ExamPortal Secure</span>
        </Link>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
              <User size={18} color="#64748b" />
              <span style={{ fontWeight: 600 }}>{user.fullName}</span>
              <span className={`badge ${user.role === 'ROLE_FACULTY' ? 'badge-primary' : 'badge-gray'}`}>
                {user.role === 'ROLE_FACULTY' ? 'Faculty' : 'Student'}
              </span>
            </div>
            <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Log out">
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </header>
    </>
  );
}
