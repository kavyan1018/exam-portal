import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import {
  ArrowLeft,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Send,
  Sparkles,
  Eye,
  Check,
  Save,
  X
} from 'lucide-react';

export default function ExamResultsFacultyView() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [evaluatingAll, setEvaluatingAll] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Selected attempt for detailed AI review modal
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [evaluationDetails, setEvaluationDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [savingMark, setSavingMark] = useState(null);

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

  useEffect(() => {
    fetchData();
  }, [examId]);

  // Evaluate All with AI
  const handleEvaluateAllAi = async () => {
    if (!window.confirm("Run AI evaluation across all student submissions for this exam? AI will grade all short answers, output predictions, and coding solutions.")) return;
    setEvaluatingAll(true);
    setStatusMessage('');

    try {
      const res = await api.post(`/api/v1/faculty/exams/${examId}/evaluate-all-ai`);
      setStatusMessage(res.data.message || "AI auto-evaluation completed successfully.");
      await fetchData();
    } catch (err) {
      alert("Failed to run AI evaluation: " + (err.response?.data?.message || err.message));
    } finally {
      setEvaluatingAll(false);
    }
  };

  // Publish Results to Students
  const handlePublishResults = async () => {
    if (!window.confirm("Publish official results to all students? Students will immediately be able to view their verified scores and AI feedback.")) return;
    setPublishing(true);
    setStatusMessage('');

    try {
      const res = await api.post(`/api/v1/faculty/exams/${examId}/publish-results`);
      setStatusMessage(res.data.message || "Results successfully published to students.");
      await fetchData();
    } catch (err) {
      alert("Failed to publish results: " + (err.response?.data?.message || err.message));
    } finally {
      setPublishing(false);
    }
  };

  // Open detailed attempt modal
  const handleOpenAttemptDetails = async (attempt) => {
    setSelectedAttempt(attempt);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/api/v1/faculty/exams/attempts/${attempt.attemptId}/evaluation-details`);
      setEvaluationDetails(res.data);
    } catch (err) {
      alert("Failed to load evaluation details.");
    } finally {
      setLoadingDetails(false);
    }
  };

  // Single attempt AI evaluation
  const handleEvaluateSingleAttempt = async (attemptId) => {
    try {
      await api.post(`/api/v1/faculty/exams/attempts/${attemptId}/evaluate-ai`);
      const res = await api.get(`/api/v1/faculty/exams/attempts/${attemptId}/evaluation-details`);
      setEvaluationDetails(res.data);
      await fetchData();
    } catch (err) {
      alert("AI evaluation failed.");
    }
  };

  // Update mark for a single question
  const handleSaveQuestionMark = async (questionId, marks, feedback) => {
    setSavingMark(questionId);
    try {
      await api.post(`/api/v1/faculty/exams/attempts/${selectedAttempt.attemptId}/update-marks`, {
        questionId,
        marks,
        feedback
      });
      const res = await api.get(`/api/v1/faculty/exams/attempts/${selectedAttempt.attemptId}/evaluation-details`);
      setEvaluationDetails(res.data);
      await fetchData();
    } catch (err) {
      alert("Failed to update mark.");
    } finally {
      setSavingMark(null);
    }
  };

  const exportCsv = () => {
    if (results.length === 0) return;

    const headers = ['Student Name', 'Batch Name', 'Status', 'Score', 'Total Marks', 'Passing Marks', 'Result', 'Published', 'AI Evaluated', 'Correct Answers', 'Incorrect Answers', 'Violations Logged'];
    const rows = results.map(r => [
      `"${r.studentName}"`,
      `"${r.studentId || ''}"`,
      r.status,
      r.score,
      r.totalMarks,
      r.passMarks,
      r.passed ? 'PASS' : 'FAIL',
      r.resultPublished ? 'YES' : 'PENDING',
      r.aiEvaluated ? 'YES' : 'NO',
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
    <div className="container" style={{ maxWidth: '1100px', paddingBottom: '3rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Faculty Console
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>Assessment Grade Sheet & AI Evaluation</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>{exam?.title}</p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {/* AI AUTO CHECK ALL */}
            <button
              onClick={handleEvaluateAllAi}
              disabled={evaluatingAll || results.length === 0}
              className="btn btn-primary btn-sm"
              style={{ background: '#7c3aed', borderColor: '#6d28d9' }}
            >
              <Sparkles size={15} />
              <span>{evaluatingAll ? 'Evaluating with AI...' : 'Check All Answers with AI'}</span>
            </button>

            {/* PUBLISH RESULTS */}
            <button
              onClick={handlePublishResults}
              disabled={publishing || results.length === 0}
              className="btn btn-success btn-sm"
            >
              <Send size={15} />
              <span>{publishing ? 'Publishing...' : 'Publish Results to Students'}</span>
            </button>

            <button onClick={exportCsv} disabled={results.length === 0} className="btn btn-secondary btn-sm">
              <Download size={15} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{statusMessage}</span>
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
                  <th style={{ padding: '1rem' }}>Batch</th>
                  <th style={{ padding: '1rem' }}>Score</th>
                  <th style={{ padding: '1rem' }}>Status</th>
                  <th style={{ padding: '1rem' }}>AI Check</th>
                  <th style={{ padding: '1rem' }}>Published</th>
                  <th style={{ padding: '1rem' }}>Violations</th>
                  <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
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
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: r.aiEvaluated ? '#f0fdf4' : '#fffbeb',
                        color: r.aiEvaluated ? '#166534' : '#b45309',
                        border: `1px solid ${r.aiEvaluated ? '#bbf7d0' : '#fde68a'}`
                      }}>
                        {r.aiEvaluated ? '✓ Evaluated' : '⏳ Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: r.resultPublished ? '#eff6ff' : '#f8fafc',
                        color: r.resultPublished ? '#1e40af' : '#64748b',
                        border: `1px solid ${r.resultPublished ? '#bfdbfe' : '#e2e8f0'}`
                      }}>
                        {r.resultPublished ? '✓ Published' : 'Hidden'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ color: r.violationCount > 0 ? '#dc2626' : '#16a34a', fontWeight: 600 }}>
                        {r.violationCount}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <button
                        onClick={() => handleOpenAttemptDetails(r)}
                        className="btn btn-secondary btn-sm"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                      >
                        <Eye size={13} />
                        <span>Inspect & Grade</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review & Grade Modal */}
      {selectedAttempt && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Review Answers & AI Evaluation
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                  Student: <strong>{selectedAttempt.studentName}</strong> | Score: <strong>{selectedAttempt.score} / {selectedAttempt.totalMarks}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEvaluateSingleAttempt(selectedAttempt.attemptId)}
                  className="btn btn-sm btn-primary"
                  style={{ background: '#7c3aed', borderColor: '#6d28d9' }}
                >
                  <Sparkles size={14} />
                  <span>Re-Evaluate with AI</span>
                </button>
                <button onClick={() => setSelectedAttempt(null)} className="btn btn-secondary btn-sm">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading student answers...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {evaluationDetails.map((q) => (
                    <div key={q.questionId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '1rem', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                        <div>
                          <span className="badge badge-secondary" style={{ marginRight: '0.5rem' }}>
                            Section {q.section}
                          </span>
                          <strong style={{ fontSize: '0.95rem', color: '#0f172a' }}>
                            Q{q.questionOrder}. {q.questionText}
                          </strong>
                        </div>
                        <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#334155', flexShrink: 0, marginLeft: '1rem' }}>
                          Max: {q.maxMarks} Marks
                        </span>
                      </div>

                      {/* Student Submitted Answer */}
                      <div style={{ margin: '0.75rem 0', background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                        <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                          Student's Submitted {q.section === 'D' ? `Code (${q.codeLanguage || 'code'})` : 'Answer'}:
                        </span>
                        {q.section === 'D' || (q.studentAnswer && q.studentAnswer.includes('\n')) ? (
                          <pre style={{
                            margin: 0,
                            background: '#0f172a',
                            color: '#f8fafc',
                            padding: '0.75rem',
                            borderRadius: '6px',
                            fontFamily: 'monospace',
                            fontSize: '0.8rem',
                            whiteSpace: 'pre-wrap',
                            maxHeight: '180px',
                            overflowY: 'auto'
                          }}>
                            {q.studentAnswer || '(No code submitted)'}
                          </pre>
                        ) : (
                          <div style={{ color: '#0f172a', fontSize: '0.9rem' }}>
                            {q.studentAnswer || q.studentSelectedOption || '(No answer provided)'}
                          </div>
                        )}
                      </div>

                      {/* AI Evaluation and Editable Marks */}
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '6px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', fontWeight: 700, color: '#166534' }}>
                            <Sparkles size={14} /> AI Evaluator Feedback:
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#166534' }}>Marks Awarded:</span>
                            <input
                              type="number"
                              step="0.5"
                              min="0"
                              max={q.maxMarks}
                              defaultValue={q.marksAwarded != null ? q.marksAwarded : 0}
                              id={`mark-input-${q.questionId}`}
                              style={{
                                width: '65px',
                                padding: '0.25rem 0.4rem',
                                borderRadius: '4px',
                                border: '1px solid #86efac',
                                fontSize: '0.85rem',
                                fontWeight: 700,
                                textAlign: 'center'
                              }}
                            />
                            <button
                              onClick={() => {
                                const input = document.getElementById(`mark-input-${q.questionId}`);
                                const feedbackInput = document.getElementById(`feedback-input-${q.questionId}`);
                                handleSaveQuestionMark(q.questionId, input.value, feedbackInput.value);
                              }}
                              disabled={savingMark === q.questionId}
                              className="btn btn-sm btn-success"
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                            >
                              <Save size={12} />
                              <span>{savingMark === q.questionId ? 'Saving...' : 'Update'}</span>
                            </button>
                          </div>
                        </div>
                        <textarea
                          id={`feedback-input-${q.questionId}`}
                          defaultValue={q.aiFeedback || ''}
                          rows={2}
                          style={{
                            width: '100%',
                            background: 'white',
                            border: '1px solid #bbf7d0',
                            borderRadius: '4px',
                            padding: '0.4rem 0.6rem',
                            fontSize: '0.8rem',
                            color: '#166534',
                            outline: 'none',
                            resize: 'vertical'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setSelectedAttempt(null)} className="btn btn-secondary">
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
