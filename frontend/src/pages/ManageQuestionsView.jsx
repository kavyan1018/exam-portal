import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { ArrowLeft, Plus, Trash2, CheckCircle2, HelpCircle } from 'lucide-react';

export default function ManageQuestionsView() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // New question form state
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [marks, setMarks] = useState(1);
  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const res = await api.get(`/api/v1/faculty/exams/${examId}`);
      setExam(res.data);
    } catch (err) {
      console.error("Failed to load exam details", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index].text = value;
    setOptions(updated);
  };

  const handleCorrectOptionSelect = (index) => {
    const updated = options.map((opt, i) => ({
      ...opt,
      isCorrect: i === index,
    }));
    setOptions(updated);
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        questionText,
        explanation,
        marks: parseFloat(marks),
        questionOrder: (exam.questions?.length || 0) + 1,
        options: options.map((opt, i) => ({
          optionText: opt.text,
          isCorrect: opt.isCorrect,
          optionOrder: i + 1,
        })),
      };

      await api.post(`/api/v1/faculty/exams/${examId}/questions`, payload);
      // Reset form
      setQuestionText('');
      setExplanation('');
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      fetchExam();
    } catch (err) {
      alert("Failed to add question");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (qId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await api.delete(`/api/v1/faculty/exams/questions/${qId}`);
      fetchExam();
    } catch (err) {
      alert("Failed to delete question");
    }
  };

  if (loading) {
    return <div className="container" style={{ padding: '3rem', textAlign: 'center' }}>Loading question bank...</div>;
  }

  return (
    <div className="container" style={{ maxWidth: '960px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link to="/faculty" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', textDecoration: 'none', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
          <ArrowLeft size={16} /> Back to Faculty Console
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a' }}>{exam?.title}</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
              Question Bank Management ({exam?.questions?.length || 0} Questions | Total Marks: {exam?.totalMarks})
            </p>
          </div>
          <Link to={`/faculty/exam/${examId}/monitor`} className="btn btn-secondary btn-sm" style={{ color: '#2563eb' }}>
            Live Student Monitor →
          </Link>
        </div>
      </div>

      {/* Add Question Card */}
      <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #2563eb' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '1.25rem' }}>
          Add Multiple Choice Question (MCQ)
        </h3>

        <form onSubmit={handleAddQuestion}>
          <div className="form-group">
            <label className="form-label">Question Text *</label>
            <textarea
              required
              rows={2}
              className="form-textarea"
              placeholder="Enter the MCQ problem statement..."
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
            {options.map((opt, i) => (
              <div key={i} style={{ background: opt.isCorrect ? '#f0fdf4' : '#f8fafc', padding: '0.75rem', borderRadius: '8px', border: `1px solid ${opt.isCorrect ? '#86efac' : '#e2e8f0'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Option {String.fromCharCode(65 + i)}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', cursor: 'pointer', color: opt.isCorrect ? '#16a34a' : '#64748b' }}>
                    <input
                      type="radio"
                      name="correctOption"
                      checked={opt.isCorrect}
                      onChange={() => handleCorrectOptionSelect(i)}
                    />
                    <span>{opt.isCorrect ? 'Correct Answer' : 'Mark Correct'}</span>
                  </label>
                </div>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder={`Choice text for Option ${String.fromCharCode(65 + i)}`}
                  value={opt.text}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Answer Explanation (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="Reasoning for the correct choice..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Marks</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                required
                className="form-input"
                value={marks}
                onChange={(e) => setMarks(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary" style={{ width: '100%' }}>
            <Plus size={18} />
            <span>{submitting ? 'Saving Question...' : 'Add Question to Exam'}</span>
          </button>
        </form>
      </div>

      {/* Existing Questions List */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
        Existing Exam Questions ({exam?.questions?.length || 0})
      </h3>

      {exam?.questions?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          No questions added to this exam yet. Use the form above to add your first question.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {exam?.questions?.map((q, idx) => (
            <div key={q.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ fontWeight: 700, color: '#2563eb', fontSize: '0.9rem' }}>
                  Q{idx + 1}. ({q.marks} Mark{q.marks > 1 ? 's' : ''})
                </span>
                <button
                  onClick={() => handleDeleteQuestion(q.id)}
                  className="btn btn-danger btn-sm"
                  title="Delete question"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <p style={{ fontSize: '1.05rem', color: '#0f172a', fontWeight: 500, marginBottom: '1rem' }}>
                {q.questionText}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
                {q.options?.map((opt, oIdx) => (
                  <div
                    key={opt.id}
                    style={{
                      padding: '0.5rem 0.75rem',
                      borderRadius: '6px',
                      background: opt.isCorrect ? '#f0fdf4' : '#f8fafc',
                      border: `1px solid ${opt.isCorrect ? '#86efac' : '#e2e8f0'}`,
                      fontSize: '0.875rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <strong style={{ color: opt.isCorrect ? '#16a34a' : '#64748b' }}>
                      {String.fromCharCode(65 + oIdx)}.
                    </strong>
                    <span style={{ color: opt.isCorrect ? '#15803d' : '#334155', fontWeight: opt.isCorrect ? 600 : 400 }}>
                      {opt.optionText}
                    </span>
                    {opt.isCorrect && <CheckCircle2 size={15} color="#16a34a" style={{ marginLeft: 'auto' }} />}
                  </div>
                ))}
              </div>

              {q.explanation && (
                <p style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic', borderTop: '1px solid #f1f5f9', paddingTop: '0.5rem' }}>
                  <strong>Explanation:</strong> {q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
