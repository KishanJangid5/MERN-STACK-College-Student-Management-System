import { useState, useEffect, useCallback } from 'react';
import { examAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function ExaminationPage({ isAuthenticated, user }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [courseFilter, setCourseFilter] = useState('All');
  const [semesterFilter, setSemesterFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examName, setExamName] = useState('End-Semester Final Examinations Spring 2026');
  const [course, setCourse] = useState('Computer Science');
  const [semester, setSemester] = useState(4);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [examDate, setExamDate] = useState('');
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('01:00 PM');
  const [duration, setDuration] = useState('3 Hours');
  const [venue, setVenue] = useState('Hall 302, Academic Block A');
  const [examType, setExamType] = useState('Theory');
  const [submitting, setSubmitting] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (courseFilter !== 'All') params.course = courseFilter;
      if (semesterFilter !== 'All') params.semester = semesterFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await examAPI.getAll(params);
      if (res.success) {
        setExams(res.examinations || []);
      } else {
        setError(res.message || 'Failed to load examinations');
      }
    } catch (err) {
      console.error('Exam fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching examination schedules');
    } finally {
      setLoading(false);
    }
  }, [courseFilter, semesterFilter, statusFilter]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !examDate) return;

    setSubmitting(true);
    try {
      const res = await examAPI.create({
        examName,
        course,
        semester: Number(semester),
        subjectCode: subjectCode.trim().toUpperCase(),
        subjectName: subjectName.trim(),
        examDate,
        startTime,
        endTime,
        duration,
        venue: venue.trim(),
        examType
      });

      if (res.success) {
        setIsModalOpen(false);
        setSubjectCode('');
        setSubjectName('');
        fetchExams();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule exam');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.ClipboardList className="icon-md text-primary" />
            <span>Examination Timetable & Schedules</span>
          </h1>
          <p className="page-subtitle">
            Official schedules for semester assessments, theory exams, laboratory practicals, and assigned venues.
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
              <span>Schedule Examination</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm flex-center gap-1"
            onClick={fetchExams}
            title="Refresh exam schedules"
          >
            <Icons.Refresh className="icon-xs" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="filter-controls-grid">
            <div className="form-group mb-0">
              <label htmlFor="exam-filter-course">Degree Program</label>
              <select
                id="exam-filter-course"
                className="form-select"
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <option value="All">All Courses</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="exam-filter-sem">Semester Level</label>
              <select
                id="exam-filter-sem"
                className="form-select"
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="exam-filter-status">Session Status</label>
              <select
                id="exam-filter-status"
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Retrieving examination timetable...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : exams.length === 0 ? (
        <div className="empty-state p-6 card">
          <Icons.ClipboardList className="icon-xl text-muted" />
          <h4>No Examination Schedules</h4>
          <p>No examinations have been scheduled for the selected criteria.</p>
        </div>
      ) : (
        <div className="card">
          <div className="card-header justify-between">
            <div>
              <h3 className="card-title">Published Examination Sessions</h3>
              <span className="text-xs text-muted">
                Showing {exams.length} scheduled exam papers
              </span>
            </div>
          </div>

          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Time & Duration</th>
                    <th>Subject</th>
                    <th>Course & Sem</th>
                    <th>Exam Type</th>
                    <th>Examination Venue</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {exams.map((exam) => (
                    <tr key={exam._id}>
                      <td className="font-medium text-main">
                        <div className="flex-center gap-1">
                          <Icons.Calendar className="icon-xs text-primary" />
                          <span>
                            {new Date(exam.examDate).toLocaleDateString('en-US', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm">
                          <strong>{exam.startTime}</strong> - {exam.endTime}
                        </div>
                        <span className="text-xs text-muted">({exam.duration})</span>
                      </td>
                      <td>
                        <span className="subject-code-pill">{exam.subjectCode}</span>
                        <div className="font-medium text-main mt-1">
                          {exam.subjectName}
                        </div>
                      </td>
                      <td className="text-sm">
                        <div>{exam.course}</div>
                        <span className="text-xs text-muted">Semester {exam.semester}</span>
                      </td>
                      <td>
                        <span className="badge badge-info">{exam.examType || 'Theory'}</span>
                      </td>
                      <td>
                        <div className="flex-center gap-1 text-sm font-medium">
                          <Icons.Building className="icon-xs text-muted" />
                          <span>{exam.venue}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            exam.status === 'Completed'
                              ? 'badge-success'
                              : exam.status === 'Ongoing'
                              ? 'badge-warning'
                              : 'badge-primary'
                          }`}
                        >
                          {exam.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Guidelines Box */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title flex-center gap-1">
            <Icons.Shield className="icon-sm text-primary" />
            <span>Candidate Examination Instructions & Code of Conduct</span>
          </h3>
        </div>
        <div className="card-body">
          <ul className="exam-guidelines-list text-sm text-muted">
            <li>
              <strong>1. Hall Ticket Requirement:</strong> Every candidate must bring a clean, printed copy of their official Hall Ticket along with their physical College Student Identity Card.
            </li>
            <li>
              <strong>2. Reporting Time:</strong> Candidates are strictly instructed to report at their assigned venue 30 minutes before the commencement of the exam.
            </li>
            <li>
              <strong>3. Electronic Devices:</strong> Mobile phones, smart wristwatches, wireless earphones, programmable calculators, and electronic storage devices are strictly prohibited inside the exam hall.
            </li>
            <li>
              <strong>4. Late Entry Policy:</strong> No candidate will be admitted into the examination venue after 30 minutes have elapsed from the commencement time.
            </li>
            <li>
              <strong>5. Malpractice Notice:</strong> Any possession of unauthorized notes or communication with peers will be treated as academic malpractice, leading to immediate cancellation of candidature.
            </li>
          </ul>
        </div>
      </div>

      {/* Schedule Exam Modal (Admin) */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title flex-center gap-1">
                <Icons.ClipboardList className="icon-sm text-primary" />
                <span>Schedule New Examination</span>
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <Icons.Close className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateExam}>
              <div className="modal-body">
                <div className="form-group">
                  <label htmlFor="new-exam-title">Examination Title</label>
                  <input
                    id="new-exam-title"
                    type="text"
                    className="form-input"
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-exam-course">Course</label>
                    <select
                      id="new-exam-course"
                      className="form-select"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-exam-sem">Semester</label>
                    <select
                      id="new-exam-sem"
                      className="form-select"
                      value={semester}
                      onChange={(e) => setSemester(e.target.value)}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          Semester {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-exam-code">Subject Code</label>
                    <input
                      id="new-exam-code"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS-401"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-exam-subname">Subject Name</label>
                    <input
                      id="new-exam-subname"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Algorithms"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-exam-date">Date</label>
                    <input
                      id="new-exam-date"
                      type="date"
                      className="form-input"
                      value={examDate}
                      onChange={(e) => setExamDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-exam-venue">Venue / Room</label>
                    <input
                      id="new-exam-venue"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Hall 302, Academic Block A"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-exam-start">Start Time</label>
                    <input
                      id="new-exam-start"
                      type="text"
                      className="form-input"
                      placeholder="10:00 AM"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-exam-end">End Time</label>
                    <input
                      id="new-exam-end"
                      type="text"
                      className="form-input"
                      placeholder="01:00 PM"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
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
                  {submitting ? 'Scheduling...' : 'Confirm Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
