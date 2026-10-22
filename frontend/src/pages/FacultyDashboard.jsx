import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { PlusCircle, FileText, Users, BarChart3, HelpCircle, Calendar, Clock } from 'lucide-react';

export default function FacultyDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const res = await api.get('/api/v1/faculty/exams');
      setExams(res.data);
    } catch (err) {
      console.error("Failed to load faculty exams", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Faculty Management Console</h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Author MCQ exams, monitor active student sessions in real time, and audit results.
          </p>
        </div>
        <Link to="/faculty/exam/create" className="btn btn-primary">
          <PlusCircle size={18} />
          <span>Create New Exam</span>
        </Link>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
          Loading your exam portfolio...
        </div>
      ) : exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <FileText size={44} style={{ margin: '0 auto 1rem', opacity: 0.4 }} />
          <h3>No Exams Created Yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Get started by authoring your first proctored MCQ assessment.</p>
          <Link to="/faculty/exam/create" className="btn btn-primary">
            Create Exam
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {exams.map((exam) => (
            <div key={exam.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 360px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>{exam.title}</h3>
                  <span className={`badge ${exam.status === 'PUBLISHED' ? 'badge-success' : 'badge-gray'}`}>
                    {exam.status}
                  </span>
                </div>
                <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  {exam.description || 'No description provided.'}
                </p>
                <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.825rem', color: '#475569', flexWrap: 'wrap' }}>
                  <span><Clock size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{exam.durationMinutes} Mins</span>
                  <span><HelpCircle size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} />{exam.questionCount} Questions</span>
                  <span>Total Marks: <strong>{exam.totalMarks}</strong></span>
                  <span>Pass: <strong>{exam.passMarks}</strong></span>
                  {exam.negativeMarkPerQuestion > 0 && (
                    <span style={{ color: '#dc2626' }}>Neg: -{exam.negativeMarkPerQuestion}</span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/faculty/exam/${exam.id}/questions`} className="btn btn-secondary btn-sm">
                  <HelpCircle size={15} />
                  <span>Questions ({exam.questionCount})</span>
                </Link>
                <Link to={`/faculty/exam/${exam.id}/monitor`} className="btn btn-secondary btn-sm" style={{ color: '#2563eb' }}>
                  <Users size={15} />
                  <span>Live Monitor</span>
                </Link>
                <Link to={`/faculty/exam/${exam.id}/results`} className="btn btn-secondary btn-sm">
                  <BarChart3 size={15} />
                  <span>Results</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
