import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { X, ShieldAlert, Camera, Clock, AlertTriangle } from 'lucide-react';

export default function AttemptProctoringLogsModal({ attempt, onClose }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/api/v1/faculty/exams/attempts/${attempt.attemptId}/proctoring-logs`);
        setLogs(res.data);
      } catch (err) {
        console.error("Failed to load proctoring logs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [attempt.attemptId]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '720px', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
              Proctoring Audit: {attempt.studentName}
            </h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              Batch: {attempt.rollNumber || 'General'} | Total Violations: <strong style={{ color: attempt.violationCount > 0 ? '#dc2626' : '#16a34a' }}>{attempt.violationCount}</strong>
            </span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={22} />
          </button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading incident logs & snapshots...</p>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#16a34a' }}>
              <p>✓ No suspicious events or violations were logged during this exam attempt.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {logs.map((log) => {
                const isViolation = log.eventType !== 'WEBCAM_SNAPSHOT';
                const timeStr = new Date(log.loggedAt).toLocaleTimeString();

                return (
                  <div
                    key={log.id}
                    style={{
                      padding: '1rem',
                      borderRadius: '8px',
                      background: isViolation ? '#fef2f2' : '#f8fafc',
                      border: `1px solid ${isViolation ? '#fecaca' : '#e2e8f0'}`,
                      display: 'flex',
                      gap: '1rem',
                    }}
                  >
                    <div style={{ color: isViolation ? '#dc2626' : '#2563eb', flexShrink: 0 }}>
                      {isViolation ? <AlertTriangle size={22} /> : <Camera size={22} />}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <strong style={{ color: isViolation ? '#991b1b' : '#1e293b', fontSize: '0.9rem' }}>
                          {log.eventType.replace('_', ' ')}
                        </strong>
                        <span style={{ fontSize: '0.775rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Clock size={12} /> {timeStr}
                        </span>
                      </div>

                      <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: log.snapshotPath ? '0.5rem' : 0 }}>
                        {log.details || 'System event captured'}
                      </p>

                      {log.snapshotPath && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>Webcam Snapshot:</span>
                          <img
                            src={log.snapshotPath}
                            alt="Proctor Snapshot"
                            style={{ width: '160px', height: '120px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
