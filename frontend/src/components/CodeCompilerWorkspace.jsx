import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import api from '../api/client';
import {
  Play,
  Check,
  RotateCcw,
  Trash2,
  Terminal,
  Eye,
  Code2,
  Clock,
  AlertCircle,
  CheckCircle2,
  Copy
} from 'lucide-react';

const LANGUAGE_OPTIONS = [
  { id: 'html', label: 'HTML (HTML + CSS + JS)', monacoLang: 'html', isWeb: true },
  { id: 'css', label: 'CSS', monacoLang: 'css', isWeb: true },
  { id: 'javascript', label: 'JavaScript', monacoLang: 'javascript', isWeb: false },
  { id: 'c', label: 'C', monacoLang: 'c', isWeb: false },
  { id: 'cpp', label: 'C++', monacoLang: 'cpp', isWeb: false },
  { id: 'java', label: 'Java', monacoLang: 'java', isWeb: false },
  { id: 'python', label: 'Python', monacoLang: 'python', isWeb: false },
  { id: 'dsa', label: 'DSA', monacoLang: 'cpp', isWeb: false },
];

const STARTER_TEMPLATES = {
  html: '',
  css: '',
  javascript: '',
  c: '',
  cpp: '',
  java: '',
  python: '',
  dsa: ''
};

