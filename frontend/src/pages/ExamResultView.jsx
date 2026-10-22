import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import confetti from 'canvas-confetti';
import { CheckCircle2, XCircle, AlertTriangle, ArrowLeft, Trophy, ShieldAlert } from 'lucide-react';

export default function ExamResultView() {
  const { attemptId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/api/v1/student/attempts/${attemptId}/result`);
        setResult(res.data);
        if (res.data.passed) {
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
        <p style={{ color: '#64748b' }}>Calculating your official marks and verifying audit records...</p>
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

  return (
    <div className="container" style={{ maxWidth: '680px' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', marginTop: '1rem' }}>
        {isDisqualified ? (
          <div style={{ display: 'inline-flex', padding: '16px', background: '#fef2f2', borderRadius: '50%', color: '#dc2626', marginBottom: '1rem' }}>
            <ShieldAlert size={48} />
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
          {isDisqualified ? 'Exam Disqualified' : result.passed ? 'Congratulations! You Passed' : 'Assessment Completed'}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          {result.examTitle}
        </p>

        {/* Score Pill */}
        <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'inline-block', minWidth: '220px', marginBottom: '1.75rem' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Your Score</span>
          <div style={{ fontSize: '2.5rem', fontWeight: 800, color: result.passed ? '#16a34a' : '#dc2626' }}>
            {result.score} <span style={{ fontSize: '1.2rem', color: '#94a3b8', fontWeight: 500 }}>/ {result.totalMarks}</span>
          </div>
          <span className={`badge ${result.passed ? 'badge-success' : 'badge-danger'}`} style={{ marginTop: '0.25rem' }}>
            {isDisqualified ? 'Disqualified' : result.passed ? 'PASS' : 'FAIL'}
          </span>
        </div>

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

          <div style={{ background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
            <span style={{ color: '#166534', fontSize: '0.8rem' }}>Correct Answers</span>
            <div style={{ fontWeight: 700, color: '#15803d', fontSize: '1.1rem' }}>{result.correctAnswers}</div>
          </div>

          <div style={{ background: '#fef2f2', padding: '0.85rem 1rem', borderRadius: '8px', border: '1px solid #fecaca' }}>
            <span style={{ color: '#991b1b', fontSize: '0.8rem' }}>Incorrect Answers</span>
            <div style={{ fontWeight: 700, color: '#b91c1c', fontSize: '1.1rem' }}>{result.incorrectAnswers}</div>
          </div>
        </div>

        {/* Security / Audit Log Status */}
        <div style={{ background: result.violationCount > 0 ? '#fffbeb' : '#f8fafc', border: `1px solid ${result.violationCount > 0 ? '#fef3c7' : '#e2e8f0'}`, padding: '0.85rem 1rem', borderRadius: '8px', marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
          <span style={{ color: '#475569' }}>Proctoring Integrity Audit:</span>
          <strong style={{ color: result.violationCount > 0 ? '#b45309' : '#16a34a' }}>
            {result.violationCount === 0 ? '✓ Zero Suspicious Events' : `⚠ ${result.violationCount} Violations Logged`}
          </strong>
        </div>

        <Link to="/student" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
          <ArrowLeft size={18} />
          <span>Return to Student Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
