import { useState, useEffect, useCallback } from 'react';
import { academicInfoAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function AcademicInfoPage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  user
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAcademicInfo = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;

      const res = await academicInfoAPI.get(params);
      if (res.success && res.academicInfo) {
        setData(res.academicInfo);
      } else {
        setError('No academic records found');
      }
    } catch (err) {
      console.error('Academic info fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching academic information');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchAcademicInfo();
  }, [fetchAcademicInfo]);

  const student = data?.student;
  const program = data?.program;
  const standing = data?.academicStanding;
  const advisor = data?.advisor;
  const subjects = data?.enrolledSubjects || [];

  const completionPct = program ? Math.min(100, Math.round(((program.currentSemester - 1) / program.totalSemesters) * 100)) : 50;

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.GraduationCap className="icon-md text-primary" />
            <span>Academic Standing & Enrollment</span>
          </h1>
          <p className="page-subtitle">
            Curriculum track, enrolled subject credits, faculty mentors, and degree progression.
          </p>
        </div>

        {user?.role !== 'student' && studentsList.length > 0 && (
          <div className="flex-center gap-2">
            <label htmlFor="academic-student-select" className="text-xs text-muted">
              Select Student:
            </label>
            <select
              id="academic-student-select"
              className="form-select form-select-sm"
              value={selectedStudentId || student?._id || ''}
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

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Retrieving academic records...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <>
          {/* Degree Progression Banner */}
          <div className="academic-progression-banner card mb-6">
            <div className="card-body">
              <div className="justify-between">
                <div>
                  <span className="badge badge-primary">{program?.degree}</span>
                  <h2 className="academic-prog-title mt-1">
                    {program?.course} &bull; {program?.department}
                  </h2>
                  <div className="text-sm text-muted">
                    Batch: {program?.batch} &bull; Enrollment No: <strong>{program?.enrollmentNumber}</strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-muted">Degree Completion</span>
                  <div className="text-2xl font-bold text-primary">{completionPct}%</div>
                  <span className="text-xs text-muted">Semester {program?.currentSemester} of {program?.totalSemesters}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="progression-bar-bg mt-4">
                <div
                  className="progression-bar-fill"
                  style={{ width: `${completionPct}%` }}
                />
              </div>

              {/* Semester Milestones */}
              <div className="milestones-row mt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <span
                    key={s}
                    className={`milestone-item ${
                      s < (program?.currentSemester || 1)
                        ? 'completed'
                        : s === program?.currentSemester
                        ? 'current'
                        : 'future'
                    }`}
                  >
                    Sem {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* KPI Academic Standing Cards */}
          <div className="stats-grid mb-6">
            <div className="stat-card">
              <div className="stat-icon-wrapper bg-primary-light">
                <Icons.Award className="icon-md text-primary" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Cumulative GPA</span>
                <span className="stat-value">{standing?.cgpa} / 10.0</span>
                <span className="stat-sub text-success">{standing?.academicDivision}</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-info-light">
                <Icons.BookOpen className="icon-md text-info" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Earned Credits</span>
                <span className="stat-value">{standing?.creditsCompleted}</span>
                <span className="stat-sub">Out of {standing?.totalCreditsRequired} Required</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-success-light">
                <Icons.CheckCircle className="icon-md text-success" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Academic Standing</span>
                <span className="stat-value text-success">{standing?.status}</span>
                <span className="stat-sub font-medium">Good Academic Standing</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-wrapper bg-primary-light">
                <Icons.CalendarCheck className="icon-md text-primary" />
              </div>
              <div className="stat-data">
                <span className="stat-label">Examination Status</span>
                <span className="stat-value text-success font-medium text-sm">
                  Eligible
                </span>
                <span className="stat-sub">{standing?.attendanceEligibility}</span>
              </div>
            </div>
          </div>

          <div className="grid-2-col gap-6">
            {/* Currently Enrolled Subjects Table */}
            <div className="card">
              <div className="card-header justify-between">
                <div>
                  <h3 className="card-title">Enrolled Subjects (Semester {program?.currentSemester})</h3>
                  <span className="text-xs text-muted">
                    Core subjects, professional electives, and practical labs
                  </span>
                </div>
                <span className="badge badge-info">
                  {subjects.length} Courses
                </span>
              </div>

              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Subject Title</th>
                        <th>Credits</th>
                        <th>Category</th>
                        <th>Faculty In-Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subjects.map((sub) => (
                        <tr key={sub.code}>
                          <td>
                            <span className="subject-code-pill">{sub.code}</span>
                          </td>
                          <td className="font-medium text-main">{sub.name}</td>
                          <td>
                            <span className="badge badge-info">{sub.credits} Credits</span>
                          </td>
                          <td>
                            <span className="text-xs text-muted">{sub.type}</span>
                          </td>
                          <td className="text-sm">{sub.faculty}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Academic Advisor & Department Card */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Academic Advisor & Mentorship</h3>
                <span className="text-xs text-muted">
                  Designated faculty mentor for course registration and academic counsel
                </span>
              </div>

              <div className="card-body">
                <div className="advisor-profile-box">
                  <div className="advisor-avatar">
                    <Icons.UserRound className="icon-md text-primary" />
                  </div>
                  <div>
                    <h4 className="advisor-name">{advisor?.name}</h4>
                    <span className="advisor-designation text-sm text-muted">
                      {advisor?.designation}
                    </span>
                    <div className="text-xs text-muted mt-1">
                      {advisor?.department}
                    </div>
                  </div>
                </div>

                <div className="advisor-contact-details mt-4">
                  <div className="advisor-detail-item">
                    <Icons.Mail className="icon-xs text-primary" />
                    <span>{advisor?.email}</span>
                  </div>
                  <div className="advisor-detail-item">
                    <Icons.Clock className="icon-xs text-primary" />
                    <span>{advisor?.officeHours}</span>
                  </div>
                  <div className="advisor-detail-item">
                    <Icons.Building className="icon-xs text-primary" />
                    <span>Faculty Chambers, Room 314, Academic Complex</span>
                  </div>
                </div>

                <div className="academic-guidelines-box mt-4">
                  <h5 className="font-medium text-sm text-main mb-2">Registration Notes</h5>
                  <ul className="text-xs text-muted space-y-1">
                    <li>&bull; Minimum 20 credits must be registered per semester.</li>
                    <li>&bull; Dropping or adding courses requires mentor signature.</li>
                    <li>&bull; End-term project submissions must be verified by mentor.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
