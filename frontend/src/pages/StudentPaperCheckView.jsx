import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  Save,
  Printer,
  Send,
  Code2,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  Filter
} from 'lucide-react';

export default function StudentPaperCheckView() {
  const { examId, attemptId } = useParams();
  const [paper, setPaper] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'A' | 'B' | 'C' | 'D'
  const [savingQuestionId, setSavingQuestionId] = useState(null);
  const [actionMessage, setActionMessage] = useState('');
  const [evaluatingAi, setEvaluatingAi] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const fetchPaper = async () => {
    try {
      const res = await api.get(`/api/v1/faculty/exams/attempts/${attemptId}/paper`);
      setPaper(res.data);
    } catch (err) {
      console.error("Failed to load student paper", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaper();
  }, [attemptId]);

  // Evaluate with AI
  const handleEvaluateAi = async () => {
    setEvaluatingAi(true);
    setActionMessage('');
    try {
      const res = await api.post(`/api/v1/faculty/exams/attempts/${attemptId}/evaluate-ai`);
      setActionMessage(res.data.message || "AI auto-evaluation completed.");
      await fetchPaper();
    } catch (err) {
      alert("AI evaluation failed: " + (err.response?.data?.message || err.message));
    } finally {
      setEvaluatingAi(false);
    }
  };

  // Publish Result
  const handlePublish = async () => {
    if (!window.confirm("Release and publish this result to the student?")) return;
    setPublishing(true);
    setActionMessage('');
    try {
      await api.post(`/api/v1/faculty/exams/${examId}/publish-results`);
      setActionMessage("Official results published to student.");
      await fetchPaper();
    } catch (err) {
      alert("Failed to publish result.");
    } finally {
      setPublishing(false);
    }
  };

  // Update specific question mark
  const handleSaveMark = async (questionId) => {
    const markInput = document.getElementById(`mark-input-${questionId}`);
    const feedbackInput = document.getElementById(`feedback-input-${questionId}`);
    if (!markInput) return;

    setSavingQuestionId(questionId);
    setActionMessage('');
    try {
      await api.post(`/api/v1/faculty/exams/attempts/${attemptId}/update-marks`, {
        questionId,
        marks: markInput.value,
        feedback: feedbackInput ? feedbackInput.value : null
      });
      setActionMessage("Question mark updated and score recalculated successfully.");
      await fetchPaper();
    } catch (err) {
      alert("Failed to save mark.");
    } finally {
      setSavingQuestionId(null);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>Loading student answer sheet and evaluation records...</p>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>Student paper records not found.</h3>
        <Link to={`/faculty/exam/${examId}/results`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Grade Sheet
        </Link>
      </div>
    );
  }

  const filteredQuestions = activeSection === 'ALL'
    ? paper.questions
    : paper.questions.filter(q => q.section === activeSection);

  return (
    <div className="container" style={{ maxWidth: '1000px', paddingBottom: '4rem' }}>
      {/* Top Breadcrumb Nav */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link
          to={`/faculty/exam/${examId}/results`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}
        >
          <ArrowLeft size={16} /> Back to Exam Results
        </Link>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={handleEvaluateAi}
            disabled={evaluatingAi}
            className="btn btn-primary btn-sm"
            style={{ background: '#7c3aed', borderColor: '#6d28d9' }}
          >
            <Sparkles size={15} />
            <span>{evaluatingAi ? 'Evaluating with AI...' : 'Re-Check with AI'}</span>
          </button>

          <button
            onClick={handlePublish}
            disabled={publishing || paper.resultPublished}
            className={`btn btn-sm ${paper.resultPublished ? 'btn-secondary' : 'btn-success'}`}
          >
            <Send size={15} />
            <span>{paper.resultPublished ? '✓ Results Published' : 'Publish Result to Student'}</span>
          </button>

          <button
            onClick={() => window.print()}
            className="btn btn-secondary btn-sm"
          >
            <Printer size={15} />
            <span>Print Answer Sheet</span>
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Student Profile & Score Card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#ffffff', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {paper.studentName}
              </h2>
              <span className={`badge ${paper.passed ? 'badge-success' : 'badge-danger'}`}>
                {paper.passed ? 'PASSED' : 'FAILED'}
              </span>
              <span className={`badge ${paper.resultPublished ? 'badge-primary' : 'badge-secondary'}`}>
                {paper.resultPublished ? 'Published' : 'Hidden from Student'}
              </span>
            </div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 0.5rem' }}>
              Email: <strong>{paper.studentEmail}</strong> | Roll/ID: <strong>{paper.rollNumber || 'N/A'}</strong>
            </p>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.825rem', color: '#475569' }}>
              <span>Exam: <strong>{paper.examTitle}</strong></span>
              <span>Submitted: <strong>{paper.submittedAt ? new Date(paper.submittedAt).toLocaleString() : 'In Progress'}</strong></span>
              <span>Violations: <strong style={{ color: paper.violationCount > 0 ? '#dc2626' : '#16a34a' }}>{paper.violationCount}</strong></span>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '1rem 1.5rem', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center', minWidth: '160px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Verified Score</span>
            <div style={{ fontSize: '2.25rem', fontWeight: 800, color: paper.passed ? '#16a34a' : '#dc2626', lineHeight: 1.1 }}>
              {paper.score} <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 500 }}>/ {paper.totalMarks}</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Pass mark: {paper.passMarks}</span>
          </div>
        </div>
      </div>

      {/* Section Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        {[
          { id: 'ALL', label: 'All Questions' },
          { id: 'A', label: 'Section A (MCQs)' },
          { id: 'B', label: 'Section B (Short Answers)' },
          { id: 'C', label: 'Section C (Predict Output)' },
          { id: 'D', label: 'Section D (Practical Code)' },
          { id: 'E', label: 'Section E (Design Challenge)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            style={{
              background: activeSection === tab.id ? '#0f172a' : 'white',
              color: activeSection === tab.id ? 'white' : '#475569',
              border: `1px solid ${activeSection === tab.id ? '#0f172a' : '#cbd5e1'}`,
              borderRadius: '6px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question Paper List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {filteredQuestions.map((q) => {
          const isFullMarks = q.marksAwarded && q.maxMarks && Number(q.marksAwarded) === Number(q.maxMarks);

          return (
            <div key={q.questionId} className="card" style={{ padding: '1.25rem', border: '1px solid #e2e8f0', background: 'white' }}>
              {/* Question Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f5f9', paddingBottom: '0.65rem', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>
                    Q{q.questionOrder}.
                  </span>
                  <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                    Section {q.section}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
                    Max: <strong>{q.maxMarks} Marks</strong>
                  </span>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    background: isFullMarks ? '#f0fdf4' : '#fffbeb',
                    color: isFullMarks ? '#166534' : '#b45309',
                    border: `1px solid ${isFullMarks ? '#bbf7d0' : '#fde68a'}`
                  }}>
                    {q.marksAwarded != null ? q.marksAwarded : 0} / {q.maxMarks} Marks
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <p style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', lineHeight: 1.5, marginBottom: '1rem', whiteSpace: 'pre-wrap' }}>
                {q.questionText}
              </p>

              {/* Expected Concept / Correct Option */}
              {q.expectedExplanation && (
                <div style={{ background: '#f8fafc', borderLeft: '3px solid #94a3b8', padding: '0.65rem 0.85rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <strong style={{ color: '#475569' }}>Reference / Model Concept:</strong>
                  <div style={{ color: '#334155', marginTop: '0.2rem' }}>{q.expectedExplanation}</div>
                  {q.correctOptionText && (
                    <div style={{ color: '#166534', marginTop: '0.25rem', fontWeight: 600 }}>
                      ✓ Correct Option: {q.correctOptionText}
                    </div>
                  )}
                </div>
              )}

              {/* Student's Submitted Answer */}
              <div style={{ marginBottom: '1rem' }}>
                <span style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Student's Written Response {(q.section === 'D' || q.section === 'E') ? `(Code in ${q.codeLanguage || 'Editor'})` : ''}:
                </span>

                {(q.section === 'D' || q.section === 'E') ? (
                  <pre style={{
                    margin: 0,
                    background: '#0f172a',
                    color: '#f8fafc',
                    padding: '1rem',
                    borderRadius: '8px',
                    fontFamily: 'Consolas, Monaco, monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    maxHeight: '260px',
                    overflowY: 'auto',
                    border: '1px solid #334155'
                  }}>
                    {q.studentAnswer || '(No code was submitted for this question)'}
                  </pre>
                ) : q.section === 'A' ? (
                  <div style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    border: `1px solid ${q.studentSelectedOption === q.correctOptionText ? '#bbf7d0' : '#fecaca'}`,
                    background: q.studentSelectedOption === q.correctOptionText ? '#f0fdf4' : '#fef2f2',
                    color: q.studentSelectedOption === q.correctOptionText ? '#166534' : '#991b1b',
                    fontSize: '0.9rem',
                    fontWeight: 600
                  }}>
                    Selected: {q.studentSelectedOption || '(No option selected)'}
                  </div>
                ) : (
                  <div style={{
                    padding: '0.85rem 1rem',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#0f172a',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    fontFamily: q.section === 'C' ? 'monospace' : 'inherit',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {q.studentAnswer || '(No answer provided)'}
                  </div>
                )}
              </div>

              {/* AI Feedback & Faculty Mark Verification */}
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem 1rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                    <Sparkles size={16} />
                    <span>AI Evaluation & Feedback:</span>
                  </div>

                  {/* Marks Adjustment Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#166534' }}>Award Marks:</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max={q.maxMarks}
                      defaultValue={q.marksAwarded != null ? q.marksAwarded : 0}
                      id={`mark-input-${q.questionId}`}
                      style={{
                        width: '70px',
                        padding: '0.3rem 0.5rem',
                        borderRadius: '4px',
                        border: '1px solid #86efac',
                        fontSize: '0.9rem',
                        fontWeight: 700,
                        textAlign: 'center'
                      }}
                    />
                    <button
                      onClick={() => handleSaveMark(q.questionId)}
                      disabled={savingQuestionId === q.questionId}
                      className="btn btn-sm btn-success"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Save size={13} />
                      <span>{savingQuestionId === q.questionId ? 'Saving...' : 'Update Mark'}</span>
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
                    padding: '0.5rem 0.75rem',
                    fontSize: '0.85rem',
                    color: '#166534',
                    outline: 'none',
                    resize: 'vertical'
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
