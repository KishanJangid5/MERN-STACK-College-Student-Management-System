import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Icons } from '../components/Icons';

export default function LoginPage({ onNavigateToRegister, onLoginSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        onLoginSuccess();
      } else {
        setError(res.message || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please check your credentials and server connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@college.edu');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-badge">
            <Icons.GraduationCap className="icon-lg text-primary" />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to manage college student records</p>
        </div>

        {error && (
          <div className="auth-error-banner">
            <Icons.AlertTriangle className="icon-sm" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="login-email">Email Address</label>
            <div className="input-with-icon">
              <Icons.Mail className="input-icon" />
              <input
                id="login-email"
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
            <div className="label-with-hint">
              <label htmlFor="login-password">Password</label>
            </div>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block btn-lg flex-center gap-1"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border-sm"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <Icons.LogIn className="icon-sm" />
                <span>Sign In</span>
              </>
            )}
          </button>

          {/* Quick Demo Login Credentials button */}
          <div className="demo-login-box">
            <div className="demo-header">
              <span className="text-xs text-muted">Evaluation / Quick Testing</span>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm btn-block flex-center gap-1"
              onClick={handleDemoFill}
            >
              <span>Auto-Fill Demo Admin Credentials</span>
            </button>
            <span className="demo-credentials-hint">
              admin@college.edu &bull; password123
            </span>
          </div>
        </form>

        <div className="auth-footer">
          <span>Don't have an administrator account?</span>{' '}
          <button
            type="button"
            className="link-button"
            onClick={onNavigateToRegister}
          >
            Register here
          </button>
        </div>
      </div>
    </div>
  );
}
