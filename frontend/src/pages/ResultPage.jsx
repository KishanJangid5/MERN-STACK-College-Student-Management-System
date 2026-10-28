import { useState, useEffect, useCallback } from 'react';
import { resultAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function ResultPage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  isAuthenticated,
  user
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');

  // Modal State for Entering Results (Admin)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examName, setExamName] = useState('Semester 4 Final End-Term Examination');
  const [formSemester, setFormSemester] = useState(4);
  const [subjectsList, setSubjectsList] = useState([
    {
      subjectCode: 'CS-401',
      subjectName: 'Design & Analysis of Algorithms',
      credits: 4,
      internalMarks: 26,
      externalMarks: 62,
      marksObtained: 88,
      maxMarks: 100
    },
    {
      subjectCode: 'CS-402',
      subjectName: 'Database Management Systems',
      credits: 4,
      internalMarks: 27,
      externalMarks: 58,
      marksObtained: 85,
      maxMarks: 100
    }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;
      if (selectedSemester !== 'All') params.semester = selectedSemester;

      const res = await resultAPI.get(params);
      if (res.success) {
        setData(res);
      } else {
        setError(res.message || 'Failed to fetch examination results');
      }
    } catch (err) {
      console.error('Result fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching examination results');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId, selectedSemester]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const handleCreateResult = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await resultAPI.create({
        studentId: selectedStudentId || data?.student?._id,
        examName,
        semester: Number(formSemester),
        subjects: subjectsList,
        publicationStatus: 'Published'
      });

      if (res.success) {
        setIsModalOpen(false);
        fetchResults();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record examination result');
    } finally {
      setSubmitting(false);
    }
  };

  const student = data?.student;
  const results = data?.results || [];
  const cumulativeCgpa = data?.cumulativeCgpa || student?.gpa || 8.0;

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.Award className="icon-md text-primary" />
            <span>Examination Results Portal</span>
          </h1>
          <p className="page-subtitle">
            Official published examination scores, subject grade points, semester SGPA, and cumulative CGPA.
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
              <span>Enter / Publish Marks</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm flex-center gap-1"
            onClick={fetchResults}
            title="Refresh results"
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
                <span>Current Semester: {student.semester}</span>
              </div>
            </div>
          </div>

          <div className="flex-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted">Cumulative CGPA</span>
              <div className="text-xl font-bold text-primary">{cumulativeCgpa} / 10.0</div>
            </div>

            {user?.role !== 'student' && studentsList.length > 0 && (
              <div className="banner-student-switch">
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
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Retrieving published examination results...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state p-6 card">
          <Icons.Award className="icon-xl text-muted" />
          <h4>No Published Examination Results Found</h4>
          <p>Results for the selected student or semester have not yet been published by the Controller of Examinations.</p>
        </div>
      ) : (
        <div className="results-container">
          {results.map((resItem) => (
            <div key={resItem._id} className="card mb-6">
              <div className="card-header justify-between">
                <div>
                  <div className="flex-center gap-2">
                    <span className="badge badge-primary">Semester {resItem.semester}</span>
                    <h3 className="card-title">{resItem.examName}</h3>
                  </div>
                  <span className="text-xs text-muted">
                    Academic Year {resItem.academicYear} &bull; Published on{' '}
                    {new Date(resItem.publishedAt || resItem.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex-center gap-3">
                  <div className="result-metric-pill">
                    <span className="text-xs text-muted">SGPA</span>
                    <strong className="text-primary text-lg">{resItem.sgpa}</strong>
                  </div>
                  <div className="result-metric-pill">
                    <span className="text-xs text-muted">Percentage</span>
                    <strong className="text-main text-lg">{resItem.percentage}%</strong>
                  </div>
                  <span
                    className={`badge ${
                      resItem.resultStatus === 'Pass' ? 'badge-success' : 'badge-danger'
                    }`}
                  >
                    {resItem.resultStatus}
                  </span>
                </div>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Subject Code</th>
                        <th>Subject Name</th>
                        <th>Credits</th>
                        <th>Internal (30)</th>
                        <th>External (70)</th>
                        <th>Total (100)</th>
                        <th>Grade</th>
                        <th>Grade Point</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resItem.subjects.map((sub) => (
                        <tr key={sub._id || sub.subjectCode}>
                          <td>
                            <span className="subject-code-pill">{sub.subjectCode}</span>
                          </td>
                          <td className="font-medium text-main">{sub.subjectName}</td>
                          <td>{sub.credits || 4}</td>
                          <td>{sub.internalMarks}</td>
                          <td>{sub.externalMarks}</td>
                          <td className="font-medium text-main">{sub.marksObtained}</td>
                          <td>
                            <span
                              className={`grade-badge ${
                                sub.grade === 'O' || sub.grade === 'A+' || sub.grade === 'A'
                                  ? 'grade-excellent'
                                  : sub.grade === 'B+' || sub.grade === 'B'
                                  ? 'grade-good'
                                  : 'grade-fail'
                              }`}
                            >
                              {sub.grade}
                            </span>
                          </td>
                          <td className="font-bold text-primary">{sub.gradePoint}</td>
                          <td>
                            <span
                              className={`badge ${
                                sub.status === 'Pass' ? 'badge-success' : 'badge-danger'
                              }`}
                            >
                              {sub.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-footer-row">
                        <td colSpan="5" className="text-right font-medium">
                          Semester Aggregates:
                        </td>
                        <td className="font-bold text-main">
                          {resItem.totalMarksObtained} / {resItem.totalMaxMarks}
                        </td>
                        <td colSpan="2" className="text-right text-xs text-muted">
                          Semester GPA (SGPA):
                        </td>
                        <td className="font-bold text-primary text-base">
                          {resItem.sgpa}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          ))}

          {/* Institutional Grading Scale Card */}
          <div className="card mt-6">
            <div className="card-header">
              <h4 className="card-title text-sm">University Relative Grading Reference Scale</h4>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="data-table text-xs">
                  <thead>
                    <tr>
                      <th>Score Range (%)</th>
                      <th>Letter Grade</th>
                      <th>Grade Points</th>
                      <th>Performance Descriptor</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>90% - 100%</td>
                      <td><span className="grade-badge grade-excellent">O</span></td>
                      <td>10</td>
                      <td>Outstanding</td>
                    </tr>
                    <tr>
                      <td>80% - 89%</td>
                      <td><span className="grade-badge grade-excellent">A+</span></td>
                      <td>9</td>
                      <td>Excellent</td>
                    </tr>
                    <tr>
                      <td>70% - 79%</td>
                      <td><span className="grade-badge grade-excellent">A</span></td>
                      <td>8</td>
                      <td>Very Good</td>
                    </tr>
                    <tr>
                      <td>60% - 69%</td>
                      <td><span className="grade-badge grade-good">B+</span></td>
                      <td>7</td>
                      <td>Good</td>
                    </tr>
                    <tr>
                      <td>50% - 59%</td>
                      <td><span className="grade-badge grade-good">B</span></td>
                      <td>6</td>
                      <td>Above Average</td>
                    </tr>
                    <tr>
                      <td>40% - 49%</td>
                      <td><span className="grade-badge">P</span></td>
                      <td>5</td>
                      <td>Pass</td>
                    </tr>
                    <tr>
                      <td>Below 40%</td>
                      <td><span className="grade-badge grade-fail">F</span></td>
                      <td>0</td>
                      <td>Fail / Re-appear</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enter Marks Modal (Admin) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card modal-lg">
            <div className="modal-header">
              <h3 className="modal-title flex-center gap-1">
                <Icons.Award className="icon-sm text-primary" />
                <span>Enter & Publish Examination Result</span>
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <Icons.Close className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateResult}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="res-exam-name">Examination Name</label>
                    <input
                      id="res-exam-name"
                      type="text"
                      className="form-input"
                      value={examName}
                      onChange={(e) => setExamName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="res-sem">Semester</label>
                    <select
                      id="res-sem"
                      className="form-select"
                      value={formSemester}
                      onChange={(e) => setFormSemester(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-4 mb-2">
                  <h5 className="font-medium text-sm text-main">Subject Marks Entry</h5>
                  <span className="text-xs text-muted">
                    Enter internal marks and external marks. Grades and SGPA are auto-computed.
                  </span>
                </div>

                {subjectsList.map((subj, idx) => (
                  <div key={idx} className="marks-input-row form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Subject</label>
                      <input
                        type="text"
                        className="form-input"
                        value={`${subj.subjectCode}: ${subj.subjectName}`}
                        readOnly
                      />
                    </div>
                    <div className="form-group">
                      <label>Internal (30)</label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        className="form-input"
                        value={subj.internalMarks}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...subjectsList];
                          updated[idx].internalMarks = val;
                          updated[idx].marksObtained = val + updated[idx].externalMarks;
                          setSubjectsList(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>External (70)</label>
                      <input
                        type="number"
                        min="0"
                        max="70"
                        className="form-input"
                        value={subj.externalMarks}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          const updated = [...subjectsList];
                          updated[idx].externalMarks = val;
                          updated[idx].marksObtained = updated[idx].internalMarks + val;
                          setSubjectsList(updated);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Marks</label>
                      <input
                        type="number"
                        className="form-input read-only"
                        value={subj.marksObtained}
                        readOnly
                      />
                    </div>
                  </div>
                ))}
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
                  {submitting ? 'Publishing...' : 'Publish Result to Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
