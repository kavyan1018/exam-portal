import React, { useState, useEffect } from 'react';
import api from '../api/client';
import {
  X, Calendar, ClipboardCheck, Users, CheckCircle, XCircle, AlertCircle,
  FileText, Download, Trash2, Edit3, ArrowRight, Sparkles, RefreshCw
} from 'lucide-react';

const COMMON_LANGUAGES = ['CSS', 'HTML', 'JavaScript', 'Java', 'Python', 'React', 'Node.js', 'SQL', 'C++'];

export default function BatchAttendanceModal({ onClose }) {
  const [activeTab, setActiveTab] = useState('sheet'); // 'sheet', 'quick-paste', 'history'
  const [batches, setBatches] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [customBatch, setCustomBatch] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [sessionLanguage, setSessionLanguage] = useState('CSS');
  const [customLanguage, setCustomLanguage] = useState('');
  const [sessionTopic, setSessionTopic] = useState('Morning Session');

  // Sheet state
  const [sheet, setSheet] = useState([]);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Quick Paste state
  const [rawNamesText, setRawNamesText] = useState('');
  const [markOthersAbsent, setMarkOthersAbsent] = useState(true);
  const [quickImporting, setQuickImporting] = useState(false);

  // History state
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Load initial batch list
  useEffect(() => {
    fetchBatches();
  }, []);

  // When batch, date, or sessionLanguage changes, auto-fetch sheet
  useEffect(() => {
    const effectiveBatch = selectedBatch === '__NEW__' ? customBatch : selectedBatch;
    const effectiveLang = sessionLanguage === '__CUSTOM__' ? customLanguage : sessionLanguage;

    if (effectiveBatch && attendanceDate && effectiveLang) {
      loadSheet(effectiveBatch, attendanceDate, effectiveLang);
    }
  }, [selectedBatch, customBatch, attendanceDate, sessionLanguage, customLanguage]);

  const fetchBatches = async () => {
    try {
      const res = await api.get('/api/v1/attendance/batches');
      setBatches(res.data);
      if (res.data.length > 0 && !selectedBatch) {
        setSelectedBatch(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load batches', err);
    }
  };

  const getEffectiveBatch = () => selectedBatch === '__NEW__' ? customBatch.trim() : selectedBatch;
  const getEffectiveLang = () => sessionLanguage === '__CUSTOM__' ? customLanguage.trim() : sessionLanguage;

  const loadSheet = async (batch, date, lang) => {
    if (!batch) return;
    setLoadingSheet(true);
    setMessage('');
    try {
      const res = await api.get('/api/v1/attendance/sheet', {
        params: {
          batchName: batch,
          date: date,
          sessionLanguage: lang,
        }
      });
      setSheet(res.data);
      if (res.data.length > 0 && res.data[0].sessionTopic) {
        setSessionTopic(res.data[0].sessionTopic);
      }
    } catch (err) {
      console.error('Failed to fetch attendance sheet', err);
    } finally {
      setLoadingSheet(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const effectiveBatch = getEffectiveBatch();
      const res = await api.get('/api/v1/attendance/history', {
        params: effectiveBatch ? { batchName: effectiveBatch } : {}
      });
      setHistory(res.data);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleStatusChange = (index, newStatus) => {
    setSheet(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status: newStatus };
      return updated;
    });
  };

  const handleMarkAll = (status) => {
    setSheet(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSaveSheet = async () => {
    const batch = getEffectiveBatch();
    const lang = getEffectiveLang();

    if (!batch) {
      alert('Please select or specify a Batch Name.');
      return;
    }
    if (!lang) {
      alert('Please select or specify a Language / Session.');
      return;
    }

    setSaving(true);
    setMessage('');
    try {
      await api.post('/api/v1/attendance/save', {
        batchName: batch,
        attendanceDate: attendanceDate,
        sessionLanguage: lang,
        sessionTopic: sessionTopic,
        records: sheet.map(s => ({
          studentName: s.studentName,
          studentEmail: s.studentEmail,
          status: s.status,
          remarks: s.remarks,
        }))
      });
      setMessage(`Attendance successfully recorded for ${batch} on ${attendanceDate} (${lang})!`);
      loadSheet(batch, attendanceDate, lang);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickImport = async () => {
    const batch = getEffectiveBatch();
    const lang = getEffectiveLang();

    if (!batch) {
      alert('Please enter or select a Batch Name.');
      return;
    }
    if (!lang) {
      alert('Please specify the Language / Session.');
      return;
    }
    if (!rawNamesText.trim()) {
      alert('Please paste the student names list.');
      return;
    }

    setQuickImporting(true);
    setMessage('');
    try {
      const res = await api.post('/api/v1/attendance/quick-import', {
        batchName: batch,
        attendanceDate: attendanceDate,
        sessionLanguage: lang,
        sessionTopic: sessionTopic,
        rawText: rawNamesText,
        markOthersAbsent: markOthersAbsent,
      });

      setMessage(res.data.message || 'Attendance processed successfully!');
      setSheet(res.data.records || []);
      setActiveTab('sheet');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process quick import');
    } finally {
      setQuickImporting(false);
    }
  };

  const handleDeleteSession = async (item) => {
    if (!window.confirm(`Delete attendance record for ${item.batchName} on ${item.attendanceDate} (${item.sessionLanguage})?`)) return;
    try {
      await api.delete('/api/v1/attendance/session', {
        params: {
          batchName: item.batchName,
          date: item.attendanceDate,
          sessionLanguage: item.sessionLanguage,
        }
      });
      setMessage('Attendance session deleted.');
      loadHistory();
      if (item.batchName === getEffectiveBatch()) {
        loadSheet(item.batchName, attendanceDate, getEffectiveLang());
      }
    } catch (err) {
      alert('Failed to delete session');
    }
  };

  const handleExportCsv = (item) => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + `Batch,Date,Language,Topic,Total Students,Present,Absent,Attendance Rate\n`
      + `"${item.batchName}","${item.attendanceDate}","${item.sessionLanguage}","${item.sessionTopic || ''}",${item.totalStudents},${item.presentCount},${item.absentCount},"${item.attendanceRate}%"\n`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_${item.batchName}_${item.attendanceDate}_${item.sessionLanguage}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const presentCount = sheet.filter(s => s.status === 'PRESENT').length;
  const absentCount = sheet.filter(s => s.status === 'ABSENT').length;
  const lateCount = sheet.filter(s => s.status === 'LATE').length;
  const totalCount = sheet.length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '980px', maxHeight: '92vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.85rem', marginBottom: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ClipboardCheck size={28} color="#059669" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Batch-wise Attendance Management
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.82rem' }}>
                Track student attendance by Batch, Date, and Language Session. Supports quick paste list imports.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={22} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
          <button
            onClick={() => setActiveTab('sheet')}
            className={`btn btn-sm ${activeTab === 'sheet' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ClipboardCheck size={14} />
            <span>Attendance Sheet</span>
          </button>

          <button
            onClick={() => setActiveTab('quick-paste')}
            className={`btn btn-sm ${activeTab === 'quick-paste' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Sparkles size={14} />
            <span>📋 Quick Paste Student List</span>
          </button>

          <button
            onClick={() => { setActiveTab('history'); loadHistory(); }}
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Calendar size={14} />
            <span>Session History & Reports</span>
          </button>
        </div>

        {message && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        {/* Global Session Config Bar */}
        <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'flex-end' }}>
            {/* Batch Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>1. Select Batch *</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  className="form-select"
                  style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                >
                  {batches.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                  <option value="__NEW__">+ Custom / New Batch</option>
                </select>
                {selectedBatch === '__NEW__' && (
                  <input
                    type="text"
                    placeholder="Enter Batch Name"
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    value={customBatch}
                    onChange={(e) => setCustomBatch(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Date Selector */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>2. Attendance Date *</label>
              <input
                type="date"
                required
                className="form-input"
                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>

            {/* Language / Session */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>3. Language / Session *</label>
              <div style={{ display: 'flex', gap: '4px' }}>
                <select
                  className="form-select"
                  style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                  value={sessionLanguage}
                  onChange={(e) => setSessionLanguage(e.target.value)}
                >
                  {COMMON_LANGUAGES.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                  <option value="__CUSTOM__">Other Language / Topic...</option>
                </select>
                {sessionLanguage === '__CUSTOM__' && (
                  <input
                    type="text"
                    placeholder="e.g. Flutter, Go"
                    className="form-input"
                    style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                    value={customLanguage}
                    onChange={(e) => setCustomLanguage(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* Session Topic */}
            <div>
              <label className="form-label" style={{ fontSize: '0.75rem', fontWeight: 600 }}>Session Topic / Time</label>
              <input
                type="text"
                placeholder="e.g. Morning Session / CSS Grid"
                className="form-input"
                style={{ padding: '0.4rem', fontSize: '0.85rem' }}
                value={sessionTopic}
                onChange={(e) => setSessionTopic(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Tab 1: Interactive Sheet */}
        {activeTab === 'sheet' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            {/* Sheet Stats & Bulk Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.85rem' }}>
                <span style={{ color: '#0f172a', fontWeight: 700 }}>Total: {totalCount}</span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>● Present: {presentCount}</span>
                <span style={{ color: '#dc2626', fontWeight: 600 }}>● Absent: {absentCount}</span>
                {lateCount > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>● Late: {lateCount}</span>}
                <span className="badge badge-primary" style={{ fontSize: '0.8rem' }}>
                  {attendanceRate}% Present
                </span>
              </div>

              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleMarkAll('PRESENT')}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#16a34a', borderColor: '#bbf7d0', fontSize: '0.775rem' }}
                >
                  <CheckCircle size={13} />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('ABSENT')}
                  className="btn btn-secondary btn-sm"
                  style={{ color: '#dc2626', borderColor: '#fca5a5', fontSize: '0.775rem' }}
                >
                  <XCircle size={13} />
                  <span>Mark All Absent</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveSheet}
                  disabled={saving || sheet.length === 0}
                  className="btn btn-primary btn-sm"
                  style={{ fontSize: '0.775rem' }}
                >
                  <ClipboardCheck size={14} />
                  <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              {loadingSheet ? (
                <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading attendance sheet...</p>
              ) : sheet.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                  <Users size={36} style={{ margin: '0 auto 0.5rem', opacity: 0.4 }} />
                  <p style={{ fontWeight: 600 }}>No students enrolled in batch "{getEffectiveBatch()}".</p>
                  <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
                    Use the <strong>"📋 Quick Paste Student List"</strong> tab to directly paste student names!
                  </p>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.775rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.65rem 0.75rem', width: '45px' }}>#</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Student Name</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Email / Roll No</th>
                      <th style={{ padding: '0.65rem 0.75rem', textAlign: 'center' }}>Attendance Status</th>
                      <th style={{ padding: '0.65rem 0.75rem' }}>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sheet.map((item, idx) => {
                      const isPresent = item.status === 'PRESENT';
                      const isAbsent = item.status === 'ABSENT';
                      const isLate = item.status === 'LATE';

                      return (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            background: isPresent ? '#f0fdf4' : isAbsent ? '#fef2f2' : '#fffbeb'
                          }}
                        >
                          <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                            {idx + 1}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', fontWeight: 600, color: '#0f172a' }}>
                            {item.studentName}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                            {item.studentEmail || '-'}
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: '3px', background: '#ffffff', padding: '2px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(idx, 'PRESENT')}
                                style={{
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  background: isPresent ? '#16a34a' : 'transparent',
                                  color: isPresent ? '#ffffff' : '#64748b'
                                }}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(idx, 'ABSENT')}
                                style={{
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px 10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  background: isAbsent ? '#dc2626' : 'transparent',
                                  color: isAbsent ? '#ffffff' : '#64748b'
                                }}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                onClick={() => handleStatusChange(idx, 'LATE')}
                                style={{
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '4px 8px',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  borderRadius: '4px',
                                  background: isLate ? '#d97706' : 'transparent',
                                  color: isLate ? '#ffffff' : '#64748b'
                                }}
                              >
                                Late
                              </button>
                            </div>
                          </td>
                          <td style={{ padding: '0.6rem 0.75rem' }}>
                            <input
                              type="text"
                              placeholder="Notes..."
                              className="form-input"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              value={item.remarks || ''}
                              onChange={(e) => {
                                const val = e.target.value;
                                setSheet(prev => {
                                  const updated = [...prev];
                                  updated[idx] = { ...updated[idx], remarks: val };
                                  return updated;
                                });
                              }}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Quick Paste Student Names */}
        {activeTab === 'quick-paste' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '0.85rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#166534', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} />
                <span>Quick Paste Student Names List</span>
              </h4>
              <p style={{ fontSize: '0.82rem', color: '#15803d' }}>
                Paste your student names list below (one name per line or comma-separated).
                The system will automatically recognize the students, mark them <strong>PRESENT</strong> for <strong>{getEffectiveBatch()}</strong> on <strong>{attendanceDate} ({getEffectiveLang()})</strong>, and record their attendance in one click!
              </p>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label className="form-label" style={{ fontWeight: 700, fontSize: '0.85rem' }}>
                Paste Student Names List *
              </label>
              <textarea
                rows={9}
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem', lineHeight: '1.4' }}
                placeholder={"Example:\nRahul Sharma\nKavya Verma\nMegha Sonavane\nPooja Patel\nAmit Kumar"}
                value={rawNamesText}
                onChange={(e) => setRawNamesText(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#334155', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={markOthersAbsent}
                  onChange={(e) => setMarkOthersAbsent(e.target.checked)}
                />
                <span>Automatically mark enrolled batch students not in this pasted list as <strong>ABSENT</strong></span>
              </label>

              <button
                type="button"
                onClick={handleQuickImport}
                disabled={quickImporting || !rawNamesText.trim()}
                className="btn btn-primary"
                style={{ padding: '0.65rem 1.25rem' }}
              >
                <ClipboardCheck size={18} />
                <span>{quickImporting ? 'Processing...' : 'Apply & Save Attendance Now'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 3: History & Reports */}
        {activeTab === 'history' && (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a' }}>
                Past Attendance Logs for {getEffectiveBatch() || 'All Batches'}
              </h4>
              <button onClick={loadHistory} className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <RefreshCw size={13} />
                <span>Refresh</span>
              </button>
            </div>

            {loadingHistory ? (
              <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading session logs...</p>
            ) : history.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>No recorded sessions found for this batch.</p>
            ) : (
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '0.75rem' }}>Date</th>
                      <th style={{ padding: '0.75rem' }}>Batch Name</th>
                      <th style={{ padding: '0.75rem' }}>Language / Session</th>
                      <th style={{ padding: '0.75rem' }}>Topic / Notes</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Present / Total</th>
                      <th style={{ padding: '0.75rem', textAlign: 'center' }}>Attendance %</th>
                      <th style={{ padding: '0.75rem' }}>Marked By</th>
                      <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                          {item.attendanceDate}
                        </td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className="badge badge-primary">{item.batchName}</span>
                        </td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#2563eb' }}>
                          {item.sessionLanguage}
                        </td>
                        <td style={{ padding: '0.75rem', color: '#64748b' }}>
                          {item.sessionTopic || '-'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{ color: '#16a34a', fontWeight: 700 }}>{item.presentCount}</span> / {item.totalStudents}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            background: item.attendanceRate >= 75 ? '#dcfce7' : '#fee2e2',
                            color: item.attendanceRate >= 75 ? '#15803d' : '#b91c1c'
                          }}>
                            {item.attendanceRate}%
                          </span>
                        </td>
                        <td style={{ padding: '0.75rem', color: '#64748b', fontSize: '0.8rem' }}>
                          {item.markedBy || 'Faculty'}
                        </td>
                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => {
                                setSelectedBatch(item.batchName);
                                setAttendanceDate(item.attendanceDate);
                                setSessionLanguage(item.sessionLanguage);
                                setSessionTopic(item.sessionTopic || '');
                                setActiveTab('sheet');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                              title="Open attendance sheet"
                            >
                              <Edit3 size={12} />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => handleExportCsv(item)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.4rem', color: '#059669' }}
                              title="Export CSV"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(item)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.4rem', color: '#dc2626' }}
                              title="Delete record"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
            Batch: <strong>{getEffectiveBatch() || 'None selected'}</strong> | Date: <strong>{attendanceDate}</strong> | Session: <strong>{getEffectiveLang()}</strong>
          </span>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Attendance
          </button>
        </div>
      </div>
    </div>
  );
}
