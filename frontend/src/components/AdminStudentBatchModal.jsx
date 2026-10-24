import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { X, Users, UserPlus, Layers, Search, CheckSquare, Square, Edit2, Check, UserMinus, Trash2 } from 'lucide-react';

export default function AdminStudentBatchModal({ onClose }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [targetBulkBatch, setTargetBulkBatch] = useState('');
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingBatchValue, setEditingBatchValue] = useState('');

  // Add student form
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    email: '',
    password: '',
    studentId: '', // Batch Name
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/v1/admin/students');
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    try {
      await api.post('/api/v1/admin/students', newStudent);
      setMessage(`Student ${newStudent.fullName} enrolled into batch "${newStudent.studentId || 'General Batch'}"!`);
      setNewStudent({ fullName: '', email: '', password: '', studentId: '' });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to enroll student');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveInlineBatch = async (studentId) => {
    try {
      await api.put(`/api/v1/admin/students/${studentId}/batch`, {
        batch: editingBatchValue,
      });
      setEditingStudentId(null);
      setMessage(`Batch updated successfully.`);
      fetchStudents();
    } catch (err) {
      alert("Failed to update batch");
    }
  };

  const handleRemoveSingleFromBatch = async (student) => {
    if (!window.confirm(`Remove ${student.fullName} from batch "${student.studentId || 'General Batch'}"?`)) return;
    try {
      await api.put(`/api/v1/admin/students/${student.id}/remove-batch`);
      setMessage(`Removed ${student.fullName} from batch.`);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to remove student from batch");
    }
  };

  const handleDeleteStudent = async (student) => {
    if (!window.confirm(`Permanently delete student account "${student.fullName}" (${student.email}) from portal?`)) return;
    try {
      try {
        await api.delete(`/api/v1/admin/students/${student.id}`);
      } catch (adminErr) {
        // Fallback to faculty endpoint
        await api.delete(`/api/v1/faculty/exams/students/${student.id}`);
      }
      setMessage(`Student account "${student.fullName}" deleted successfully.`);
      setSelectedStudentIds(prev => prev.filter(id => id !== student.id));
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete student account");
    }
  };

  const handleBulkAssignBatch = async () => {
    if (!targetBulkBatch.trim() || selectedStudentIds.length === 0) {
      alert("Please select at least one student and enter a Batch Name.");
      return;
    }

    try {
      await api.post('/api/v1/admin/students/bulk-batch', {
        batch: targetBulkBatch,
        studentIds: selectedStudentIds,
      });
      setMessage(`Successfully moved ${selectedStudentIds.length} students to batch "${targetBulkBatch}"!`);
      setSelectedStudentIds([]);
      setTargetBulkBatch('');
      fetchStudents();
    } catch (err) {
      alert("Failed to bulk assign batch");
    }
  };

  const handleBulkRemoveBatch = async () => {
    if (selectedStudentIds.length === 0) {
      alert("Please select at least one student to remove from their batch.");
      return;
    }

    if (!window.confirm(`Remove ${selectedStudentIds.length} selected student(s) from their assigned batches?`)) return;

    try {
      await api.post('/api/v1/admin/students/bulk-remove-batch', {
        studentIds: selectedStudentIds,
      });
      setMessage(`Successfully removed ${selectedStudentIds.length} students from their batches.`);
      setSelectedStudentIds([]);
      fetchStudents();
    } catch (err) {
      alert("Failed to bulk remove students from batch");
    }
  };

  const toggleSelectStudent = (id) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === filteredStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  // Distinct batches for filter
  const allBatches = Array.from(new Set(students.map(s => s.studentId).filter(Boolean)));

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesBatch = true;
    if (selectedBatchFilter === '__UNASSIGNED__') {
      matchesBatch = !s.studentId || s.studentId === 'Unassigned';
    } else if (selectedBatchFilter) {
      matchesBatch = s.studentId === selectedBatchFilter;
    }
    return matchesSearch && matchesBatch;
  });

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '980px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={26} color="#2563eb" />
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                Student Directory & Batch Management (Admin)
              </h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
                Total Enrolled Students: {students.length} across {allBatches.length} active batches
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
            <X size={22} />
          </button>
        </div>

        {message && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#16a34a', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {message}
          </div>
        )}

        <div style={{ overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
          {/* Quick Enroll Student Form */}
          <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} color="#2563eb" />
              <span>Directly Add Student to a Batch</span>
            </h4>
            <form onSubmit={handleAddStudent} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr) auto', gap: '0.5rem', alignItems: 'flex-end' }}>
              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  className="form-input"
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={newStudent.fullName}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Email *</label>
                <input
                  type="email"
                  required
                  placeholder="rahul@college.edu"
                  className="form-input"
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={newStudent.email}
                  onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Batch Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 2026-A"
                  className="form-input"
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={newStudent.studentId}
                  onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                />
              </div>

              <div>
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="form-input"
                  style={{ padding: '0.45rem', fontSize: '0.85rem' }}
                  value={newStudent.password}
                  onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                />
              </div>

              <button type="submit" disabled={submitting} className="btn btn-primary btn-sm" style={{ height: '36px' }}>
                <UserPlus size={14} />
                <span>Enroll</span>
              </button>
            </form>
          </div>

          {/* Filter & Bulk Actions Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '260px' }}>
              <input
                type="text"
                placeholder="Search by student name or email..."
                className="form-input"
                style={{ padding: '0.45rem 0.75rem', fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select
                className="form-select"
                style={{ padding: '0.45rem', fontSize: '0.85rem', width: '200px' }}
                value={selectedBatchFilter}
                onChange={(e) => setSelectedBatchFilter(e.target.value)}
              >
                <option value="">All Batches ({students.length})</option>
                <option value="__UNASSIGNED__">Unassigned / No Batch</option>
                {allBatches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Bulk Batch Actions */}
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Selected: <strong>{selectedStudentIds.length}</strong>
              </span>
              <input
                type="text"
                placeholder="Target Batch Name"
                className="form-input"
                style={{ padding: '0.45rem', fontSize: '0.85rem', width: '150px' }}
                value={targetBulkBatch}
                onChange={(e) => setTargetBulkBatch(e.target.value)}
              />
              <button
                type="button"
                onClick={handleBulkAssignBatch}
                disabled={selectedStudentIds.length === 0 || !targetBulkBatch.trim()}
                className="btn btn-secondary btn-sm"
              >
                <Layers size={14} />
                <span>Move to Batch</span>
              </button>
              <button
                type="button"
                onClick={handleBulkRemoveBatch}
                disabled={selectedStudentIds.length === 0}
                className="btn btn-secondary btn-sm"
                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                title="Remove selected students from their current batch"
              >
                <UserMinus size={14} />
                <span>Remove from Batch</span>
              </button>
            </div>
          </div>

          {/* Students Table */}
          {loading ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>Loading students...</p>
          ) : filteredStudents.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No students found matching filters.</p>
          ) : (
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.775rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem', width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ padding: '0.75rem' }}>Student Name</th>
                    <th style={{ padding: '0.75rem' }}>Email Address</th>
                    <th style={{ padding: '0.75rem' }}>Assigned Batch Name</th>
                    <th style={{ padding: '0.75rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => {
                    const isSelected = selectedStudentIds.includes(student.id);
                    const isEditing = editingStudentId === student.id;
                    const hasBatch = student.studentId && student.studentId !== 'Unassigned';

                    return (
                      <tr key={student.id} style={{ borderBottom: '1px solid #f1f5f9', background: isSelected ? '#eff6ff' : 'white' }}>
                        <td style={{ padding: '0.75rem', textAlign: 'center' }}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectStudent(student.id)}
                          />
                        </td>

                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#0f172a' }}>
                          {student.fullName}
                        </td>

                        <td style={{ padding: '0.75rem', color: '#475569' }}>
                          {student.email}
                        </td>

                        <td style={{ padding: '0.75rem' }}>
                          {isEditing ? (
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                              <input
                                type="text"
                                className="form-input"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', width: '140px' }}
                                value={editingBatchValue}
                                onChange={(e) => setEditingBatchValue(e.target.value)}
                              />
                              <button
                                onClick={() => handleSaveInlineBatch(student.id)}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.25rem 0.5rem' }}
                              >
                                <Check size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className={`badge ${hasBatch ? 'badge-primary' : 'badge-gray'}`}>
                              {hasBatch ? student.studentId : 'Unassigned'}
                            </span>
                          )}
                        </td>

                        <td style={{ padding: '0.75rem', textAlign: 'right' }}>
                          {!isEditing ? (
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              <button
                                onClick={() => {
                                  setEditingStudentId(student.id);
                                  setEditingBatchValue(student.studentId || '');
                                }}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                                title="Change assigned batch"
                              >
                                <Edit2 size={12} />
                                <span>Edit Batch</span>
                              </button>

                              {hasBatch && (
                                <button
                                  onClick={() => handleRemoveSingleFromBatch(student)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem', color: '#dc2626', borderColor: '#fca5a5' }}
                                  title="Remove from batch"
                                >
                                  <UserMinus size={12} />
                                  <span>Remove from Batch</span>
                                </button>
                              )}

                              <button
                                onClick={() => handleDeleteStudent(student)}
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '0.2rem 0.4rem', color: '#64748b' }}
                                title="Delete student account"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setEditingStudentId(null)}
                              className="btn btn-secondary btn-sm"
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem', marginTop: '1rem', textAlign: 'right' }}>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Close Directory
          </button>
        </div>
      </div>
    </div>
  );
}
