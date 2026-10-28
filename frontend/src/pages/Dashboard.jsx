import { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import StatsCards from '../components/StatsCards';
import CourseDistributionChart from '../components/CourseDistributionChart';
import { Icons } from '../components/Icons';

export default function Dashboard({ onNavigateToStudents, onViewStudent, onOpenAddStudent, isAuthenticated }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await studentAPI.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to connect to backend server. Make sure MongoDB and backend are running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">
            Real-time analytics & enrollment metrics from MongoDB (collegeDB)
          </p>
        </div>
        <div className="page-actions">
          <button
            className={`btn btn-outline btn-sm flex-center gap-1 ${refreshing ? 'rotating' : ''}`}
            onClick={() => fetchStats(true)}
            disabled={refreshing || loading}
            title="Refresh statistics from database"
          >
            <Icons.Refresh className="icon-sm" />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Data'}</span>
          </button>
          {isAuthenticated && (
            <button
              className="btn btn-primary btn-sm flex-center gap-1"
              onClick={onOpenAddStudent}
            >
              <Icons.Plus className="icon-sm" />
              <span>Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="alert-banner alert-danger">
          <Icons.AlertTriangle className="icon-md" />
          <div className="alert-text">
            <strong>Database Connection Alert:</strong> {error}
          </div>
          <button className="btn btn-sm btn-outline" onClick={() => fetchStats(true)}>
            Try Again
          </button>
        </div>
      )}

      {/* Statistics Metric Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Analytical Breakdown Grid */}
      <div className="dashboard-grid mt-6">
        {/* Course Enrollment Breakdown */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Enrollment by Course</h3>
              <p className="card-subtitle">Distribution of students across degree programs</p>
            </div>
            <span className="badge badge-primary">
              {stats?.totalCourses || 0} Programs
            </span>
          </div>
          <div className="card-body">
            <CourseDistributionChart
              distribution={stats?.courseDistribution || []}
              totalStudents={stats?.totalStudents || 0}
            />
          </div>
        </div>

        {/* Department Distribution Breakdown */}
        <div className="dashboard-card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Department Allocation</h3>
              <p className="card-subtitle">Student density per academic department</p>
            </div>
          </div>
          <div className="card-body">
            {stats?.departmentDistribution && stats.departmentDistribution.length > 0 ? (
              <div className="department-list">
                {stats.departmentDistribution.map((dep, idx) => (
                  <div key={idx} className="department-item">
                    <div className="department-info">
                      <span className="department-name">{dep.department || 'General'}</span>
                      <span className="badge badge-neutral">{dep.count} students</span>
                    </div>
                    <div className="department-progress-track">
                      <div
                        className="department-progress-fill"
                        style={{
                          width: `${stats.totalStudents > 0 ? (dep.count / stats.totalStudents) * 100 : 0}%`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card-empty-state">
                <p className="text-muted">No department data recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recently Enrolled Students */}
      <div className="dashboard-card mt-6">
        <div className="card-header">
          <div>
            <h3 className="card-title">Recently Enrolled Students</h3>
            <p className="card-subtitle">Latest additions to the student management system</p>
          </div>
          <button
            className="btn btn-outline btn-sm"
            onClick={onNavigateToStudents}
          >
            View All Students &rarr;
          </button>
        </div>
        <div className="card-body p-0">
          {stats?.recentStudents && stats.recentStudents.length > 0 ? (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Roll No</th>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>CGPA</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentStudents.map((st) => (
                    <tr key={st._id}>
                      <td>
                        <span className="badge badge-roll">{st.rollNumber}</span>
                      </td>
                      <td>
                        <div className="student-cell-name font-medium">{st.name}</div>
                        <div className="student-cell-email">{st.email}</div>
                      </td>
                      <td>
                        <span className="badge badge-course">{st.course}</span>
                      </td>
                      <td>
                        <span className="badge gpa-mid">
                          {Number(st.gpa || 0).toFixed(2)}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`status-pill status-${(st.status || 'Active').toLowerCase().replace(' ', '-')}`}
                        >
                          {st.status || 'Active'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          className="btn-action btn-view"
                          onClick={() => onViewStudent(st)}
                          title="View Details"
                        >
                          <Icons.Eye className="icon-xs" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="card-empty-state p-6">
              <p className="text-muted">No recently enrolled students found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
