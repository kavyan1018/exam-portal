import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';
import { BookOpen, Clock, AlertTriangle, Shield, CheckCircle2, ChevronRight, Eye, Lock } from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExam, setSelectedExam] = useState(null);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/api/v1/student/exams');
      setExams(res.data);
    } catch (err) {
      console.error("Failed to load exams", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (exam) => {
    // Attempt fullscreen request as part of user gesture
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request bypassed or deferred to exam entry", e);
    }
    navigate(`/student/exam/${exam.id}`);
  };

  return (
    <div className="container">
      {/* Student Welcome Header */}
      <div className="card" style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>Welcome, {user?.fullName}!</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Batch Name: <strong style={{ color: '#0f172a' }}>{user?.studentId || 'N/A'}</strong> | Email: {user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#eff6ff', padding: '0.5rem 1rem', borderRadius: '8px', color: '#1e40af', fontSize: '0.85rem' }}>
          <Shield size={18} />
          <span>Proctored Assessment Session Active</span>
        </div>
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
        Available & Scheduled Exams
      </h2>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading available assessments...
        </div>
      ) : exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <BookOpen size={40} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
          <h3>No Active Exams Right Now</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Your instructors have not scheduled any live exams at this moment. Check back later.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {exams.map((exam) => (
            <div key={exam.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', borderTop: '4px solid #2563eb' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-primary">MCQ Assessment</span>
                  {exam.locked ? (
                    <span className="badge badge-danger" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={12} />
                      LOCKED
                    </span>
                  ) : (
                    <span className="badge badge-success">Live</span>
                  )}
                </div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                  {exam.title}
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem', minHeight: '38px', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                  {exam.description || 'No additional instructions provided.'}
                </p>

                <div style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.825rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Duration:</span>
                    <strong>{exam.durationMinutes} Minutes</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Total Marks:</span>
                    <strong>{exam.totalMarks} Marks</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748b' }}>Negative Marking:</span>
                    <strong style={{ color: exam.negativeMarkPerQuestion > 0 ? '#dc2626' : '#16a34a' }}>
                      {exam.negativeMarkPerQuestion > 0 ? `-${exam.negativeMarkPerQuestion} mark / incorrect` : 'None'}
                    </strong>
                  </div>
                </div>
              </div>

              {exam.locked ? (
                <button
                  disabled
                  className="btn btn-secondary"
                  style={{ width: '100%', opacity: 0.7 }}
                >
                  <Lock size={16} />
                  <span>Locked by Administrator</span>
                </button>
              ) : (
                <button
                  onClick={() => setSelectedExam(exam)}
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                >
                  <span>View Instructions & Take Exam</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions Modal */}
      {selectedExam && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '0.5rem', color: '#0f172a' }}>
              Exam Instructions & Integrity Rules
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
              Please read carefully before entering the proctored test environment for <strong>{selectedExam.title}</strong>.
            </p>

            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#b45309', fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <AlertTriangle size={18} />
                <span>Strict Anti-Cheating Environment Active</span>
              </div>
              <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: '#78350f', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <li><strong>Fullscreen Mode:</strong> The exam will occupy your entire screen. Exiting full-screen is counted as a violation.</li>
                <li><strong>Tab & Window Tracking:</strong> Switching browser tabs, minimizing the window, or opening other apps is immediately logged.</li>
                <li><strong>Allowed Violations:</strong> You have a maximum of <strong>{selectedExam.maxViolationsAllowed} violations</strong> before the exam is automatically disqualified and terminated.</li>
                <li><strong>Webcam Monitoring:</strong> Periodic snapshots will be captured to verify identity and presence.</li>
                <li><strong>Authoritative Timer:</strong> The timer runs on the institute server. Answers are automatically persisted every few seconds.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setSelectedExam(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={() => handleStartExam(selectedExam)} className="btn btn-primary">
                I Agree & Enter Secure Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
