import { Icons } from './Icons';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  activeTab,
  setActiveTab,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen
}) {
  const { user, isAuthenticated, logout } = useAuth();

  const menuItems = [
    {
      group: 'Administration',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard },
        { id: 'students', label: 'Students', icon: Icons.Users }
      ]
    },
    {
      group: 'Academic Portal',
      items: [
        { id: 'attendance', label: 'Attendance', icon: Icons.CalendarCheck, badge: 'Daily' },
        { id: 'syllabus', label: 'Syllabus', icon: Icons.BookOpen },
        { id: 'fees', label: 'Fees', icon: Icons.CreditCard },
        { id: 'profile', label: 'Profile', icon: Icons.UserRound },
        { id: 'academic-info', label: 'Academic Info', icon: Icons.GraduationCap },
        { id: 'examination', label: 'Examination', icon: Icons.ClipboardList, badge: 'Exams' },
        { id: 'result', label: 'Result', icon: Icons.Award },
        { id: 'hall-ticket', label: 'Hall Ticket', icon: Icons.Ticket },
        { id: 'result-sheet', label: 'Result Sheet', icon: Icons.FileText }
      ]
    }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`app-sidebar ${collapsed ? 'collapsed' : ''} ${
          mobileOpen ? 'mobile-open' : ''
        }`}
      >
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <div
            className="sidebar-brand"
            onClick={() => handleNavClick('dashboard')}
            title="EduManage Student Portal"
          >
            <div className="sidebar-brand-icon">
              <Icons.GraduationCap className="icon-md" />
            </div>
            {!collapsed && (
              <div className="sidebar-brand-text">
                <span className="sidebar-brand-title">EduManage</span>
                <span className="sidebar-brand-sub">Academic Portal</span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            type="button"
            className="sidebar-toggle-btn desktop-only"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label="Toggle sidebar collapse"
          >
            {collapsed ? (
              <Icons.ChevronRight className="icon-xs" />
            ) : (
              <Icons.ChevronLeft className="icon-xs" />
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            className="sidebar-close-btn mobile-only"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
          >
            <Icons.Close className="icon-sm" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {menuItems.map((section) => (
            <div key={section.group} className="sidebar-section">
              {!collapsed && (
                <div className="sidebar-section-title">{section.group}</div>
              )}
              <ul className="sidebar-menu-list">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id} className="sidebar-menu-item">
                      <button
                        type="button"
                        id={`nav-${item.id}`}
                        className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                        title={collapsed ? item.label : undefined}
                      >
                        <span className="sidebar-icon-wrapper">
                          <Icon className="sidebar-icon" />
                        </span>
                        {!collapsed && (
                          <span className="sidebar-label">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="sidebar-badge">{item.badge}</span>
                        )}
                        {isActive && <span className="active-indicator" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Info */}
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <div className="sidebar-user-card">
              <div
                className="sidebar-user-avatar"
                title={user?.name || 'User'}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              {!collapsed && (
                <div className="sidebar-user-details">
                  <span className="sidebar-user-name" title={user?.name}>
                    {user?.name || 'User'}
                  </span>
                  <span className="sidebar-user-role">
                    {user?.role === 'admin'
                      ? 'Administrator'
                      : user?.role === 'student'
                      ? 'Student'
                      : 'Staff'}
                  </span>
                </div>
              )}
              {!collapsed && (
                <button
                  type="button"
                  className="sidebar-logout-btn"
                  onClick={logout}
                  title="Sign Out"
                >
                  <Icons.LogOut className="icon-xs" />
                </button>
              )}
            </div>
          ) : (
            <div className="sidebar-auth-prompt">
              {!collapsed ? (
                <div className="sidebar-auth-btns">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm btn-block"
                    onClick={() => handleNavClick('login')}
                  >
                    <Icons.LogIn className="icon-xs" />
                    <span>Sign In</span>
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="sidebar-nav-link"
                  onClick={() => handleNavClick('login')}
                  title="Sign In"
                >
                  <Icons.LogIn className="sidebar-icon" />
                </button>
              )}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
