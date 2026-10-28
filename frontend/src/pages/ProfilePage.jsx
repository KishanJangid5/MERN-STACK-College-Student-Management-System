import { useState, useEffect, useCallback } from 'react';
import { profileAPI } from '../services/api';
import { Icons } from '../components/Icons';

export default function ProfilePage({
  selectedStudentId,
  studentsList = [],
  onSelectStudent,
  user
}) {
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Editable fields
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;

      const res = await profileAPI.get(params);
      if (res.success && res.student) {
        setStudent(res.student);
        setPhone(res.student.phone || '');
        setAddress(res.student.address || '');
      } else {
        setError('No student profile found');
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      setError(err.response?.data?.message || 'Error fetching profile');
    } finally {
      setLoading(false);
    }
  }, [selectedStudentId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccessMsg('');

    try {
      const params = {};
      if (selectedStudentId) params.studentId = selectedStudentId;

      const res = await profileAPI.update(
        {
          studentId: student._id,
          phone: phone.trim(),
          address: address.trim()
        },
        params
      );

      if (res.success) {
        setStudent(res.student);
        setSuccessMsg('Your profile contact details were updated successfully!');
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="portal-page">
      {/* Header */}
      <div className="page-header justify-between">
        <div>
          <h1 className="page-title flex-center gap-2">
            <Icons.UserRound className="icon-md text-primary" />
            <span>Student Profile</span>
          </h1>
          <p className="page-subtitle">
            Authenticated institutional credentials, personal details, and verified student identity.
          </p>
        </div>

        {user?.role !== 'student' && studentsList.length > 0 && (
          <div className="flex-center gap-2">
            <label htmlFor="profile-student-select" className="text-xs text-muted">
              Select Student:
            </label>
            <select
              id="profile-student-select"
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
          <p>Retrieving profile data...</p>
        </div>
      ) : error ? (
        <div className="error-banner">
          <Icons.AlertTriangle className="icon-md" />
          <span>{error}</span>
        </div>
      ) : student ? (
        <div className="profile-layout-grid">
          {/* Left Column: Identity & Card */}
          <div className="profile-card card">
            <div className="profile-card-header">
              <div className="profile-avatar-large">
                {student.name.charAt(0)}
              </div>
              <h2 className="profile-student-name">{student.name}</h2>
              <span className="profile-student-roll">{student.rollNumber}</span>
              <span className="badge badge-success mt-2">
                {student.status || 'Active Student'}
              </span>
            </div>

            <div className="profile-key-details">
              <div className="profile-detail-row">
                <span className="text-muted">Degree / Course</span>
                <span className="font-medium text-main">{student.course}</span>
              </div>
              <div className="profile-detail-row">
                <span className="text-muted">Current Semester</span>
                <span className="font-medium text-main">Semester {student.semester}</span>
              </div>
              <div className="profile-detail-row">
                <span className="text-muted">Department</span>
                <span className="font-medium text-main">{student.department}</span>
              </div>
              <div className="profile-detail-row">
                <span className="text-muted">Cumulative GPA</span>
                <span className="font-medium text-primary">{student.gpa} / 10.0</span>
              </div>
              <div className="profile-detail-row">
                <span className="text-muted">Enrolled Since</span>
                <span className="font-medium text-main">
                  {new Date(student.enrollmentDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>

            <div className="security-notice-box mt-4">
              <Icons.Shield className="icon-sm text-primary" />
              <span>
                University ID verified &bull; Authentication credentials and role-based access secured.
              </span>
            </div>
          </div>

          {/* Right Column: Information & Editable Details */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Personal Information & Contact</h3>
              <span className="text-xs text-muted">
                Students can update contact information. Academic credentials require registrar approval.
              </span>
            </div>

            <div className="card-body">
              {successMsg && (
                <div className="success-banner mb-4">
                  <Icons.CheckCircle className="icon-sm" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveProfile}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Official Full Name (Registrar Record)</label>
                    <input
                      type="text"
                      className="form-input read-only"
                      value={student.name}
                      readOnly
                      title="Name cannot be modified directly"
                    />
                  </div>
                  <div className="form-group">
                    <label>Permanent Roll Number</label>
                    <input
                      type="text"
                      className="form-input read-only"
                      value={student.rollNumber}
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Institutional Email</label>
                    <div className="input-with-icon">
                      <Icons.Mail className="input-icon" />
                      <input
                        type="email"
                        className="form-input with-icon read-only"
                        value={student.email}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="profile-phone">
                      Contact Phone Number <span className="text-xs text-primary">(Editable)</span>
                    </label>
                    <div className="input-with-icon">
                      <Icons.Phone className="input-icon" />
                      <input
                        id="profile-phone"
                        type="tel"
                        className="form-input with-icon"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="profile-address">
                    Residential Address <span className="text-xs text-primary">(Editable)</span>
                  </label>
                  <div className="input-with-icon">
                    <Icons.MapPin className="input-icon" />
                    <textarea
                      id="profile-address"
                      className="form-textarea with-icon"
                      rows="3"
                      placeholder="Enter street, city, state, postal code"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Age</label>
                    <input
                      type="text"
                      className="form-input read-only"
                      value={`${student.age} Years`}
                      readOnly
                    />
                  </div>
                  <div className="form-group">
                    <label>Program Level</label>
                    <input
                      type="text"
                      className="form-input read-only"
                      value="Undergraduate B.Tech"
                      readOnly
                    />
                  </div>
                </div>

                <div className="form-footer justify-between mt-4">
                  <span className="text-xs text-muted">
                    Changes are synced instantly with collegeDB.
                  </span>
                  <button
                    type="submit"
                    className="btn btn-primary flex-center gap-1"
                    disabled={saving}
                  >
                    {saving ? (
                      <span>Saving Changes...</span>
                    ) : (
                      <>
                        <Icons.Check className="icon-xs" />
                        <span>Save Contact Details</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
