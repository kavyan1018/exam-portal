import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Trophy,
  ShieldAlert,
  Sparkles,
  Clock,
  Code2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ExamResultView() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/api/v1/student/attempts/${attemptId}/result`);
        setResult(res.data);
        if (res.data.resultPublished && res.data.passed) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } catch (err) {
        console.error("Failed to load result", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 1rem' }} />
        <p style={{ color: '#64748b' }}>Verifying exam submission and evaluation records...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem' }}>
        <h3>Result not available or still being processed.</h3>
        <Link to="/student" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const isDisqualified = result.status === 'DISQUALIFIED';
  const isPublished = result.resultPublished;

  return (
    <div className="container" style={{ maxWidth: '780px', paddingBottom: '3rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginTop: '1rem' }}>
        
        {/* Header Icon */}
        {isDisqualified ? (
          <div style={{ display: 'inline-flex', padding: '16px', background: '#fef2f2', borderRadius: '50%', color: '#dc2626', marginBottom: '1rem' }}>
            <ShieldAlert size={48} />
          </div>
        ) : !isPublished ? (
          <div style={{ display: 'inline-flex', padding: '16px', background: '#eff6ff', borderRadius: '50%', color: '#2563eb', marginBottom: '1rem' }}>
            <Sparkles size={48} />
          </div>
        ) : result.passed ? (
          <div style={{ display: 'inline-flex', padding: '16px', background: '#f0fdf4', borderRadius: '50%', color: '#16a34a', marginBottom: '1rem' }}>
            <Trophy size={48} />
          </div>
        ) : (
          <div style={{ display: 'inline-flex', padding: '16px', background: '#fef2f2', borderRadius: '50%', color: '#dc2626', marginBottom: '1rem' }}>
            <XCircle size={48} />
          </div>
        )}

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.25rem' }}>
          {isDisqualified
            ? 'Exam Disqualified'
            : !isPublished
            ? 'Assessment Submitted Successfully'
            : result.passed
            ? 'Congratulations! You Passed'
            : 'Assessment Completed'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          {result.examTitle}
        </p>

        {/* Status Box when Pending Evaluation */}
        {!isPublished && !isDisqualified && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1.5rem', borderRadius: '12px', marginBottom: '2rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#166534', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              <CheckCircle2 size={22} />
              <span>Answers Recorded & Under AI Evaluation</span>
            </div>
            <p style={{ color: '#15803d', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
              Your responses across Section A (MCQs), Section B (Short Answers), Section C (Output Predictions), and Section D (Programming Solutions) have been safely recorded.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e40af', fontSize: '0.85rem', fontWeight: 600 }}>
              <Clock size={16} />
              <span>Official scores and passing status will be released by faculty once AI evaluation is verified.</span>
            </div>
          </div>
        )}

        {/* Score Pill when Result is Published */}
        {isPublished && (
          <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block', minWidth: '220px', marginBottom: '1.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Your Official Score</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.passed ? '#16a34a' : '#dc2626' }}>
              {result.score} <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 500 }}>/ {result.totalMarks}</span>
            </div>
            <span className={`badge ${result.passed ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '0.25rem' }}>
              {isDisqualified ? 'Disqualified' : result.passed ? 'PASS' : 'FAIL'}
            </span>
          </div>
        )}

        {/* Detailed Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', textAlign: 'left', marginBottom: '2rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Passing Criteria</span>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{result.passMarks} Marks Required</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Total Questions</span>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '1rem' }}>{result.totalQuestions} Questions</div>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '8px' }}>
            <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Submission Time</span>
            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '0.9rem' }}>
              {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : 'Submitted'}
            </div>
          </div>

          <div style={{ background: result.violationCount > 0 ? '#fffbeb' : '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '8px', border: `1px solid ${result.violationCount > 0 ? '#fef3c7' : '#bbf7d0'}` }}>
            <span style={{ color: result.violationCount > 0 ? '#b45309' : '#166534', fontSize: '0.8rem' }}>Integrity Audit</span>
            <div style={{ fontWeight: 700, color: result.violationCount > 0 ? '#b45309' : '#15803d', fontSize: '0.9rem' }}>
              {result.violationCount === 0 ? '✓ Verified / 0 Violations' : `⚠ ${result.violationCount} Violations Logged`}
            </div>
          </div>
        </div>

        {/* Detailed Per-Question Evaluation when Published */}
        {isPublished && result.questionEvaluations && result.questionEvaluations.length > 0 && (
          <div style={{ textAlign: 'left', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>
              Question-by-Question Evaluation & AI Feedback
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {result.questionEvaluations.map((q) => {
                const isExpanded = expandedQ === q.questionId;
                const isFullMarks = q.marksAwarded && q.maxMarks && Number(q.marksAwarded) === Number(q.maxMarks);

                return (
                  <div key={q.questionId} style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
                    <div
                      onClick={() => setExpandedQ(isExpanded ? null : q.questionId)}
                      style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        cursor: 'pointer',
                        background: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                        <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9rem' }}>
                          Q{q.questionOrder}
                        </span>
                        <span className="badge badge-secondary" style={{ fontSize: '0.75rem' }}>
                          Section {q.section}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: '#475569', maxWidth: '380px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {q.questionText}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ fontWeight: 700, color: isFullMarks ? '#16a34a' : '#d97706', fontSize: '0.9rem' }}>
                          {q.marksAwarded != null ? q.marksAwarded : 0} / {q.maxMarks} Marks
                        </span>
                        {isExpanded ? <ChevronUp size={16} color="#64748b" /> : <ChevronDown size={16} color="#64748b" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '1rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
                        <div style={{ marginBottom: '0.75rem' }}>
                          <strong style={{ color: '#334155' }}>Question:</strong>
                          <p style={{ margin: '0.25rem 0 0', color: '#0f172a' }}>{q.questionText}</p>
                        </div>

                        {/* Student Response */}
                        {q.studentAnswer && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ color: '#334155' }}>
                              {q.section === 'D' ? `Submitted Code (${q.codeLanguage || 'code'}):` : 'Your Answer:'}
                            </strong>
                            <pre style={{
                              margin: '0.25rem 0 0',
                              background: '#0f172a',
                              color: '#f8fafc',
                              padding: '0.75rem',
                              borderRadius: '6px',
                              fontFamily: 'monospace',
                              fontSize: '0.8rem',
                              whiteSpace: 'pre-wrap',
                              maxHeight: '160px',
                              overflowY: 'auto'
                            }}>
                              {q.studentAnswer}
                            </pre>
                          </div>
                        )}

                        {q.studentSelectedOption && (
                          <div style={{ marginBottom: '0.75rem' }}>
                            <strong style={{ color: '#334155' }}>Selected Option:</strong>
                            <span style={{ marginLeft: '0.5rem', color: '#0f172a' }}>{q.studentSelectedOption}</span>
                          </div>
                        )}

                        {/* AI Feedback */}
                        {q.aiFeedback && (
                          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.65rem 0.85rem', borderRadius: '6px', color: '#166534', marginTop: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                              <Sparkles size={14} />
                              <span>AI Evaluation Feedback:</span>
                            </div>
                            <div>{q.aiFeedback}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Link to="/student" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
          <ArrowLeft size={18} />
          <span>Return to Student Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
