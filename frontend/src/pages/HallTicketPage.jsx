import { useState, useEffect, useCallback } from 'react';
import { hallTicketAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function HallTicketPage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  user
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHallTickets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;
      const res = await hallTicketAPI.get(params);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to load hall ticket');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching hall ticket');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => { fetchHallTickets(); }, [fetchHallTickets]);

  const handlePrint = () => {
    window.print();
  };

  const student = data?.student;
  const hallTickets = data?.hallTickets || [];
  const ht = hallTickets[0];

  return (
    <div className="portal-page">
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.Ticket className="icon-md text-primary" />
            <span>Examination Hall Ticket</span>
          </h1>
          <p className="page-subtitle">
            Official hall ticket / admit card for upcoming semester examinations. Print and carry to all exam sessions.
          </p>
        </div>

        <div className="flex-center gap-2">
          {user?.role !== 'student' && studentsList.length > 0 && (
            <select
              className="form-select form-select-sm"
              value={selectedStudentId || student?._id || ''}
              onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
            >
              {studentsList.map((st) => (
                <option key={st._id} value={st._id}>{st.name} ({st.rollNumber})</option>
              ))}
            </select>
          )}
          {ht && (
            <button className="btn btn-primary btn-sm flex-center gap-1" onClick={handlePrint}>
              <Icons.Printer className="icon-xs" />
              <span>Print Hall Ticket</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Retrieving hall ticket...</p></div>
      ) : error ? (
        <div className="error-banner"><Icons.AlertTriangle className="icon-md" /><span>{error}</span></div>
      ) : !ht ? (
        <div className="empty-state p-6 card">
          <Icons.Ticket className="icon-xl text-muted" />
          <h4>Hall Ticket Not Available</h4>
          <p>Your hall ticket has not been issued yet. Contact the Examination Department.</p>
        </div>
      ) : (
        <div className="hall-ticket-wrapper" id="hall-ticket-print">
          {/* Institution Header */}
          <div className="hall-ticket-card card">
            <div className="ht-institution-header">
              <div className="ht-institution-logo">
                <Icons.GraduationCap className="icon-xl text-primary" />
              </div>
              <div className="ht-institution-info">
                <h2 className="ht-institution-name">{ht.institutionName}</h2>
                <p className="ht-affiliation">Affiliated to State Technical University &bull; AICTE Approved &bull; NAAC A+ Accredited</p>
                <div className="ht-title-badge">
                  OFFICIAL EXAMINATION HALL TICKET / ADMIT CARD
                </div>
              </div>
            </div>

            {/* Hall Ticket Details Grid */}
            <div className="ht-details-grid">
              <div className="ht-student-info">
                <h3 className="ht-section-title">Student Information</h3>
                <div className="ht-info-grid">
                  <div className="ht-info-row">
                    <span className="ht-info-label">Student Name:</span>
                    <span className="ht-info-value font-bold">{ht.student?.name}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Roll Number:</span>
                    <span className="ht-info-value font-bold text-primary">{ht.student?.rollNumber}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Course / Program:</span>
                    <span className="ht-info-value">{ht.student?.course}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Department:</span>
                    <span className="ht-info-value">{ht.student?.department}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Current Semester:</span>
                    <span className="ht-info-value">Semester {ht.semester}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Academic Year:</span>
                    <span className="ht-info-value">{ht.academicYear}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Hall Ticket No:</span>
                    <span className="ht-info-value font-bold text-primary">{ht.hallTicketNumber}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Exam Center Code:</span>
                    <span className="ht-info-value">{ht.centerCode}</span>
                  </div>
                  <div className="ht-info-row">
                    <span className="ht-info-label">Issue Date:</span>
                    <span className="ht-info-value">
                      {new Date(ht.issueDate || ht.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="ht-photo-box">
                <div className="ht-photo-placeholder">
                  <Icons.UserRound className="icon-xl text-muted" />
                  <span className="text-xs text-muted">Photograph</span>
                </div>
                <div className="ht-stamp-box">
                  <span className="text-xs text-muted">Controller of Examinations</span>
                  <div className="ht-stamp-circle">
                    <span className="text-xs font-bold text-primary">VERIFIED</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Exam Name */}
            <div className="ht-exam-title-bar">
              <h3>{ht.examName}</h3>
            </div>

            {/* Papers Schedule Table */}
            <div className="ht-papers-section">
              <h3 className="ht-section-title">Examination Paper Schedule</h3>
              <div className="table-responsive">
                <table className="data-table ht-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject Code</th>
                      <th>Subject / Paper Title</th>
                      <th>Examination Date</th>
                      <th>Session Time</th>
                      <th>Allotted Venue / Hall</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ht.papers.map((paper, idx) => (
                      <tr key={idx}>
                        <td className="font-bold">{idx + 1}</td>
                        <td><span className="subject-code-pill">{paper.subjectCode}</span></td>
                        <td className="font-medium">{paper.subjectName}</td>
                        <td className="font-medium">
                          {new Date(paper.examDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </td>
                        <td>
                          <div className="flex-center gap-1">
                            <Icons.Clock className="icon-xs text-primary" />
                            <span className="font-medium">{paper.time}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex-center gap-1">
                            <Icons.Building className="icon-xs text-muted" />
                            <span>{paper.venue}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Instructions */}
            {ht.instructions && ht.instructions.length > 0 && (
              <div className="ht-instructions-section">
                <h4 className="ht-section-title flex-center gap-1">
                  <Icons.Shield className="icon-xs text-primary" />
                  <span>Important Instructions to Candidates</span>
                </h4>
                <ol className="ht-instructions-list">
                  {ht.instructions.map((inst, idx) => (
                    <li key={idx}>{inst}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Signature Footer */}
            <div className="ht-signature-footer">
              <div className="ht-signature-box">
                <div className="ht-signature-line"></div>
                <span className="text-xs text-muted">Student Signature</span>
              </div>
              <div className="ht-qr-placeholder">
                <div className="ht-qr-box">QR</div>
                <span className="text-xs text-muted">Scan for Verification</span>
              </div>
              <div className="ht-signature-box">
                <div className="ht-signature-line"></div>
                <span className="text-xs text-muted">Registrar / Principal Signature</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
