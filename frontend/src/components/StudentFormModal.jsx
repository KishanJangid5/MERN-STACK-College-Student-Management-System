import { useState, useEffect } from 'react';
import { Icons } from './Icons';

const COURSE_OPTIONS = [
  'Computer Science',
  'Information Technology',
  'Data Science',
  'Artificial Intelligence',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Business Administration'
];

const DEPARTMENT_OPTIONS = [
  'Computer Science & Engineering',
  'Information Technology',
  'Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Management Studies'
];

export default function StudentFormModal({ isOpen, onClose, onSubmit, initialData = null, isSubmitting }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    course: 'Computer Science',
    age: '',
    rollNumber: '',
    phone: '',
    department: 'Computer Science & Engineering',
    semester: 1,
    gpa: 8.0,
    status: 'Active',
    address: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        email: initialData.email || '',
        course: initialData.course || 'Computer Science',
        age: initialData.age || '',
        rollNumber: initialData.rollNumber || '',
        phone: initialData.phone || '',
        department: initialData.department || 'Computer Science & Engineering',
        semester: initialData.semester || 1,
        gpa: initialData.gpa !== undefined ? initialData.gpa : 8.0,
        status: initialData.status || 'Active',
        address: initialData.address || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        course: 'Computer Science',
        age: '',
        rollNumber: '',
        phone: '',
        department: 'Computer Science & Engineering',
        semester: 1,
        gpa: 8.0,
        status: 'Active',
        address: ''
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/.test(formData.email)) {
      errs.email = 'Please provide a valid email address';
    }
    if (!formData.course.trim()) errs.course = 'Course is required';
    if (!formData.age) {
      errs.age = 'Age is required';
    } else if (Number(formData.age) < 15 || Number(formData.age) > 100) {
      errs.age = 'Age must be between 15 and 100';
    }
    if (formData.gpa !== '' && (Number(formData.gpa) < 0 || Number(formData.gpa) > 10)) {
      errs.gpa = 'GPA must be between 0.0 and 10.0';
    }
    if (formData.semester && (Number(formData.semester) < 1 || Number(formData.semester) > 8)) {
      errs.semester = 'Semester must be between 1 and 8';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  const isEditMode = Boolean(initialData && initialData._id);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-center gap-2">
            <div className="icon-badge">
              <Icons.GraduationCap className="icon-md text-primary" />
            </div>
            <div>
              <h2 className="modal-title">
                {isEditMode ? 'Update Student Record' : 'Enroll New Student'}
              </h2>
              <p className="modal-subtitle">
                {isEditMode
                  ? `Editing profile for ${initialData.name}`
                  : 'Enter the student details to register them in collegeDB'}
              </p>
            </div>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close dialog">
            <Icons.Close className="icon-sm" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Full Name */}
            <div className="form-group col-span-2">
              <label htmlFor="student-name">
                Full Name <span className="text-danger">*</span>
              </label>
              <input
                id="student-name"
                type="text"
                name="name"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="e.g. Aarav Sharma"
                value={formData.name}
                onChange={handleChange}
                required
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="student-email">
                Email Address <span className="text-danger">*</span>
              </label>
              <input
                id="student-email"
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'input-error' : ''}`}
                placeholder="student@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            {/* Roll Number / Student ID */}
            <div className="form-group">
              <label htmlFor="student-roll">
                Roll Number / Student ID
              </label>
              <input
                id="student-roll"
                type="text"
                name="rollNumber"
                className="form-input"
                placeholder={isEditMode ? formData.rollNumber : 'Auto-generated if empty (e.g. CS-1002)'}
                value={formData.rollNumber}
                onChange={handleChange}
              />
              <span className="form-hint">Leave blank to auto-generate unique ID</span>
            </div>

            {/* Course */}
            <div className="form-group">
              <label htmlFor="student-course">
                Course / Degree <span className="text-danger">*</span>
              </label>
              <select
                id="student-course"
                name="course"
                className={`form-select ${errors.course ? 'input-error' : ''}`}
                value={formData.course}
                onChange={handleChange}
                required
              >
                {COURSE_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.course && <span className="field-error">{errors.course}</span>}
            </div>

            {/* Department */}
            <div className="form-group">
              <label htmlFor="student-department">Department</label>
              <select
                id="student-department"
                name="department"
                className="form-select"
                value={formData.department}
                onChange={handleChange}
              >
                {DEPARTMENT_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Age */}
            <div className="form-group">
              <label htmlFor="student-age">
                Age (years) <span className="text-danger">*</span>
              </label>
              <input
                id="student-age"
                type="number"
                name="age"
                min="15"
                max="100"
                className={`form-input ${errors.age ? 'input-error' : ''}`}
                placeholder="e.g. 20"
                value={formData.age}
                onChange={handleChange}
                required
              />
              {errors.age && <span className="field-error">{errors.age}</span>}
            </div>

            {/* Semester */}
            <div className="form-group">
              <label htmlFor="student-sem">Semester (1 - 8)</label>
              <input
                id="student-sem"
                type="number"
                name="semester"
                min="1"
                max="8"
                className="form-input"
                value={formData.semester}
                onChange={handleChange}
              />
            </div>

            {/* GPA */}
            <div className="form-group">
              <label htmlFor="student-gpa">Current CGPA (0.0 - 10.0)</label>
              <input
                id="student-gpa"
                type="number"
                step="0.01"
                name="gpa"
                min="0"
                max="10"
                className={`form-input ${errors.gpa ? 'input-error' : ''}`}
                placeholder="e.g. 8.5"
                value={formData.gpa}
                onChange={handleChange}
              />
              {errors.gpa && <span className="field-error">{errors.gpa}</span>}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label htmlFor="student-phone">Phone Number</label>
              <input
                id="student-phone"
                type="tel"
                name="phone"
                className="form-input"
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="student-status">Enrollment Status</label>
              <select
                id="student-status"
                name="status"
                className="form-select"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Active">Active</option>
                <option value="Graduated">Graduated</option>
                <option value="On Leave">On Leave</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>

            {/* Address */}
            <div className="form-group col-span-2">
              <label htmlFor="student-address">Address / City</label>
              <input
                id="student-address"
                type="text"
                name="address"
                className="form-input"
                placeholder="e.g. Mumbai, Maharashtra"
                value={formData.address}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-center gap-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border-sm"></span>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Icons.CheckCircle className="icon-sm" />
                  <span>{isEditMode ? 'Save Changes' : 'Enroll Student'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
