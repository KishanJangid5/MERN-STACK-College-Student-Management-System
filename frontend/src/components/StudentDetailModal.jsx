import { Icons } from './Icons';

export default function StudentDetailModal({
  isOpen,
  onClose,
  student,
  onEdit,
  onDelete,
  isAuthenticated
}) {
  if (!isOpen || !student) return null;

  const gpa = Number(student.gpa || 0);
  const gpaPercent = Math.min(Math.round((gpa / 10) * 100), 100);

  const formattedDate = student.enrollmentDate
    ? new Date(student.enrollmentDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Not Specified';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-md" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="detail-header-info">
            <div className="avatar-lg">
              {student.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="modal-title">{student.name}</h2>
              <div className="detail-tags">
                <span className="badge badge-roll">{student.rollNumber}</span>
                <span
                  className={`status-pill status-${(student.status || 'Active').toLowerCase().replace(' ', '-')}`}
                >
                  {student.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close dialog">
            <Icons.Close className="icon-sm" />
          </button>
        </div>

        <div className="modal-body">
          {/* GPA Card */}
          <div className="gpa-highlight-card">
            <div className="gpa-card-inner">
              <div>
                <span className="text-xs text-muted uppercase">Cumulative GPA</span>
                <div className="gpa-big-number">
                  {gpa.toFixed(2)} <span className="text-sm text-muted">/ 10.00</span>
                </div>
              </div>
              <div className="gpa-badge-right">
                <span className="badge badge-lg">
                  {gpa >= 9.0 ? 'Summa Cum Laude' : gpa >= 8.0 ? 'First Class Distinction' : 'First Class'}
                </span>
              </div>
            </div>
            <div className="gpa-progress-track">
              <div
                className="gpa-progress-fill"
                style={{ width: `${gpaPercent}%` }}
              ></div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="detail-info-grid">
            <div className="detail-item">
              <span className="detail-label">Email Address</span>
              <div className="detail-value flex-center gap-1">
                <Icons.Mail className="icon-xs text-muted" />
                <a href={`mailto:${student.email}`} className="text-primary">
                  {student.email}
                </a>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Phone Number</span>
              <div className="detail-value flex-center gap-1">
                <Icons.Phone className="icon-xs text-muted" />
                <span>{student.phone || 'N/A'}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Course</span>
              <div className="detail-value font-medium">{student.course}</div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Department</span>
              <div className="detail-value">{student.department || 'Engineering'}</div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Current Semester</span>
              <div className="detail-value">Semester {student.semester || 1}</div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Age</span>
              <div className="detail-value">{student.age} years old</div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Enrollment Date</span>
              <div className="detail-value flex-center gap-1">
                <Icons.Calendar className="icon-xs text-muted" />
                <span>{formattedDate}</span>
              </div>
            </div>

            <div className="detail-item">
              <span className="detail-label">Address</span>
              <div className="detail-value flex-center gap-1">
                <Icons.MapPin className="icon-xs text-muted" />
                <span>{student.address || 'Not specified'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer justify-between">
          <div>
            {isAuthenticated && (
              <button
                className="btn btn-outline-danger btn-sm flex-center gap-1"
                onClick={() => {
                  onClose();
                  onDelete(student);
                }}
              >
                <Icons.Trash className="icon-xs" />
                <span>Delete</span>
              </button>
            )}
          </div>
          <div className="flex-center gap-2">
            <button className="btn btn-outline btn-sm" onClick={onClose}>
              Close
            </button>
            {isAuthenticated && (
              <button
                className="btn btn-primary btn-sm flex-center gap-1"
                onClick={() => {
                  onClose();
                  onEdit(student);
                }}
              >
                <Icons.Edit className="icon-xs" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
