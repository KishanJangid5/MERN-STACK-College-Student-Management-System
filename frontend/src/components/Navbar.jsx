import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';

export default function Navbar({
  activeTab,
  setActiveTab,
  onOpenAddStudent,
  onToggleMobileMenu,
  studentsList = [],
  selectedStudentId,
  onSelectStudent
}) {
  const { user, isAuthenticated, logout } = useAuth();

  const tabLabels = {
    dashboard: { label: 'Dashboard', icon: Icons.Dashboard },
    students: { label: 'Student Directory', icon: Icons.Users },
    attendance: { label: 'Attendance Records', icon: Icons.CalendarCheck },
    syllabus: { label: 'Academic Syllabus', icon: Icons.BookOpen },
    fees: { label: 'Fee Structure & Payments', icon: Icons.CreditCard },
    profile: { label: 'Student Profile', icon: Icons.UserRound },
    'academic-info': { label: 'Academic Information', icon: Icons.GraduationCap },
    examination: { label: 'Examination Schedule', icon: Icons.ClipboardList },
    result: { label: 'Examination Results', icon: Icons.Award },
    'hall-ticket': { label: 'Examination Hall Ticket', icon: Icons.Ticket },
    'result-sheet': { label: 'Consolidated Result Sheet', icon: Icons.FileText },
    login: { label: 'Administrator & Student Login', icon: Icons.LogIn },
    register: { label: 'Portal Registration', icon: Icons.Plus }
  };

  const currentTab = tabLabels[activeTab] || { label: 'Academic Portal', icon: Icons.GraduationCap };
  const TabIcon = currentTab.icon;

  const isPortalTab = [
    'attendance',
    'fees',
    'profile',
    'academic-info',
    'examination',
    'result',
    'hall-ticket',
    'result-sheet'
  ].includes(activeTab);

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <div className="navbar-left">
          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            className="navbar-mobile-toggle mobile-only"
            onClick={onToggleMobileMenu}
            aria-label="Open portal navigation menu"
            title="Open menu"
          >
            <Icons.Menu className="icon-md" />
          </button>

          {/* Section Breadcrumb */}
          <div className="navbar-breadcrumb">
            <div className="breadcrumb-icon-badge">
              <TabIcon className="icon-sm text-primary" />
            </div>
            <div className="breadcrumb-text">
              <span className="breadcrumb-sub">College Portal</span>
              <span className="breadcrumb-current">{currentTab.label}</span>
            </div>
          </div>
        </div>

        {/* Center / Student Selector for Admin in Portal tabs */}
        <div className="navbar-center">
          {isPortalTab && user?.role !== 'student' && studentsList.length > 0 && (
            <div className="navbar-student-picker" title="Change active student view">
              <label htmlFor="nav-student-select" className="student-picker-label">
                <span className="picker-dot"></span>
                <span>Active Student:</span>
              </label>
              <select
                id="nav-student-select"
                className="form-select student-picker-select"
                value={selectedStudentId || ''}
                onChange={(e) => onSelectStudent && onSelectStudent(e.target.value)}
              >
                {studentsList.map((st) => (
                  <option key={st._id} value={st._id}>
                    {st.name} ({st.rollNumber}) &bull; Sem {st.semester}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Right Action & Profile Buttons */}
        <div className="navbar-right">
          {isAuthenticated && user?.role === 'admin' && (
            <button
              className="btn btn-primary btn-sm flex-center gap-1 desktop-only"
              onClick={onOpenAddStudent}
              title="Add a new student"
            >
              <Icons.Plus className="icon-sm" />
              <span>Add Student</span>
            </button>
          )}

          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-badge" title={`${user?.name} (${user?.email})`}>
                <div className="user-avatar">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="user-meta desktop-only">
                  <span className="user-name">{user?.name || 'User'}</span>
                  <span className="user-role">
                    {user?.role === 'admin'
                      ? 'Administrator'
                      : user?.role === 'student'
                      ? 'Student'
                      : 'Staff'}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-outline btn-sm btn-icon"
                onClick={logout}
                title="Log out of account"
              >
                <Icons.LogOut className="icon-sm text-danger" />
              </button>
            </div>
          ) : (
            <div className="auth-buttons">
              <button
                className={`btn btn-outline btn-sm ${activeTab === 'login' ? 'active' : ''}`}
                onClick={() => setActiveTab('login')}
              >
                <Icons.LogIn className="icon-sm" />
                <span>Sign In</span>
              </button>
              <button
                className={`btn btn-primary btn-sm ${activeTab === 'register' ? 'active' : ''}`}
                onClick={() => setActiveTab('register')}
              >
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
