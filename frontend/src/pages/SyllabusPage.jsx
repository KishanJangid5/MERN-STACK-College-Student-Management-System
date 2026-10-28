import { useState, useEffect, useCallback } from 'react';
import { syllabusAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function SyllabusPage({ isAuthenticated, user }) {
  const [syllabi, setSyllabi] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCourse, setSelectedCourse] = useState('All');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSubject, setExpandedSubject] = useState(null);

  // Add Syllabus Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formCourse, setFormCourse] = useState('Computer Science');
  const [formSemester, setFormSemester] = useState(4);
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');
  const [formCredits, setFormCredits] = useState(4);
  const [formHours, setFormHours] = useState(45);
  const [formDesc, setFormDesc] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchSyllabus = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCourse !== 'All') params.course = selectedCourse;
      if (selectedSemester !== 'All') params.semester = selectedSemester;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await syllabusAPI.getAll(params);
      if (res.success) {
        setSyllabi(res.syllabi || []);
        if (res.syllabi && res.syllabi.length > 0 && !expandedSubject) {
          setExpandedSubject(res.syllabi[0]._id);
        }
      } else {
        setError(res.message || 'Failed to load syllabi');
      }
    } catch (err) {
      console.error('Error fetching syllabus:', err);
      setError(err.response?.data?.message || 'Error fetching syllabus records');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedSemester, searchQuery]);

  useEffect(() => {
    fetchSyllabus();
  }, [fetchSyllabus]);

  const handleCreateSyllabus = async (e) => {
    e.preventDefault();
    if (!formCode || !formName) return;

    setSubmitting(true);
    try {
      const res = await syllabusAPI.create({
        course: formCourse,
        semester: Number(formSemester),
        subjectCode: formCode.trim().toUpperCase(),
        subjectName: formName.trim(),
        credits: Number(formCredits),
        totalHours: Number(formHours),
        description: formDesc.trim(),
        units: [
          {
            unitNumber: 1,
            title: 'Fundamentals & Architectural Principles',
            hours: 9,
            topics: ['Core Definitions', 'Theoretical Foundations', 'Standard Methodologies']
          },
          {
            unitNumber: 2,
            title: 'Advanced Methodologies & Applications',
            hours: 10,
            topics: ['Design Patterns', 'System Implementation', 'Case Studies']
          }
        ]
      });

      if (res.success) {
        setIsModalOpen(false);
        setFormCode('');
        setFormName('');
        setFormDesc('');
        fetchSyllabus();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create syllabus record');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.BookOpen className="icon-md text-primary" />
            <span>Curriculum & Syllabus Directory</span>
          </h1>
          <p className="page-subtitle">
            Browse approved academic schemes, course structures, unit-wise topics, and reference textbooks.
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
              <span>Add Syllabus Record</span>
            </button>
          )}
          <button
            type="button"
            className="btn btn-outline btn-sm flex-center gap-1"
            onClick={handlePrint}
            title="Print or export syllabus"
          >
            <Icons.Printer className="icon-xs" />
            <span>Print View</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="filter-controls-grid">
            <div className="form-group mb-0">
              <label htmlFor="filter-course">Degree Program</label>
              <select
                id="filter-course"
                className="form-select"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
              >
                <option value="All">All Courses</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Data Science">Data Science</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
              </select>
            </div>

            <div className="form-group mb-0">
              <label htmlFor="filter-sem">Semester Level</label>
              <select
                id="filter-sem"
                className="form-select"
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
              >
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-0 flex-grow-1">
              <label htmlFor="filter-search">Keyword Search</label>
              <div className="input-with-icon">
                <Icons.Search className="input-icon" />
                <input
                  id="filter-search"
                  type="text"
                  className="form-input with-icon"
                  placeholder="Search subject code, title, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading course syllabi...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : syllabi.length === 0 ? (
        <div className="empty-state p-6 card">
          <Icons.BookOpen className="icon-xl text-muted" />
          <h4>No Syllabus Records Found</h4>
          <p>Try modifying your program or semester filters above.</p>
        </div>
      ) : (
        <div className="syllabus-list">
          {syllabi.map((item) => {
            const isExpanded = expandedSubject === item._id;
            return (
              <div
                key={item._id}
                className={`syllabus-accordion-card ${isExpanded ? 'expanded' : ''}`}
              >
                <div
                  className="syllabus-card-header"
                  onClick={() =>
                    setExpandedSubject(isExpanded ? null : item._id)
                  }
                >
                  <div className="syllabus-header-left">
                    <span className="badge badge-primary">{item.subjectCode}</span>
                    <div>
                      <h3 className="syllabus-subject-name">{item.subjectName}</h3>
                      <div className="syllabus-meta-row">
                        <span>{item.course}</span> &bull;{' '}
                        <span>Semester {item.semester}</span> &bull;{' '}
                        <span>{item.credits} Credits</span> &bull;{' '}
                        <span>{item.totalHours} Lecture Hours</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-center gap-2">
                    <button
                      type="button"
                      className="btn-icon text-muted"
                      aria-label="Expand subject details"
                    >
                      <Icons.ChevronDown
                        className={`icon-sm transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="syllabus-card-content">
                    {item.description && (
                      <p className="syllabus-description">{item.description}</p>
                    )}

                    {/* Unit Breakdown */}
                    {item.units && item.units.length > 0 && (
                      <div className="syllabus-units-container">
                        <h4 className="syllabus-section-heading">
                          Curriculum Modules & Units
                        </h4>
                        <div className="units-grid">
                          {item.units.map((unit) => (
                            <div key={unit.unitNumber} className="unit-card">
                              <div className="unit-header justify-between">
                                <span className="unit-badge">
                                  Unit {unit.unitNumber}
                                </span>
                                <span className="text-xs text-muted">
                                  {unit.hours || 8} Hours
                                </span>
                              </div>
                              <h5 className="unit-title">{unit.title}</h5>
                              {unit.topics && unit.topics.length > 0 && (
                                <ul className="unit-topics-list">
                                  {unit.topics.map((t, idx) => (
                                    <li key={idx}>
                                      <span className="bullet-dot" />
                                      <span>{t}</span>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reference Textbooks */}
                    {item.referenceBooks && item.referenceBooks.length > 0 && (
                      <div className="syllabus-references-container">
                        <h4 className="syllabus-section-heading">
                          Recommended Textbooks & References
                        </h4>
                        <ul className="reference-books-list">
                          {item.referenceBooks.map((ref, idx) => (
                            <li key={idx} className="reference-book-item">
                              <Icons.BookOpen className="icon-xs text-primary" />
                              <span>{ref}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Syllabus Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-header">
              <h3 className="modal-title flex-center gap-1">
                <Icons.BookOpen className="icon-sm text-primary" />
                <span>Add Syllabus Subject</span>
              </h3>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setIsModalOpen(false)}
              >
                <Icons.Close className="icon-sm" />
              </button>
            </div>

            <form onSubmit={handleCreateSyllabus}>
              <div className="modal-body">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-course">Degree Program</label>
                    <select
                      id="new-course"
                      className="form-select"
                      value={formCourse}
                      onChange={(e) => setFormCourse(e.target.value)}
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Data Science">Data Science</option>
                      <option value="Artificial Intelligence">Artificial Intelligence</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-semester">Semester</label>
                    <select
                      id="new-semester"
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

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-code">Subject Code</label>
                    <input
                      id="new-code"
                      type="text"
                      className="form-input"
                      placeholder="e.g. CS-404"
                      value={formCode}
                      onChange={(e) => setFormCode(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="new-name">Subject Name</label>
                    <input
                      id="new-name"
                      type="text"
                      className="form-input"
                      placeholder="e.g. Cloud Computing & Microservices"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="new-credits">Credits</label>
                    <input
                      id="new-credits"
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={formCredits}
                      onChange={(e) => setFormCredits(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="new-hours">Total Hours</label>
                    <input
                      id="new-hours"
                      type="number"
                      className="form-input"
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="new-desc">Course Overview</label>
                  <textarea
                    id="new-desc"
                    className="form-textarea"
                    rows="3"
                    placeholder="Brief description of the course and objectives..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
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
                  {submitting ? 'Saving...' : 'Add Syllabus'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
