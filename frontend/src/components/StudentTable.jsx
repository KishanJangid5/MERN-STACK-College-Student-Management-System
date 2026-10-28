import { Icons } from './Icons';

export default function StudentTable({
  students = [],
  loading,
  onView,
  onEdit,
  onDelete,
  onSort,
  sortBy,
  sortOrder,
  isAuthenticated
}) {
  if (loading) {
    return (
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Course</th>
              <th>Age</th>
              <th>Semester</th>
              <th>GPA</th>
              <th>Status</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="skeleton-row">
                <td colSpan="8">
                  <div className="skeleton-line"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="empty-state-box">
        <div className="empty-icon-wrap">
          <Icons.Users className="icon-xl text-muted" />
        </div>
        <h3>No Student Records Found</h3>
        <p className="text-muted">
          No students match your search criteria or the database is currently empty.
        </p>
      </div>
    );
  }

  const renderSortIndicator = (field) => {
    if (sortBy !== field) return null;
    return <span className="sort-arrow">{sortOrder === 'asc' ? ' ↑' : ' ↓'}</span>;
  };

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th onClick={() => onSort('rollNumber')} className="sortable-th">
              Roll No {renderSortIndicator('rollNumber')}
            </th>
            <th onClick={() => onSort('name')} className="sortable-th">
              Student Info {renderSortIndicator('name')}
            </th>
            <th onClick={() => onSort('course')} className="sortable-th">
              Course {renderSortIndicator('course')}
            </th>
            <th onClick={() => onSort('age')} className="sortable-th">
              Age {renderSortIndicator('age')}
            </th>
            <th>Sem</th>
            <th onClick={() => onSort('gpa')} className="sortable-th">
              GPA {renderSortIndicator('gpa')}
            </th>
            <th>Status</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => {
            const gpa = Number(student.gpa || 0);
            const gpaClass =
              gpa >= 8.5 ? 'gpa-high' : gpa >= 7.0 ? 'gpa-mid' : 'gpa-low';

            return (
              <tr key={student._id}>
                <td>
                  <span className="badge badge-roll">{student.rollNumber}</span>
                </td>
                <td>
                  <div className="student-profile-cell">
                    <div className="avatar-sm">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="student-cell-name">{student.name}</div>
                      <div className="student-cell-email">{student.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-course">{student.course}</span>
                  {student.department && (
                    <div className="text-xs text-muted mt-1">{student.department}</div>
                  )}
                </td>
                <td>{student.age} yrs</td>
                <td>Sem {student.semester || 1}</td>
                <td>
                  <span className={`badge ${gpaClass}`}>
                    {gpa.toFixed(2)}
                  </span>
                </td>
                <td>
                  <span
                    className={`status-pill status-${(student.status || 'Active').toLowerCase().replace(' ', '-')}`}
                  >
                    {student.status || 'Active'}
                  </span>
                </td>
                <td className="text-right">
                  <div className="action-buttons-group">
                    <button
                      className="btn-action btn-view"
                      onClick={() => onView(student)}
                      title="View Student Profile"
                      aria-label="View Details"
                    >
                      <Icons.Eye className="icon-xs" />
                    </button>
                    {isAuthenticated && (
                      <>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => onEdit(student)}
                          title="Edit Student Record"
                          aria-label="Edit Student"
                        >
                          <Icons.Edit className="icon-xs" />
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => onDelete(student)}
                          title="Delete Student Record"
                          aria-label="Delete Student"
                        >
                          <Icons.Trash className="icon-xs" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
