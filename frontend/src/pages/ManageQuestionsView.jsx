import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import {
  ArrowLeft, Plus, Trash2, CheckCircle2, HelpCircle,
  Sparkles, FileText, Upload, Check, AlertCircle, RefreshCw
} from 'lucide-react';

export default function ManageQuestionsView() {
  const { id: examId } = useParams();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  // Authoring Mode: 'manual', 'bulk', 'ai'
  const [activeTab, setActiveTab] = useState('manual');

  // Manual Question state
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

  // Bulk Import state
  const [bulkRawText, setBulkRawText] = useState('');
  const [parsedPreview, setParsedPreview] = useState([]);
  const [parsing, setParsing] = useState(false);
  const [bulkImporting, setBulkImporting] = useState(false);

  // AI Generator state
  const [aiTopic, setAiTopic] = useState('');
  const [aiLanguage, setAiLanguage] = useState('Java');
  const [aiCount, setAiCount] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

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

  // --- Manual Actions ---
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
    setActionMessage('');
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
      setQuestionText('');
      setExplanation('');
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
      setActionMessage("Question saved successfully!");
      fetchExam();
    } catch (err) {
      alert("Failed to add question");
    } finally {
      setSubmitting(false);
    }
  };

  // --- Bulk Import Actions ---
  const handlePreviewBulk = async () => {
    if (!bulkRawText.trim()) return;
    setParsing(true);
    try {
      const res = await api.post(`/api/v1/faculty/exams/${examId}/questions/parse-preview`, {
        rawText: bulkRawText
      });
      setParsedPreview(res.data);
    } catch (err) {
      alert("Parsing error");
    } finally {
      setParsing(false);
    }
  };

  const handleExecuteBulkImport = async () => {
    if (!bulkRawText.trim() && parsedPreview.length === 0) return;
    setBulkImporting(true);
    setActionMessage('');

    try {
      const res = await api.post(`/api/v1/faculty/exams/${examId}/questions/bulk-import`, {
        rawText: bulkRawText,
        parsedQuestions: parsedPreview.length > 0 ? parsedPreview : null
      });
      setActionMessage(res.data.message);
      setBulkRawText('');
      setParsedPreview([]);
      fetchExam();
    } catch (err) {
      alert("Failed to import bulk questions");
    } finally {
      setBulkImporting(false);
    }
  };

  // --- AI Generator Actions ---
  const handleGenerateAiQuestions = async (e) => {
    e.preventDefault();
    if (!aiTopic.trim()) {
      alert("Please provide a topic for the AI.");
      return;
    }

    setAiGenerating(true);
    setActionMessage('');

    try {
      const res = await api.post(`/api/v1/faculty/exams/${examId}/questions/ai-generate`, {
        topic: aiTopic,
        languageOrSubject: aiLanguage,
        count: parseInt(aiCount),
        difficulty: aiDifficulty,
        apiKey: aiApiKey.trim() || null
      });
      setActionMessage(res.data.message);
      setAiTopic('');
      fetchExam();
    } catch (err) {
      alert(err.response?.data?.message || "AI Generation error");
    } finally {
      setAiGenerating(false);
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
              Question Bank ({exam?.questions?.length || 0} Questions | Total Marks: {exam?.totalMarks})
            </p>
          </div>
          <Link to={`/faculty/exam/${examId}/monitor`} className="btn btn-secondary btn-sm" style={{ color: '#2563eb' }}>
            Live Student Monitor →
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.9rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Mode Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('manual')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'manual' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'manual' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Plus size={16} />
          <span>Single Question Form</span>
        </button>

        <button
          onClick={() => setActiveTab('bulk')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'bulk' ? '3px solid #2563eb' : '3px solid transparent',
            color: activeTab === 'bulk' ? '#2563eb' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Upload size={16} />
          <span>Bulk Import (Paste Text)</span>
        </button>

        <button
          onClick={() => setActiveTab('ai')}
          style={{
            padding: '0.65rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'ai' ? '3px solid #9333ea' : '3px solid transparent',
            color: activeTab === 'ai' ? '#9333ea' : '#64748b',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Sparkles size={16} color="#9333ea" />
          <span>AI Question Generator</span>
        </button>
      </div>

      {/* TAB 1: MANUAL QUESTION FORM */}
      {activeTab === 'manual' && (
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
      )}

      {/* TAB 2: BULK IMPORT (PASTE TEXT) */}
      {activeTab === 'bulk' && (
        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #2563eb' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
            Bulk Question Importer
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Paste multiple questions at once. Options (A, B, C, D) and explanations are automatically extracted. Mark correct answers with an asterisk <code>*</code>, <code>[correct]</code>, or <code>Answer: B</code>.
          </p>

          <div className="form-group">
            <textarea
              rows={9}
              className="form-textarea"
              style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              placeholder={`1. What is the time complexity of binary search?
A) O(1)
B) O(log n)*
C) O(n)
D) O(n^2)
Explanation: Binary search halves the search space at each iteration.

2. Which data structure follows FIFO order?
A) Stack
B) Queue [correct]
C) Tree
D) Graph`}
              value={bulkRawText}
              onChange={(e) => setBulkRawText(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handlePreviewBulk}
              disabled={parsing || !bulkRawText.trim()}
              className="btn btn-secondary btn-sm"
            >
              {parsing ? 'Analyzing format...' : 'Preview Extracted Questions'}
            </button>

            <button
              type="button"
              onClick={handleExecuteBulkImport}
              disabled={bulkImporting || (!bulkRawText.trim() && parsedPreview.length === 0)}
              className="btn btn-primary btn-sm"
            >
              <Upload size={15} />
              <span>{bulkImporting ? 'Importing Questions...' : 'Import All into Exam'}</span>
            </button>
          </div>

          {/* Preview Box */}
          {parsedPreview.length > 0 && (
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginTop: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <strong style={{ color: '#16a34a', fontSize: '0.9rem' }}>
                  ✓ Successfully extracted {parsedPreview.length} questions ready to push:
                </strong>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '250px', overflowY: 'auto' }}>
                {parsedPreview.map((pq, idx) => (
                  <div key={idx} style={{ background: 'white', padding: '0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.825rem' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.35rem' }}>
                      {idx + 1}. {pq.questionText}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {pq.options.map((opt, oIdx) => (
                        <span
                          key={oIdx}
                          style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: opt.isCorrect ? '#dcfce7' : '#f1f5f9',
                            color: opt.isCorrect ? '#166534' : '#475569',
                            fontWeight: opt.isCorrect ? 700 : 400
                          }}
                        >
                          {String.fromCharCode(65 + oIdx)}. {opt.optionText} {opt.isCorrect && '✓'}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: AI QUESTION GENERATOR */}
      {activeTab === 'ai' && (
        <div className="card" style={{ marginBottom: '2rem', borderTop: '4px solid #9333ea' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Sparkles size={22} color="#9333ea" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
              AI Automated Question Generator
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            Specify the topic and subject. The AI will generate structured MCQs, multiple choices, and mark correct answers automatically.
          </p>

          <form onSubmit={handleGenerateAiQuestions}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="form-label">Topic / Concept *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Binary Search Trees, OOP Polymorphism, TCP/IP"
                  className="form-input"
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Programming Language or Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Java, Python, C++, Operating Systems"
                  className="form-input"
                  value={aiLanguage}
                  onChange={(e) => setAiLanguage(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label">Number of Questions</label>
                <select
                  className="form-select"
                  value={aiCount}
                  onChange={(e) => setAiCount(e.target.value)}
                >
                  <option value={3}>3 Questions</option>
                  <option value={5}>5 Questions</option>
                  <option value={10}>10 Questions</option>
                </select>
              </div>

              <div>
                <label className="form-label">Difficulty Level</label>
                <select
                  className="form-select"
                  value={aiDifficulty}
                  onChange={(e) => setAiDifficulty(e.target.value)}
                >
                  <option value="Easy">Easy (Foundations & Definitions)</option>
                  <option value="Medium">Medium (Application & Tracing)</option>
                  <option value="Hard">Hard (Corner Cases & Complexity)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gemini API Key (Optional)</label>
              <input
                type="password"
                placeholder="AIzaSy... (Leave blank to use intelligent offline curriculum generator)"
                className="form-input"
                value={aiApiKey}
                onChange={(e) => setAiApiKey(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', display: 'block' }}>
                If you have a free Google Gemini API key from AI Studio, paste it here for custom generative output!
              </span>
            </div>

            <button
              type="submit"
              disabled={aiGenerating}
              className="btn btn-primary"
              style={{ width: '100%', background: '#9333ea', borderColor: '#9333ea' }}
            >
              <Sparkles size={18} />
              <span>{aiGenerating ? 'AI is drafting & attaching questions...' : 'Generate Questions with AI'}</span>
            </button>
          </form>
        </div>
      )}

      {/* Existing Questions List */}
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
        Current Exam Questions ({exam?.questions?.length || 0})
      </h3>

      {exam?.questions?.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          No questions added to this exam yet. Use one of the tabs above to add or generate questions!
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
