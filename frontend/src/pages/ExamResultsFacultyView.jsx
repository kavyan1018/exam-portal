import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Download, CheckCircle2, XCircle, AlertTriangle, Mail, Send } from 'lucide-react';

export default function ExamResultsFacultyView() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emailing, setEmailing] = useState(false);
  const [emailMessage, setEmailMessage] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examRes, resultsRes] = await Promise.all([
          api.get(`/api/v1/faculty/exams/${examId}`),
          api.get(`/api/v1/faculty/exams/${examId}/results`),
        ]);
        setExam(examRes.data);
        setResults(resultsRes.data);
      } catch (err) {
        console.error("Failed to load results", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [examId]);

  const handleEmailResults = async () => {
    if (!window.confirm("Do you want to evaluate and email official scorecards to all completed students?")) return;
    setEmailing(true);
    setEmailMessage('');

    try {
      const res = await api.post(`/api/v1/faculty/exams/${examId}/release-and-email-results`);
      setEmailMessage(res.data.message);
    } catch (err) {
      alert("Failed to dispatch emails");
    } finally {
      setEmailing(false);
    }
  };

  const exportCsv = () => {
    if (results.length === 0) return;

    const headers = ['Student Name', 'Batch Name', 'Status', 'Score', 'Total Marks', 'Passing Marks', 'Result', 'Correct Answers', 'Incorrect Answers', 'Violations Logged'];
    const rows = results.map(r => [
      `"${r.studentName}"`,
      `"${r.studentId || ''}"`,
      r.status,
      r.score,
      r.totalMarks,
      r.passMarks,
      r.passed ? 'PASS' : 'FAIL',
      r.correctAnswers,
      r.incorrectAnswers,
      r.violationCount,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GradeSheet_${exam?.title.replace(/[^a-zA-Z0-9]/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container">
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Faculty Console
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Assessment Grade Sheet</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{exam?.title}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={handleEmailResults}
              disabled={emailing || results.length === 0}
              className="btn btn-secondary btn-sm"
              style={{ borderColor: '#16a34a', color: '#16a34a' }}
            >
              <Mail size={15} />
              <span>{emailing ? 'Emailing Scorecards...' : 'Auto-Grade & Email to Students'}</span>
            </button>
            <button onClick={exportCsv} disabled={results.length === 0} className="btn btn-primary btn-sm">
              <Download size={15} />
              <span>Export CSV Grade Sheet</span>
            </button>
          </div>
        </div>
      </div>

      {emailMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{emailMessage}</span>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Generating marksheet...</div>
      ) : results.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <h3>No Submissions Yet</h3>
          <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>Completed student scores will populate here automatically upon submission.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.8rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '1rem' }}>Student Name</th>
                  <th style={{ padding: '1rem' }}>Batch Name</th>
                  <th style={{ padding: '1rem' }}>Score</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>Correct / Total</th>
                  <th style={{ padding: '1rem' }}>Violations</th>
                  <th style={{ padding: '1rem' }}>Submission Time</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attemptId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#0f172a' }}>{r.studentName}</td>
                    <td style={{ padding: '1rem', color: '#64748b' }}>{r.studentId || '-'}</td>
                    <td style={{ padding: '1rem', fontWeight: 700, fontSize: '1rem' }}>
                      {r.score} <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>/ {r.totalMarks}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${r.passed ? 'badge-success' : 'badge-danger'}`}>
                        {r.status === 'DISQUALIFIED' ? 'DISQUALIFIED' : r.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: '#16a34a', fontWeight: 600 }}>{r.correctAnswers}</span> / {r.totalQuestions}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: r.violationCount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {r.violationCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.825rem', color: '#64748b' }}>
                      {r.submittedAt ? new Date(r.submittedAt).toLocaleString() : 'In Progress'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
