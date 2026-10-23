import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import CodeCompilerWorkspace from '../components/CodeCompilerWorkspace';
import {
  Clock,
  AlertTriangle,
  ShieldAlert,
  Camera,
  CheckCircle,
  HelpCircle,
  Send,
  Maximize,
  Check
} from 'lucide-react';

export default function ExamTakingView() {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // questionId -> optionId
  const [textAnswers, setTextAnswers] = useState({});         // questionId -> string
  const [codeLanguages, setCodeLanguages] = useState({});     // questionId -> string
  const [reviewFlags, setReviewFlags] = useState({});         // questionId -> boolean
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [violations, setViolations] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [violationWarning, setViolationWarning] = useState(null);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('All changes saved');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(document.createElement('canvas'));
  const intervalRef = useRef(null);
  const heartbeatRef = useRef(null);
  const snapshotRef = useRef(null);

  // Anti-false-positive refs
  const gracePeriodUntilRef = useRef(Date.now() + 15000); // 15-second grace window on load
  const wasEverFullscreenRef = useRef(false);
  const lastViolationTimeRef = useRef(0);

  // 1. Initialize Exam
  useEffect(() => {
    let isMounted = true;

    const startExamSession = async () => {
      try {
        const res = await api.post(`/api/v1/student/exams/${examId}/start`);
        if (!isMounted) return;

        setExamData(res.data);
        setRemainingSeconds(res.data.remainingSeconds);
        setSelectedAnswers(res.data.existingAnswers || {});
        setTextAnswers(res.data.existingTextAnswers || {});
        setCodeLanguages(res.data.existingCodeLanguages || {});
        setReviewFlags(res.data.reviewFlags || {});
        setLoading(false);

        // Attempt fullscreen
        enterFullscreen();

        // Setup webcam if enabled
        if (res.data.enableWebcam) {
          setupWebcam();
        }
      } catch (err) {
        console.error("Failed to start exam", err);
        const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Could not start exam.";
        alert(errorMsg);
        navigate('/student');
      }
    };

    startExamSession();

    return () => {
      isMounted = false;
      stopWebcam();
      clearInterval(intervalRef.current);
      clearInterval(heartbeatRef.current);
      clearInterval(snapshotRef.current);
    };
  }, [examId]);

  // 2. Fullscreen Management
  const enterFullscreen = () => {
    gracePeriodUntilRef.current = Date.now() + 10000; // 10s grace after clicking fullscreen
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen().then(() => {
        setIsFullscreen(true);
        wasEverFullscreenRef.current = true;
      }).catch(() => {
        setIsFullscreen(false);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = !!document.fullscreenElement;
      setIsFullscreen(active);
      if (active) {
        wasEverFullscreenRef.current = true;
      } else if (!loading && examData && wasEverFullscreenRef.current && Date.now() > gracePeriodUntilRef.current) {
        handleViolation('FULLSCREEN_EXIT', 'Exited fullscreen examination mode');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [loading, examData]);

  // 3. Tab switch & Devtools listeners
  useEffect(() => {
    if (loading || !examData) return;

    const handleVisibilityChange = () => {
      if (document.hidden && Date.now() > gracePeriodUntilRef.current) {
        handleViolation('TAB_SWITCH', 'Switched browser tabs or minimized window');
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      return false;
    };

    const handleKeyDown = (e) => {
      // Disallow F12, Ctrl+Shift+I, Alt+Tab, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault();
        handleViolation('DEVTOOLS_ATTEMPT', `Attempted shortcut: ${e.key}`);
        return false;
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [loading, examData]);

  // 4. Timer Countdown (every 1 second)
  useEffect(() => {
    if (loading || !examData) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          handleAutoSubmit("Time Expired");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [loading, examData]);

  // 5. Server Heartbeat (every 15 seconds)
  useEffect(() => {
    if (loading || !examData) return;

    heartbeatRef.current = setInterval(async () => {
      try {
        const res = await api.post(`/api/v1/student/attempts/${examData.attemptId}/heartbeat`, {
          isFullscreen: !!document.fullscreenElement,
          isFocused: document.hasFocus(),
        });

        // Sync with authoritative server time
        setRemainingSeconds(res.data.remainingSeconds);
        setViolations(res.data.currentViolations);

        if (res.data.autoSubmitted || res.data.status === 'AUTO_SUBMITTED' || res.data.status === 'DISQUALIFIED') {
          clearInterval(heartbeatRef.current);
          alert(res.data.status === 'DISQUALIFIED'
            ? "Your exam has been automatically disqualified due to exceeding allowed violations."
            : "Exam time has concluded.");
          navigate(`/student/result/${examData.attemptId}`);
        }
      } catch (err) {
        console.warn("Heartbeat ping error", err);
      }
    }, 15000);

    return () => clearInterval(heartbeatRef.current);
  }, [loading, examData]);

  // 6. Webcam Snapshot Capture
  const setupWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Schedule periodic snapshot every 45s
      snapshotRef.current = setInterval(() => {
        captureAndSendSnapshot('WEBCAM_SNAPSHOT', 'Scheduled webcam audit snapshot');
      }, 45000);
    } catch (err) {
      console.warn("Camera access denied or unavailable", err);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const captureAndSendSnapshot = (eventType, details) => {
    if (!videoRef.current || !streamRef.current) return;
    try {
      const canvas = canvasRef.current;
      canvas.width = 320;
      canvas.height = 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, 320, 240);
      const base64Data = canvas.toDataURL('image/jpeg', 0.6);

      api.post(`/api/v1/student/attempts/${examData.attemptId}/log-event`, {
        eventType,
        details,
        snapshotBase64: base64Data,
      }).catch(err => console.warn("Failed to upload snapshot", err));
    } catch (e) {
      console.warn("Snapshot capture error", e);
    }
  };

  // 7. Handle Violation
  const handleViolation = async (eventType, details) => {
    if (!examData) return;
    if (Date.now() < gracePeriodUntilRef.current) {
      console.log('Ignored violation during initial grace period:', eventType);
      return;
    }

    // Cooldown check: ignore if another violation was registered within the last 5 seconds
    const now = Date.now();
    if (now - lastViolationTimeRef.current < 5000) {
      return;
    }
    lastViolationTimeRef.current = now;

    captureAndSendSnapshot(eventType, details);

    setViolations((prev) => {
      const nextCount = prev + 1;
      setViolationWarning({
        eventType,
        details,
        count: nextCount,
        max: examData.maxViolationsAllowed,
      });

      if (nextCount >= examData.maxViolationsAllowed) {
        setTimeout(() => {
          alert(`Maximum allowed violations (${examData.maxViolationsAllowed}) reached. Your exam has been terminated.`);
          navigate(`/student/result/${examData.attemptId}`);
        }, 1500);
      }
      return nextCount;
    });
  };

  // 8. Answer Selection & Auto-Save
  const handleSelectOption = async (optionId) => {
    const currentQ = examData.questions[currentIdx];
    const newAnswers = { ...selectedAnswers, [currentQ.id]: optionId };
    setSelectedAnswers(newAnswers);
    saveAnswerToServer(currentQ.id, optionId, !!reviewFlags[currentQ.id], null, null);
  };

  const handleSaveTextAnswer = async (textVal) => {
    const currentQ = examData.questions[currentIdx];
    const newTexts = { ...textAnswers, [currentQ.id]: textVal };
    setTextAnswers(newTexts);
    saveAnswerToServer(currentQ.id, null, !!reviewFlags[currentQ.id], textVal, null);
  };

  const handleSaveCodeAnswer = async (codeVal, langVal) => {
    const currentQ = examData.questions[currentIdx];
    const newTexts = { ...textAnswers, [currentQ.id]: codeVal };
    const newLangs = { ...codeLanguages, [currentQ.id]: langVal };
    setTextAnswers(newTexts);
    setCodeLanguages(newLangs);
    saveAnswerToServer(currentQ.id, null, !!reviewFlags[currentQ.id], codeVal, langVal);
  };

  const handleClearAnswer = async () => {
    const currentQ = examData.questions[currentIdx];
    const newAnswers = { ...selectedAnswers };
    delete newAnswers[currentQ.id];
    setSelectedAnswers(newAnswers);

    const newTexts = { ...textAnswers };
    delete newTexts[currentQ.id];
    setTextAnswers(newTexts);

    saveAnswerToServer(currentQ.id, null, !!reviewFlags[currentQ.id], null, null);
  };

  const handleToggleReview = async () => {
    const currentQ = examData.questions[currentIdx];
    const updatedReview = !reviewFlags[currentQ.id];
    setReviewFlags({ ...reviewFlags, [currentQ.id]: updatedReview });
    saveAnswerToServer(
      currentQ.id,
      selectedAnswers[currentQ.id] || null,
      updatedReview,
      textAnswers[currentQ.id] || null,
      codeLanguages[currentQ.id] || null
    );
  };

  const saveAnswerToServer = async (questionId, optionId, isReview, textAnswer, codeLanguage) => {
    setSaveStatus('Saving answer...');
    try {
      await api.post(`/api/v1/student/attempts/${examData.attemptId}/save-answer`, {
        questionId,
        selectedOptionId: optionId !== undefined ? optionId : (selectedAnswers[questionId] || null),
        textAnswer: textAnswer !== undefined ? textAnswer : (textAnswers[questionId] || null),
        codeLanguage: codeLanguage !== undefined ? codeLanguage : (codeLanguages[questionId] || null),
        isMarkedForReview: isReview !== undefined ? isReview : !!reviewFlags[questionId],
      });
      setSaveStatus('All changes saved');
    } catch (err) {
      setSaveStatus('Sync warning (will retry)');
    }
  };

  // 9. Submission
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/v1/student/attempts/${examData.attemptId}/submit`);
      // Exit fullscreen before navigating
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      navigate(`/student/result/${examData.attemptId}`);
    } catch (err) {
      alert("Submission error. Please retry.");
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async (reason) => {
    try {
      await api.post(`/api/v1/student/attempts/${examData.attemptId}/submit`);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      navigate(`/student/result/${examData.attemptId}`);
    } catch (err) {
      navigate('/student');
    }
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <div style={{ textAlign: 'center' }}>
          <ShieldAlert size={48} className="animate-spin" style={{ margin: '0 auto 1rem', color: '#3b82f6' }} />
          <h2>Initializing Secure Exam Environment...</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.5rem' }}>Allocating randomized question sequence and establishing proctoring link.</p>
        </div>
      </div>
    );
  }

  const currentQ = examData?.questions?.[currentIdx];
  const totalQuestions = examData?.questions?.length || 0;

  const isQuestionAnswered = (qId) => {
    return !!selectedAnswers[qId] || (!!textAnswers[qId] && textAnswers[qId].trim().length > 0);
  };

  const answeredCount = examData?.questions?.filter(q => isQuestionAnswered(q.id)).length || 0;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isTimeCritical = remainingSeconds < 300; // < 5 mins

  const getQuestionSection = (q) => {
    if (!q) return 'A';
    const text = q.questionText || '';
    if (text.includes('Section D') || text.includes('Programming Questions') || text.toLowerCase().includes('section d:')) {
      return 'D';
    }
    if (text.includes('Section C') || text.includes('Predict the Output') || text.toLowerCase().includes('section c:')) {
      return 'C';
    }
    if (text.includes('Section B') || text.includes('Short Answer') || text.toLowerCase().includes('section b:')) {
      return 'B';
    }
    return 'A'; // Default Section A: MCQs
  };

  const getCleanQuestionText = (text, section) => {
    if (!text) return '';
    if (section === 'D') {
      return text.replace(/\n\s*Which (program implementation|code snippet).+$/is, '').trim();
    }
    return text;
  };

  const currentSection = getQuestionSection(currentQ);

  return (
    <div className="exam-fullscreen-container">
      {/* Fullscreen Prompt Overlay if exited */}
      {!isFullscreen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <AlertTriangle size={48} style={{ color: '#dc2626', margin: '0 auto 1rem' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Fullscreen Mode Required
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              This examination requires fullscreen mode for a secure testing environment. Click below to continue your exam.
            </p>
            <button onClick={enterFullscreen} className="btn btn-primary" style={{ width: '100%', padding: '0.85rem' }}>
              <Maximize size={18} />
              <span>Re-enter Fullscreen Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Violation Alert Modal */}
      {violationWarning && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ borderTop: '4px solid #dc2626' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', color: '#dc2626' }}>
              <ShieldAlert size={28} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Security Violation Warning</h3>
            </div>
            <p style={{ color: '#334155', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              <strong>Event Detected:</strong> {violationWarning.details}
            </p>
            <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', padding: '0.85rem', borderRadius: '6px', marginBottom: '1.25rem', fontSize: '0.9rem', color: '#991b1b' }}>
              Violation <strong>{violationWarning.count}</strong> of <strong>{violationWarning.max}</strong> recorded.
              {violationWarning.count >= violationWarning.max
                ? " You have exceeded the maximum threshold. The exam is being auto-submitted."
                : " Further violations will result in automatic disqualification."}
            </div>
            {violationWarning.count < violationWarning.max && (
              <button onClick={() => setViolationWarning(null)} className="btn btn-danger" style={{ width: '100%' }}>
                I Understand & Resume Exam
              </button>
            )}
          </div>
        </div>
      )}

      {/* Top Header */}
      <header className="exam-header">
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>{examData.examTitle}</h2>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{saveStatus}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: violations > 0 ? '#dc2626' : '#64748b' }}>
            <ShieldAlert size={16} />
            <span>Violations: <strong>{violations} / {examData.maxViolationsAllowed}</strong></span>
          </div>

          <div className={`exam-timer ${isTimeCritical ? 'timer-warning' : ''}`}>
            <Clock size={18} />
            <span>{formattedTime}</span>
          </div>

          <button onClick={() => setConfirmSubmitOpen(true)} className="btn btn-success btn-sm">
            <Send size={15} />
            <span>Finish & Submit</span>
          </button>
        </div>
      </header>

      {/* Main Exam Body */}
      <div className="exam-body">
        {/* Left: Question Content */}
        <main className="question-area">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#475569' }}>
              Question {currentIdx + 1} of {totalQuestions}
            </h3>
            <span className="badge badge-primary">
              +{currentQ.marks} Mark{currentQ.marks > 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ fontSize: '1.15rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.6, marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
            {getCleanQuestionText(currentQ.questionText, currentSection)}
          </div>

          {/* Section D: Built-in Multi-Language Code Compiler Workspace */}
          {currentSection === 'D' && (
            <div style={{ marginBottom: '1.5rem' }}>
              <CodeCompilerWorkspace
                questionId={currentQ.id}
                initialCode={textAnswers[currentQ.id] || ''}
                initialLanguage={codeLanguages[currentQ.id] || 'javascript'}
                onSaveAnswer={(codeVal, langVal) => handleSaveCodeAnswer(codeVal, langVal)}
                isSaved={!!textAnswers[currentQ.id]}
              />
            </div>
          )}

          {/* Section B & C: Written Response Input */}
          {(currentSection === 'B' || currentSection === 'C') && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e293b' }}>
                  {currentSection === 'C' ? 'Predicted Console Output:' : 'Your Written Answer / Explanation:'}
                </label>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  {(textAnswers[currentQ.id] || '').length} characters
                </span>
              </div>
              <textarea
                value={textAnswers[currentQ.id] || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  setTextAnswers(prev => ({ ...prev, [currentQ.id]: val }));
                }}
                onBlur={(e) => handleSaveTextAnswer(e.target.value)}
                placeholder={currentSection === 'C' ? 'Type the exact output predicted from the snippet above...' : 'Type your detailed answer here... Your response is automatically saved.'}
                rows={currentSection === 'C' ? 5 : 8}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '8px',
                  border: '2px solid #cbd5e1',
                  fontSize: '0.95rem',
                  fontFamily: currentSection === 'C' ? 'Consolas, Monaco, monospace' : 'inherit',
                  lineHeight: 1.6,
                  outline: 'none',
                  background: 'white',
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => handleSaveTextAnswer(textAnswers[currentQ.id] || '')}
                  className="btn btn-primary btn-sm"
                >
                  <Check size={14} />
                  <span>Save Answer</span>
                </button>
              </div>
            </div>
          )}

          {/* Section A: Traditional MCQ Options */}
          {currentSection === 'A' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2.5rem' }}>
              {currentQ.options && currentQ.options.map((opt, oIndex) => {
                const isSelected = selectedAnswers[currentQ.id] === opt.id;
                const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];
                return (
                  <div
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.id)}
                    style={{
                      padding: '1rem 1.25rem',
                      borderRadius: '8px',
                      border: `2px solid ${isSelected ? '#2563eb' : '#e2e8f0'}`,
                      background: isSelected ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: isSelected ? '#2563eb' : '#f1f5f9',
                        color: isSelected ? 'white' : '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        flexShrink: 0,
                      }}
                    >
                      {optionLetters[oIndex] || oIndex + 1}
                    </span>
                    <span style={{ fontSize: '1rem', color: isSelected ? '#1e40af' : '#1e293b', fontWeight: isSelected ? 600 : 400 }}>
                      {opt.optionText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Action Navigation Buttons */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleClearAnswer}
                disabled={!isQuestionAnswered(currentQ.id)}
                className="btn btn-secondary btn-sm"
              >
                Clear Response
              </button>
              <button
                onClick={handleToggleReview}
                className={`btn btn-sm ${reviewFlags[currentQ.id] ? 'btn-primary' : 'btn-secondary'}`}
              >
                {reviewFlags[currentQ.id] ? '★ Marked for Review' : '☆ Mark for Review'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(currentIdx - 1)}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <button
                disabled={currentIdx === totalQuestions - 1}
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="btn btn-primary"
              >
                Save & Next
              </button>
            </div>
          </div>
        </main>

        {/* Right: Palette & Proctoring Preview */}
        <aside className="palette-area">
          {/* Webcam Live Feed */}
          {examData.enableWebcam && (
            <div className="webcam-feed-pill">
              <video ref={videoRef} autoPlay playsInline muted />
              <div className="webcam-status-dot">
                <span />
                <span>REC / AI PROCTOR</span>
              </div>
            </div>
          )}

          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>
            Question Palette
          </h4>

          {/* Palette Legend */}
          <div style={{ fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', color: '#64748b', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#22c55e', borderRadius: '2px' }} />
              <span>Answered ({answeredCount})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#a855f7', borderRadius: '2px' }} />
              <span>Marked for Review ({Object.values(reviewFlags).filter(Boolean).length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ width: '12px', height: '12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '2px' }} />
              <span>Unanswered ({totalQuestions - answeredCount})</span>
            </div>
          </div>

          {/* Palette Grid */}
          <div className="palette-grid">
            {examData.questions.map((q, index) => {
              const isAnswered = isQuestionAnswered(q.id);
              const isReviewed = !!reviewFlags[q.id];
              const isCurrent = currentIdx === index;

              let className = 'palette-btn';
              if (isReviewed) className += ' reviewed';
              else if (isAnswered) className += ' answered';
              else className += ' unanswered';
              if (isCurrent) className += ' active';

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(index)}
                  className={className}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button onClick={() => setConfirmSubmitOpen(true)} className="btn btn-success" style={{ width: '100%' }}>
              Submit Exam Attempt
            </button>
          </div>
        </aside>
      </div>

      {/* Final Submission Confirmation Modal */}
      {confirmSubmitOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Confirm Exam Submission
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              Are you sure you want to finalize and submit your exam? You cannot modify answers after submission.
            </p>

            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Total Questions:</span>
                <strong>{totalQuestions}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Answered:</span>
                <strong style={{ color: '#16a34a' }}>{answeredCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Unanswered:</span>
                <strong style={{ color: '#dc2626' }}>{totalQuestions - answeredCount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Marked for Review:</span>
                <strong style={{ color: '#9333ea' }}>{Object.values(reviewFlags).filter(Boolean).length}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                disabled={submitting}
                onClick={() => setConfirmSubmitOpen(false)}
                className="btn btn-secondary"
              >
                Return to Exam
              </button>
              <button
                disabled={submitting}
                onClick={handleFinalSubmit}
                className="btn btn-success"
              >
                {submitting ? 'Submitting...' : 'Yes, Submit Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
