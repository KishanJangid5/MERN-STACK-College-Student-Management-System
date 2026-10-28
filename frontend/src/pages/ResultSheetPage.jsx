import { useState, useEffect, useCallback } from 'react';
import { resultSheetAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function ResultSheetPage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  user
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResultSheet = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;
      const res = await resultSheetAPI.get(params);
      if (res.success && res.resultSheet) {
        setData(res.resultSheet);
      } else {
        setError('No result sheet data found');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching result sheet');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => { fetchResultSheet(); }, [fetchResultSheet]);

  const handlePrint = () => window.print();

  const student = data?.student;
  const summary = data?.summary;
  const semesters = data?.semesters || [];
  const institution = data?.institution;
  const docDetails = data?.documentDetails;

  return (
    <div className="portal-page">
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.FileText className="icon-md text-primary" />
            <span>Official Consolidated Result Sheet</span>
          </h1>
          <p className="page-subtitle">
            University-issued consolidated grade sheet / transcript covering all recorded semesters and subject results.
          </p>
        </div>
        <div className="flex-center gap-2">
          {user?.role !== 'student' && studentsList.length > 0 && (
            <select
              className="form-select form-select-sm"
              value={selectedStudentId || student?.id || ''}
              onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
            >
              {studentsList.map((st) => (
                <option key={st._id} value={st._id}>{st.name} ({st.rollNumber})</option>
              ))}
            </select>
          )}
          {data && (
            <>
              <button className="btn btn-outline btn-sm flex-center gap-1" onClick={handlePrint}>
                <Icons.Printer className="icon-xs" />
                <span>Print Transcript</span>
              </button>
              <button className="btn btn-primary btn-sm flex-center gap-1" onClick={handlePrint}>
                <Icons.Download className="icon-xs" />
                <span>Download PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div><p>Generating consolidated result sheet...</p></div>
      ) : error ? (
        <div className="error-banner"><Icons.AlertTriangle className="icon-md" /><span>{error}</span></div>
      ) : !data ? (
        <div className="empty-state p-6 card">
          <Icons.FileText className="icon-xl text-muted" />
          <h4>No Result Sheet Available</h4>
          <p>No published results found for this student yet.</p>
        </div>
      ) : (
        <div className="result-sheet-wrapper" id="result-sheet-print">
          <div className="result-sheet-card card">

            {/* Institution Header */}
            <div className="rs-institution-header">
              <div className="rs-institution-seal">
                <Icons.GraduationCap className="icon-xl text-primary" />
              </div>
              <div className="rs-institution-center">
                <h2 className="rs-institution-name">{institution?.name}</h2>
                <p className="rs-affiliation">{institution?.affiliation}</p>
                <p className="text-xs text-muted">{institution?.accreditation}</p>
                <div className="rs-document-title">
                  {docDetails?.title}
                </div>
              </div>
              <div className="rs-doc-meta">
                <div className="text-xs text-muted">Serial No:</div>
                <div className="font-mono text-sm font-bold text-primary">{docDetails?.serialNumber}</div>
                <div className="text-xs text-muted mt-2">Issue Date:</div>
                <div className="text-sm font-medium">
                  {new Date(docDetails?.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div className="text-xs text-muted mt-2">Verification Code:</div>
                <div className="font-mono text-xs text-success">{docDetails?.verificationCode}</div>
              </div>
            </div>

            {/* Student Identity Strip */}
            <div className="rs-student-strip">
              <div className="rs-student-detail-grid">
                <div>
                  <span className="text-xs text-muted">Student Name</span>
                  <div className="font-bold text-main text-lg">{student?.name}</div>
                </div>
                <div>
                  <span className="text-xs text-muted">Enrollment / Roll Number</span>
                  <div className="font-bold text-primary">{student?.rollNumber}</div>
                </div>
                <div>
                  <span className="text-xs text-muted">Degree Programme</span>
                  <div className="font-medium">{student?.course}</div>
                </div>
                <div>
                  <span className="text-xs text-muted">Department</span>
                  <div className="font-medium">{student?.department}</div>
                </div>
                <div>
                  <span className="text-xs text-muted">Year of Admission</span>
                  <div className="font-medium">
                    {student?.enrollmentDate ? new Date(student.enrollmentDate).getFullYear() : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-muted">Current Semester</span>
                  <div className="font-medium">Semester {student?.currentSemester}</div>
                </div>
              </div>
            </div>

            {/* Semester-wise Results */}
            {semesters.length === 0 ? (
              <div className="empty-state p-6">
                <p className="text-muted">No published semester results on record.</p>
              </div>
            ) : (
              semesters.map((sem) => (
                <div key={sem._id} className="rs-semester-block">
                  <div className="rs-semester-header justify-between">
                    <div className="flex-center gap-2">
                      <span className="badge badge-primary">Semester {sem.semester}</span>
                      <strong>{sem.examName}</strong>
                      <span className="text-xs text-muted">| Academic Year: {sem.academicYear}</span>
                    </div>
                    <div className="flex-center gap-3">
                      <span className="text-sm">SGPA: <strong className="text-primary">{sem.sgpa}</strong></span>
                      <span className="text-sm">Percentage: <strong>{sem.percentage}%</strong></span>
                      <span className={`badge ${sem.resultStatus === 'Pass' ? 'badge-success' : 'badge-danger'}`}>
                        {sem.resultStatus}
                      </span>
                    </div>
                  </div>

                  <div className="table-responsive">
                    <table className="data-table rs-table">
                      <thead>
                        <tr>
                          <th>Code</th>
                          <th>Subject Title</th>
                          <th>Credits</th>
                          <th>Internal</th>
                          <th>External</th>
                          <th>Total</th>
                          <th>Max</th>
                          <th>Grade</th>
                          <th>Grade Points</th>
                          <th>Credit Points</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sem.subjects.map((sub) => (
                          <tr key={sub._id || sub.subjectCode}>
                            <td className="font-mono text-xs font-bold">{sub.subjectCode}</td>
                            <td className="font-medium">{sub.subjectName}</td>
                            <td className="text-center">{sub.credits}</td>
                            <td className="text-center">{sub.internalMarks}</td>
                            <td className="text-center">{sub.externalMarks}</td>
                            <td className="text-center font-bold">{sub.marksObtained}</td>
                            <td className="text-center text-muted">{sub.maxMarks}</td>
                            <td className="text-center">
                              <span className={`grade-badge ${sub.grade === 'O' || sub.grade === 'A+' || sub.grade === 'A' ? 'grade-excellent' : sub.grade === 'B+' || sub.grade === 'B' ? 'grade-good' : 'grade-fail'}`}>
                                {sub.grade}
                              </span>
                            </td>
                            <td className="text-center font-bold text-primary">{sub.gradePoint}</td>
                            <td className="text-center font-bold">{(sub.gradePoint * sub.credits).toFixed(1)}</td>
                            <td className="text-center">
                              <span className={`badge ${sub.status === 'Pass' ? 'badge-success' : 'badge-danger'}`}>{sub.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-footer-row">
                          <td colSpan="2" className="font-bold">Semester Totals:</td>
                          <td className="text-center font-bold">
                            {sem.subjects.reduce((a, s) => a + (s.credits || 0), 0)}
                          </td>
                          <td colSpan="2"></td>
                          <td className="text-center font-bold">{sem.totalMarksObtained}</td>
                          <td className="text-center font-bold">{sem.totalMaxMarks}</td>
                          <td colSpan="4" className="text-right">
                            <span className="font-bold text-primary">SGPA: {sem.sgpa}</span>
                            &nbsp;&nbsp;
                            <span className="font-medium text-muted">({sem.percentage}%)</span>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ))
            )}

            {/* Cumulative Summary Box */}
            {summary && (
              <div className="rs-summary-box">
                <h3 className="rs-summary-title">Cumulative Academic Performance Summary</h3>
                <div className="rs-summary-metrics">
                  <div className="rs-metric-item">
                    <span className="rs-metric-label">Semesters Recorded</span>
                    <span className="rs-metric-value">{summary.totalSemestersRecorded}</span>
                  </div>
                  <div className="rs-metric-item">
                    <span className="rs-metric-label">Total Credits Earned</span>
                    <span className="rs-metric-value">{summary.totalCreditsEarned}</span>
                  </div>
                  <div className="rs-metric-item">
                    <span className="rs-metric-label">Total Marks Obtained</span>
                    <span className="rs-metric-value">{summary.grandTotalMarksObtained} / {summary.grandTotalMaxMarks}</span>
                  </div>
                  <div className="rs-metric-item">
                    <span className="rs-metric-label">Overall Percentage</span>
                    <span className="rs-metric-value text-primary">{summary.overallPercentage}%</span>
                  </div>
                  <div className="rs-metric-item">
                    <span className="rs-metric-label">Cumulative CGPA</span>
                    <span className="rs-metric-value text-primary text-2xl font-bold">{summary.cgpa} / 10</span>
                  </div>
                  <div className="rs-metric-item">
                    <span className="rs-metric-label">Final Classification</span>
                    <span className="rs-metric-value text-success font-bold">{summary.finalClassification}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Footer */}
            <div className="rs-signature-footer">
              <div className="rs-signature-col">
                <div className="rs-signature-line"></div>
                <span>Head of Department</span>
              </div>
              <div className="rs-seal-box">
                <div className="rs-official-seal">
                  <Icons.GraduationCap className="icon-md text-primary" />
                  <span className="text-xs font-bold text-primary">OFFICIAL SEAL</span>
                </div>
              </div>
              <div className="rs-signature-col">
                <div className="rs-signature-line"></div>
                <span>Registrar / Controller of Examinations</span>
              </div>
            </div>

            {/* Authenticity Notice */}
            <div className="rs-authenticity-notice">
              <Icons.Shield className="icon-xs text-success" />
              <span>This is an official computer-generated transcript from the college academic information system. Verify authenticity using the code: <strong>{docDetails?.verificationCode}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
