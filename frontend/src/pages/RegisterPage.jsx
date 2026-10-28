import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export default function RegisterPage({ onNavigateToLogin, onRegisterSuccess }) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password) {
      setError('Please fill in all required fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name, email, password, role);
      if (res.success) {
        onRegisterSuccess();
      } else {
        setError(res.message || 'Registration failed');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Icons.GraduationCap className="icon-lg text-primary" />
          </div>
          <h2 className="auth-title">Create Admin Account</h2>
          <p className="auth-subtitle">Register to manage students and academic programs</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <Icons.AlertTriangle className="icon-sm" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="reg-name">Full Name</label>
            <input
              id="reg-name"
              type="text"
              className="form-input"
              placeholder="e.g. Professor Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Official Email Address</label>
            <div className="input-with-icon">
              <Icons.Mail className="input-icon" />
              <input
                id="reg-email"
                type="email"
                className="form-input with-icon"
                placeholder="admin@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Password (min 6 characters)</label>
            <input
              id="reg-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-confirm-password">Confirm Password</label>
            <input
              id="reg-confirm-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-role">Role</label>
            <select
              id="reg-role"
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="admin">System Administrator</option>
              <option value="staff">Academic Staff</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg flex-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border-sm"></span>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <Icons.CheckCircle className="icon-sm" />
                <span>Register Account</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <span>Already have an account?</span>{' '}
          <button
            type="button"
            className="link-button"
            onClick={onNavigateToLogin}
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
