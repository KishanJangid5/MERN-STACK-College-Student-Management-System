import { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import StudentTable from '../components/StudentTable';
import { Icons } from '../components/Icons';

export default function StudentsPage({
  onViewStudent,
  onEditStudent,
  onDeleteStudent,
  onOpenAddStudent,
  isAuthenticated,
  refreshTrigger
}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [coursesList, setCoursesList] = useState([]);
  const [error, setError] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sortBy,
        order: sortOrder
      };
      if (search.trim()) params.search = search.trim();
      if (courseFilter !== 'All') params.course = courseFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const res = await studentAPI.getAll(params);
      if (res.success) {
        setStudents(res.students || []);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError(err.response?.data?.message || 'Failed to retrieve students from server');
    } finally {
      setLoading(false);
    }
  };

  // Fetch available courses once for filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const statsRes = await studentAPI.getStats();
        if (statsRes.success && statsRes.data?.coursesList) {
          setCoursesList(statsRes.data.coursesList);
        }
      } catch (e) {
        // Fallback default course list if stats fails
        setCoursesList([
          'Computer Science',
          'Information Technology',
          'Data Science',
          'Artificial Intelligence',
          'Electronics & Communication',
          'Mechanical Engineering',
          'Civil Engineering',
          'Business Administration'
        ]);
      }
    };
    fetchCourses();
  }, []);

  // Fetch students whenever search, filters, sorting or refreshTrigger changes
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [search, courseFilter, statusFilter, sortBy, sortOrder, refreshTrigger]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearch('');
    setCourseFilter('All');
    setStatusFilter('All');
    setSortBy('createdAt');
    setSortOrder('desc');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
          <p className="page-subtitle">
            Manage, search, filter, and review all student records in collegeDB
          </p>
        </div>
        <div className="page-actions">
          <button
            className="btn btn-outline btn-sm flex-center gap-1"
            onClick={fetchStudents}
            title="Refresh student list"
          >
            <Icons.Refresh className="icon-sm" />
            <span>Refresh</span>
          </button>
          {isAuthenticated && (
            <button
              className="btn btn-primary btn-sm flex-center gap-1"
              onClick={onOpenAddStudent}
            >
              <Icons.Plus className="icon-sm" />
              <span>Add New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-banner alert-danger">
          <Icons.AlertTriangle className="icon-md" />
          <div className="alert-text">{error}</div>
          <button className="btn btn-sm btn-outline" onClick={fetchStudents}>
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="filter-card">
        <div className="filter-row">
          {/* Search Input */}
          <div className="search-input-wrapper">
            <Icons.Search className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, email, or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="search-clear-btn"
                onClick={() => setSearch('')}
                title="Clear search"
              >
                <Icons.Close className="icon-xs" />
              </button>
            )}
          </div>

          {/* Course Dropdown */}
          <div className="filter-select-group">
            <label htmlFor="filter-course">Course:</label>
            <select
              id="filter-course"
              className="form-select filter-select"
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
            >
              <option value="All">All Courses</option>
              {coursesList.map((course) => (
                <option key={course} value={course}>
                  {course}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="filter-select-group">
            <label htmlFor="filter-status">Status:</label>
            <select
              id="filter-status"
              className="form-select filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Graduated">Graduated</option>
              <option value="On Leave">On Leave</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="filter-select-group">
            <label htmlFor="filter-sort">Sort By:</label>
            <select
              id="filter-sort"
              className="form-select filter-select"
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [f, o] = e.target.value.split('-');
                setSortBy(f);
                setSortOrder(o);
              }}
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="name-asc">Name (A - Z)</option>
              <option value="name-desc">Name (Z - A)</option>
              <option value="gpa-desc">GPA (Highest First)</option>
              <option value="gpa-asc">GPA (Lowest First)</option>
              <option value="age-asc">Age (Youngest)</option>
              <option value="age-desc">Age (Oldest)</option>
            </select>
          </div>

          {(search || courseFilter !== 'All' || statusFilter !== 'All') && (
            <button
              className="btn btn-outline btn-sm"
              onClick={clearFilters}
              title="Reset all search filters"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Results summary counter */}
        <div className="filter-meta-bar">
          <span className="results-count">
            Showing <strong>{students.length}</strong> student record{students.length !== 1 ? 's' : ''}
          </span>
          {!isAuthenticated && (
            <span className="auth-notice text-xs text-muted">
              Note: Log in with an admin account to add, edit, or delete students.
            </span>
          )}
        </div>
      </div>

      {/* Main Student Table */}
      <div className="table-card">
        <StudentTable
          students={students}
          loading={loading}
          onView={onViewStudent}
          onEdit={onEditStudent}
          onDelete={onDeleteStudent}
          onSort={handleSort}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
}
