import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import AttemptProctoringLogsModal from '../components/AttemptProctoringLogsModal';
import { ArrowLeft, Users, RefreshCw, ShieldAlert, Eye, Clock } from 'lucide-react';

export default function LiveMonitorView() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAttempt, setSelectedAttempt] = useState(null);

  useEffect(() => {
    fetchExamInfo();
    fetchLiveAttempts();
    const interval = setInterval(fetchLiveAttempts, 4000); // 4-second live polling
    return () => clearInterval(interval);
  }, [examId]);

  const fetchExamInfo = async () => {
    try {
      const res = await api.get(`/api/v1/faculty/exams/${examId}`);
      setExam(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLiveAttempts = async () => {
    try {
      const res = await api.get(`/api/v1/faculty/exams/${examId}/monitor`);
      setAttempts(res.data);
    } catch (err) {
      console.error("Live monitor fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  const formatRemaining = (seconds) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Faculty Console
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Live Student Proctor Monitor</h1>
              <span className="badge badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }} />
                LIVE SYNC
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{exam?.title}</p>
          </div>
          <Link to={`/faculty/exam/${examId}/results`} className="btn btn-secondary btn-sm">
            View Grade Sheet →
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Connecting to live exam stream...</div>
      ) : attempts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <Users size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No Student Attempts Yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>When enrolled students start this exam, their live progress, time remaining, and webcam proctor logs will appear here instantly.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Student / Roll No</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Time Remaining</th>
                  <th style={{ padding: '1rem' }}>Answered</th>
                  <th style={{ padding: '1rem' }}>Violations</th>
                  <th style={{ padding: '1rem' }}>Current Score</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((att) => {
                  const isDisqualified = att.status === 'DISQUALIFIED';
                  const isInProgress = att.status === 'IN_PROGRESS';

                  return (
                    <tr key={att.attemptId} style={{ borderBottom: '1px solid #f1f5f9', background: isDisqualified ? '#fef2f2' : 'white' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{att.studentName}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{att.rollNumber || att.studentEmail}</div>
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${
                          isDisqualified ? 'badge-danger' :
                          isInProgress ? 'badge-primary' : 'badge-success'
                        }`}>
                          {att.status.replace('_', ' ')}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontFamily: 'monospace', fontWeight: 600 }}>
                        {isInProgress ? (
                          <span style={{ color: att.remainingSeconds < 300 ? '#dc2626' : '#0f172a' }}>
                            {formatRemaining(att.remainingSeconds)}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>Finished</span>
                        )}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <strong>{att.answeredQuestions}</strong> / {exam?.questionCount || '-'}
                      </td>

                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          color: att.violationCount > 0 ? '#dc2626' : '#16a34a',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          {att.violationCount > 0 && <ShieldAlert size={15} />}
                          {att.violationCount} / {exam?.maxViolationsAllowed || 3}
                        </span>
                      </td>

                      <td style={{ padding: '1rem', fontWeight: 700 }}>
                        {isInProgress ? 'Pending Submit' : `${att.score} Marks`}
                      </td>

                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedAttempt(att)}
                          className="btn btn-secondary btn-sm"
                        >
                          <Eye size={14} />
                          <span>Audit Logs</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedAttempt && (
        <AttemptProctoringLogsModal
          attempt={selectedAttempt}
          onClose={() => setSelectedAttempt(null)}
        />
      )}
    </div>
  );
}