export default function CodeCompilerWorkspace({
  questionId,
  initialCode = '',
  initialLanguage = 'javascript',
  onSaveAnswer,
  isSaved = false
}) {
  const [language, setLanguage] = useState(() => {
    const matched = LANGUAGE_OPTIONS.find(l => l.id === initialLanguage?.toLowerCase());
    return matched ? matched.id : 'javascript';
  });

  const [code, setCode] = useState(() => {
    return initialCode || '';
  });

  const [stdin, setStdin] = useState('');
  const [showStdin, setShowStdin] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const initialLang = initialLanguage?.toLowerCase() || 'html';
    return (initialLang === 'html' || initialLang === 'css') ? 'preview' : 'console';
  });
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [executionTime, setExecutionTime] = useState(null);
  const [exitCode, setExitCode] = useState(null);
  const [submitFeedback, setSubmitFeedback] = useState(false);

  const prevQIdRef = useRef(questionId);

  // Listen to sandbox logs and errors from iframe
  useEffect(() => {
    const handleIframeMessage = (e) => {
      if (e.data && e.data.type === 'IFRAME_LOG') {
        const prefix = e.data.level === 'error' ? '[ERROR] ' : e.data.level === 'warn' ? '[WARN] ' : '';
        setOutput(prev => prev ? `${prev}\n${prefix}${e.data.args}` : `${prefix}${e.data.args}`);
        if (e.data.level === 'error') {
          setExitCode(1);
        }
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  // Sync state if questionId changes
  useEffect(() => {
    if (prevQIdRef.current !== questionId) {
      prevQIdRef.current = questionId;
      const initialLang = initialLanguage?.toLowerCase() || 'html';
      const matched = LANGUAGE_OPTIONS.find(l => l.id === initialLang) ? initialLang : 'html';
      setLanguage(matched);
      setCode(initialCode || '');
      setOutput('');
      setError('');
      setExitCode(null);
      setExecutionTime(null);
      setSubmitFeedback(false);
      if (matched === 'html' || matched === 'css') {
        setActiveTab('preview');
      } else {
        setActiveTab('console');
      }
    }
  }, [questionId, initialCode, initialLanguage]);

  // Handle language switch
  const handleLanguageChange = (newLang) => {
    if (newLang === language) return;
    setLanguage(newLang);
    // If switching to HTML/CSS, default tab to preview
    if (newLang === 'html' || newLang === 'css') {
      setActiveTab('preview');
    } else {
      setActiveTab('console');
    }
  };

  const handleReset = () => {
    if (window.confirm("Clear all code in the editor?")) {
      setCode('');
      setOutput('');
      setError('');
      setExitCode(null);
      setExecutionTime(null);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear all code in the editor?")) {
      setCode('');
    }
  };

  // Run Code logic
  const handleRunCode = async () => {
    setRunning(true);
    setOutput('');
    setError('');
    setExitCode(null);
    setExecutionTime(null);

    const startTime = performance.now();

    // 1. Client-side execution for HTML / CSS (allows HTML + CSS + JS in 1 file)
    if (language === 'html' || language === 'css') {
      setActiveTab('preview');
      setRunning(false);
      setOutput("Live sandboxed preview updated. Any console.log() or JS script output will appear here.");
      setExitCode(0);
      setExecutionTime(Math.round(performance.now() - startTime));
      return;
    }

    // 2. Safe in-browser execution for JavaScript if offline/quick fallback, or call backend
    if (language === 'javascript') {
      try {
        let logs = [];
        const customConsole = {
          log: (...args) => logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' ')),
          warn: (...args) => logs.push('[WARN] ' + args.map(a => String(a)).join(' ')),
          error: (...args) => logs.push('[ERROR] ' + args.map(a => String(a)).join(' ')),
          info: (...args) => logs.push(args.map(a => String(a)).join(' '))
        };

        // Wrap execution in safe Function with captured console
        const runner = new Function('console', code);
        runner(customConsole);

        const duration = Math.round(performance.now() - startTime);
        setOutput(logs.join('\n') || '(Program executed successfully with no console output)');
        setExitCode(0);
        setExecutionTime(duration);
        setActiveTab('console');
        setRunning(false);
        return;
      } catch (clientErr) {
        // If client eval fails, try backend or report error
        setError(clientErr.toString());
        setExitCode(1);
        setExecutionTime(Math.round(performance.now() - startTime));
        setActiveTab('console');
        setRunning(false);
        return;
      }
    }

    // 3. Backend compilation for C, C++, Java, Python, DSA
    try {
      const res = await api.post('/api/v1/compiler/execute', {
        language,
        code,
        stdin
      });

      const data = res.data;
      if (data.output) {
        setOutput(data.output);
      }
      if (data.error) {
        setError(data.error);
      }
      setExitCode(data.exitCode);
      setExecutionTime(data.executionTimeMs);
      setActiveTab('console');
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to execute code on compiler server.";
      setError(errMsg);
      setExitCode(1);
      setActiveTab('console');
    } finally {
      setRunning(false);
    }
  };

  // Submit Code Answer
  const handleSubmitCode = () => {
    if (onSaveAnswer) {
      onSaveAnswer(code, language);
      setSubmitFeedback(true);
      setTimeout(() => setSubmitFeedback(false), 3000);
    }
  };

  // Build HTML srcDoc for preview (supports HTML + CSS + JS in a single file)
  const getPreviewDoc = () => {
    if (!code || !code.trim()) {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 90vh;
      margin: 0;
      background: #f8fafc;
      text-align: center;
    }
  </style>
</head>
<body>
  <div>
    <p style="font-size: 0.95rem; font-weight: 500; margin: 0;">Type your HTML / CSS / JS code in the editor above.</p>
    <p style="font-size: 0.8rem; color: #64748b; margin-top: 0.25rem;">Click "Run Code" to view your live rendered output.</p>
  </div>
</body>
</html>`;
    }

    if (language === 'html') {
      const consoleScript = `
        <script>
          (function() {
            var _log = console.log;
            var _error = console.error;
            var _warn = console.warn;
            console.log = function() {
              window.parent.postMessage({ type: 'IFRAME_LOG', level: 'log', args: Array.from(arguments).map(function(a){ return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') }, '*');
              _log.apply(console, arguments);
            };
            console.error = function() {
              window.parent.postMessage({ type: 'IFRAME_LOG', level: 'error', args: Array.from(arguments).map(function(a){ return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') }, '*');
              _error.apply(console, arguments);
            };
            console.warn = function() {
              window.parent.postMessage({ type: 'IFRAME_LOG', level: 'warn', args: Array.from(arguments).map(function(a){ return typeof a === 'object' ? JSON.stringify(a) : String(a); }).join(' ') }, '*');
              _warn.apply(console, arguments);
            };
            window.onerror = function(msg, url, line) {
              window.parent.postMessage({ type: 'IFRAME_LOG', level: 'error', args: 'Runtime Error: ' + msg + ' (line ' + line + ')' }, '*');
            };
          })();
        <\/script>
      `;

      let rendered = code;
      if (rendered.includes('<head>')) {
        rendered = rendered.replace('<head>', '<head>' + consoleScript);
      } else if (rendered.includes('<html>')) {
        rendered = rendered.replace('<html>', '<html><head>' + consoleScript + '</head>');
      } else {
        rendered = `<!DOCTYPE html><html><head><meta charset="UTF-8">${consoleScript}</head><body>${rendered}</body></html>`;
      }
      return rendered;
    }

    if (language === 'css') {
      return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { margin: 0; font-family: system-ui, sans-serif; background: #f8fafc; }
    .container { padding: 2rem; display: flex; justify-content: center; align-items: center; }
    .box { background: white; padding: 2rem; border-radius: 8px; border: 1px solid #cbd5e1; }
    ${code}
  </style>
</head>
<body>
  <div class="container">
    <div class="box">Preview Target Element (.box)</div>
  </div>
</body>
</html>`;
    }
    return '';
  };

  const selectedLangObj = LANGUAGE_OPTIONS.find(l => l.id === language) || LANGUAGE_OPTIONS[0];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: '#0f172a',
      borderRadius: '8px',
      overflow: 'hidden',
      border: '1px solid #334155',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Compiler Top Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        background: '#1e293b',
        borderBottom: '1px solid #334155',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#93c5fd', fontSize: '0.875rem', fontWeight: 600 }}>
            <Code2 size={18} />
            <span>Language:</span>
          </div>

          {/* EXACT 8 LANGUAGES ONLY */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              background: '#0f172a',
              color: '#f8fafc',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '0.35rem 0.75rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowStdin(!showStdin)}
            style={{
              background: showStdin ? '#334155' : 'transparent',
              color: '#cbd5e1',
              border: '1px solid #475569',
              borderRadius: '6px',
              padding: '0.35rem 0.65rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Terminal size={14} />
            <span>Stdin {showStdin ? '▲' : '▼'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={handleReset}
            title="Reset to default starter template"
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={handleClear}
            title="Clear all code in editor"
            style={{
              background: 'transparent',
              color: '#94a3b8',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '0.35rem 0.6rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Trash2 size={13} />
            <span>Clear</span>
          </button>

          {/* RUN CODE BUTTON */}
          <button
            type="button"
            onClick={handleRunCode}
            disabled={running}
            style={{
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 0.9rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: running ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              opacity: running ? 0.7 : 1
            }}
          >
            <Play size={14} />
            <span>{running ? 'Compiling...' : 'Run Code'}</span>
          </button>

          {/* SUBMIT CODE BUTTON */}
          <button
            type="button"
            onClick={handleSubmitCode}
            style={{
              background: submitFeedback ? '#15803d' : '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.4rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'background 0.2s ease'
            }}
          >
            <Check size={14} />
            <span>{submitFeedback ? 'Saved!' : 'Submit Code'}</span>
          </button>
        </div>
      </div>

      {/* Optional Stdin Custom Input Drawer */}
      {showStdin && (
        <div style={{
          background: '#0b1120',
          borderBottom: '1px solid #334155',
          padding: '0.65rem 1rem'
        }}>
          <label style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem' }}>
            CUSTOM STDIN (INPUT PASSED TO PROGRAM):
          </label>
          <textarea
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder="Type standard input here (e.g. numbers, strings)..."
            rows={2}
            style={{
              width: '100%',
              background: '#020617',
              color: '#e2e8f0',
              border: '1px solid #334155',
              borderRadius: '4px',
              padding: '0.4rem 0.6rem',
              fontSize: '0.85rem',
              fontFamily: 'monospace',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Monaco Code Editor Container */}
      <div style={{ height: '360px', width: '100%', position: 'relative' }}>
        <Editor
          height="100%"
          language={selectedLangObj.monacoLang}
          value={code}
          onChange={(newVal) => setCode(newVal || '')}
          theme="vs-dark"
          options={{
            fontSize: 13,
            minimap: { enabled: false },
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on'
          }}
        />
      </div>

      {/* Tabs Header: Console Output vs Live Preview */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#1e293b',
        borderTop: '1px solid #334155',
        borderBottom: '1px solid #334155',
        padding: '0.3rem 0.75rem'
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => setActiveTab('console')}
            style={{
              background: activeTab === 'console' ? '#0f172a' : 'transparent',
              color: activeTab === 'console' ? '#38bdf8' : '#94a3b8',
              border: 'none',
              borderBottom: activeTab === 'console' ? '2px solid #38bdf8' : 'none',
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            <Terminal size={14} />
            <span>Output Console</span>
          </button>

          {(language === 'html' || language === 'css') && (
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              style={{
                background: activeTab === 'preview' ? '#0f172a' : 'transparent',
                color: activeTab === 'preview' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderBottom: activeTab === 'preview' ? '2px solid #38bdf8' : 'none',
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Eye size={14} />
              <span>Live Web Preview</span>
            </button>
          )}
        </div>

        {/* Runtime info pill */}
        {executionTime !== null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: '#94a3b8' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={12} />
              <span>{executionTime}ms</span>
            </span>
            <span style={{
              color: exitCode === 0 ? '#4ade80' : '#f87171',
              fontWeight: 600
            }}>
              Exit Code: {exitCode}
            </span>
          </div>
        )}
      </div>

      {/* Tab Body: Console vs Live Preview */}
      {activeTab === 'preview' && (language === 'html' || language === 'css') ? (
        <div style={{
          height: '280px',
          background: 'white',
          padding: '0.5rem',
          overflow: 'auto'
        }}>
          <iframe
            title="Code Preview Sandbox"
            srcDoc={getPreviewDoc()}
            sandbox="allow-scripts allow-modals"
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              background: 'white'
            }}
          />
        </div>
      ) : (
        <div style={{
          height: '200px',
          background: '#020617',
          padding: '0.75rem 1rem',
          fontFamily: 'Consolas, Monaco, monospace',
          fontSize: '0.85rem',
          overflowY: 'auto',
          lineHeight: 1.5,
          color: '#e2e8f0',
          whiteSpace: 'pre-wrap'
        }}>
          {running && (
            <div style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="animate-spin" style={{ width: '12px', height: '12px', border: '2px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%' }} />
              <span>Running code on compiler sandbox...</span>
            </div>
          )}

          {!running && error && (
            <div style={{ color: '#f87171', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                <AlertCircle size={15} />
                <span>Compilation / Runtime Error:</span>
              </div>
              <div>{error}</div>
            </div>
          )}

          {!running && output && (
            <div style={{ color: '#f1f5f9' }}>
              {output}
            </div>
          )}

          {!running && !output && !error && (
            <span style={{ color: '#64748b', fontStyle: 'italic' }}>
              Click "Run Code" to compile and execute your program, or "Submit Code" to record your final solution for this question.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
