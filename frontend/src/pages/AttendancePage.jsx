import { useState, useEffect, useCallback } from 'react';
import { attendanceAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function AttendancePage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  isAuthenticated,
  user
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mark Attendance Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newStatus, setNewStatus] = useState('Present');
  const [newSessionType, setNewSessionType] = useState('Lecture');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newRemarks, setNewRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;
      if (subjectFilter !== 'All') params.subject = subjectFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await attendanceAPI.get(params);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load attendance');
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching attendance records');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, subjectFilter, statusFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  const handleMarkAttendance = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    setSubmitting(true);
    try {
      const res = await attendanceAPI.create({
        studentId: selectedStudentId || data?.student?._id,
        subject: newSubject.trim(),
        status: newStatus,
        sessionType: newSessionType,
        date: newDate,
        remarks: newRemarks
      });
      if (res.success) {
        setIsModalOpen(false);
        setNewSubject('');
        setNewRemarks('');
        fetchAttendance();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const student = data?.student;
  const summary = data?.summary || { totalClasses: 0, attendedClasses: 0, percentage: 0 };
  const subjectWise = data?.subjectWise || [];
  const records = data?.records || [];

  return (
    <div className="portal-page">
      {/* Page Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.CalendarCheck className="icon-md text-primary" />
            <span>Attendance Portal</span>
          </h1>
          <p className="page-subtitle">
            Monitor academic presence, lecture attendance percentages, and examination eligibility.
          </p>
        </div>

        <div className="flex-center gap-2">
          {isAuthenticated && user?.role !== 'student' && (
            <button
              type="button"
              className="btn btn-primary btn-sm flex-center gap-1"
              onClick={() => setIsModalOpen(true)}
            >
              <Icons.Plus className="icon-xs" />
              <span>Mark Attendance</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm flex-center gap-1"
            onClick={fetchAttendance}
            title="Refresh attendance records"
          >
            <Icons.Refresh className="icon-xs" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Student Banner */}
      {student && (
        <div className="student-context-banner">
          <div className="student-context-info">
            <div className="student-context-avatar">
              {student.name.charAt(0)}
            </div>
            <div>
              <div className="student-context-name">{student.name}</div>
              <div className="student-context-meta">
                <span>Roll: {student.rollNumber}</span> &bull;{' '}
                <span>Course: {student.course}</span> &bull;{' '}
                <span>Semester: {student.semester}</span>
              </div>
            </div>
          </div>

          {user?.role !== 'student' && studentsList.length > 0 && (
            <div className="banner-student-switch">
              <span className="text-xs text-muted">Viewing student:</span>
              <select
                className="form-select form-select-sm"
                value={selectedStudentId || student._id}
                onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
              >
                {studentsList.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.rollNumber})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Retrieving student attendance database...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : (
        <>
          {/* Summary KPI Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon-wrapper bg-primary-light">
                <Icons.CalendarCheck className="icon-md text-primary" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Total Classes</span>
                <span className="stat-value">{summary.totalClasses}</span>
                <span className="stat-sub">Conducted this term</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-success-light">
                <Icons.CheckCircle className="icon-md text-success" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Attended Classes</span>
                <span className="stat-value">{summary.attendedClasses}</span>
                <span className="stat-sub text-success">Lectures & Labs</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-danger-light">
                <Icons.Close className="icon-md text-danger" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Absent Classes</span>
                <span className="stat-value">{summary.absentClasses || 0}</span>
                <span className="stat-sub text-muted">Missed sessions</span>
              </div>
            </div>

            <div className="stat-card">
              <div
                className={`stat-icon-wrapper ${
                  summary.percentage >= 75 ? 'bg-success-light' : 'bg-warning-light'
                }`}
              >
                <Icons.Award
                  className={`icon-md ${
                    summary.percentage >= 75 ? 'text-success' : 'text-warning'
                  }`}
                />
              </div>
              <div className="stat-data">
                <span className="stat-label">Overall Percentage</span>
                <span className="stat-value">{summary.percentage}%</span>
                <span
                  className={`stat-sub font-medium ${
                    summary.isEligible ? 'text-success' : 'text-danger'
                  }`}
                >
                  {summary.isEligible
                    ? 'Eligible for Final Examinations'
                    : 'Short Attendance (< 75%)'}
                </span>
              </div>
            </div>
          </div>

          {/* Subject-Wise Attendance Progress Breakdown */}
          <div className="card mt-6">
            <div className="card-header">
              <h3 className="card-title">Subject-Wise Attendance Breakdown</h3>
              <span className="text-xs text-muted">
                Minimum 75% required per university regulation
              </span>
            </div>
            <div className="card-body">
              {subjectWise.length === 0 ? (
                <div className="empty-state p-6">
                  <Icons.CalendarCheck className="icon-xl text-muted" />
                  <h4>No Subject Attendance Records</h4>
                  <p>Attendance records have not yet been logged for this semester.</p>
                </div>
              ) : (
                <div className="subject-attendance-grid">
                  {subjectWise.map((sub) => (
                    <div key={sub.subject} className="subject-attendance-card">
                      <div className="justify-between">
                        <div>
                          <span className="subject-code-pill">
                            {sub.subjectCode || 'CORE'}
                          </span>
                          <h4 className="subject-title">{sub.subject}</h4>
                        </div>
                        <span
                          className={`badge ${
                            sub.percentage >= 75 ? 'badge-success' : 'badge-danger'
                          }`}
                        >
                          {sub.percentage}%
                        </span>
                      </div>

                      <div className="attendance-progress-bar-bg">
                        <div
                          className={`attendance-progress-bar-fill ${
                            sub.percentage >= 75 ? 'bg-success' : 'bg-danger'
                          }`}
                          style={{ width: `${Math.min(100, sub.percentage)}%` }}
                        />
                      </div>

                      <div className="justify-between text-xs text-muted mt-2">
                        <span>
                          Attended: <strong>{sub.attended}</strong> / {sub.total}
                        </span>
                        <span>
                          {sub.percentage >= 75 ? (
                            <span className="text-success">&bull; Eligible</span>
                          ) : (
                            <span className="text-danger">&bull; Below Threshold</span>
                          )}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Attendance History Log Table */}
          <div className="card mt-6">
            <div className="card-header justify-between">
              <div>
                <h3 className="card-title">Session Attendance Log</h3>
                <span className="text-xs text-muted">
                  Showing detailed daily entries for each course lecture and lab
                </span>
              </div>

              {/* Filters */}
              <div className="flex-center gap-2">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
            </div>

            <div className="card-body p-0">
              {records.length === 0 ? (
                <div className="empty-state p-6">
                  <p>No matching session logs found.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Subject</th>
                        <th>Session Type</th>
                        <th>Status</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec) => (
                        <tr key={rec._id}>
                          <td>
                            {new Date(rec.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>
                          <td className="font-medium text-main">
                            {rec.subject}
                            {rec.subjectCode && (
                              <span className="text-muted text-xs ml-1">
                                ({rec.subjectCode})
                              </span>
                            )}
                          </td>
                          <td>
                            <span className="badge badge-info">
                              {rec.sessionType || 'Lecture'}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`badge ${
                                rec.status === 'Present'
                                  ? 'badge-success'
                                  : rec.status === 'Absent'
                                  ? 'badge-danger'
                                  : 'badge-warning'
                              }`}
                            >
                              {rec.status}
                            </span>
                          </td>
                          <td className="text-muted text-sm">
                            {rec.remarks || 'Regular class session'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Mark Attendance Modal (For Admin / Staff) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title flex-center gap-1">
                <Icons.CalendarCheck className="icon-sm text-primary" />
                <span>Record Attendance Session</span>
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <Icons.Close className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleMarkAttendance}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="att-subject">Subject Name</label>
                  <input
                    id="att-subject"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Design & Analysis of Algorithms"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="att-date">Session Date</label>
                    <input
                      id="att-date"
                      type="date"
                      className="form-input"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="att-status">Attendance Status</label>
                    <select
                      id="att-status"
                      className="form-select"
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                    >
                      <option value="Present">Present</option>
                      <option value="Absent">Absent</option>
                      <option value="Late">Late</option>
                      <option value="Excused">Excused</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="att-type">Session Type</label>
                    <select
                      id="att-type"
                      className="form-select"
                      value={newSessionType}
                      onChange={(e) => setNewSessionType(e.target.value)}
                    >
                      <option value="Lecture">Lecture</option>
                      <option value="Practical / Lab">Practical / Lab</option>
                      <option value="Tutorial">Tutorial</option>
                      <option value="Seminar">Seminar</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="att-remarks">Remarks (Optional)</label>
                    <input
                      id="att-remarks"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Attended lab session"
                      value={newRemarks}
                      onChange={(e) => setNewRemarks(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? 'Recording...' : 'Save Attendance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
