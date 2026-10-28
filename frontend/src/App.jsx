import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import StudentsPage from './pages/StudentsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AttendancePage from './pages/AttendancePage';
import SyllabusPage from './pages/SyllabusPage';
import FeesPage from './pages/FeesPage';
import ProfilePage from './pages/ProfilePage';
import AcademicInfoPage from './pages/AcademicInfoPage';
import ExaminationPage from './pages/ExaminationPage';
import ResultPage from './pages/ResultPage';
import HallTicketPage from './pages/HallTicketPage';
import ResultSheetPage from './pages/ResultSheetPage';
import StudentFormModal from './components/StudentFormModal';
import StudentDetailModal from './components/StudentDetailModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import { studentAPI } from './services/api';
import './App.css';

function MainApp() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Sidebar state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Student list & selected student (for portal pages)
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState(null);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudentForEdit, setSelectedStudentForEdit] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudentForDelete, setSelectedStudentForDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Fetch all students for portal page selector
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await studentAPI.getAll();
        if (res.success && res.students && res.students.length > 0) {
          setStudentsList(res.students);
          // Pre-select first student by default for portal pages
          if (!selectedStudentId) {
            setSelectedStudentId(res.students[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load students list:', err);
      }
    };
    fetchStudents();
  }, [refreshTrigger]);

  // When authenticated as student, find and use own student ID
  useEffect(() => {
    if (user && user.studentId) {
      setSelectedStudentId(user.studentId);
    }
  }, [user]);

  // Open Form Modal for Adding
  const handleOpenAddStudent = () => {
    if (!isAuthenticated) {
      showToast('Please log in as an administrator to add students', 'error');
      setActiveTab('login');
      return;
    }
    setSelectedStudentForEdit(null);
    setIsFormOpen(true);
  };

  // Open Form Modal for Editing
  const handleOpenEditStudent = (student) => {
    if (!isAuthenticated) {
      showToast('Please log in as an administrator to edit student records', 'error');
      setActiveTab('login');
      return;
    }
    setSelectedStudentForEdit(student);
    setIsFormOpen(true);
  };

  // Open Detail Modal
  const handleOpenDetailModal = (student) => {
    setSelectedStudentForDetail(student);
    setIsDetailOpen(true);
  };

  // Open Confirm Delete Modal
  const handleOpenDeleteModal = (student) => {
    if (!isAuthenticated) {
      showToast('Please log in as an administrator to delete student records', 'error');
      setActiveTab('login');
      return;
    }
    setSelectedStudentForDelete(student);
    setIsConfirmOpen(true);
  };

  // Submit Add or Edit Form
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (selectedStudentForEdit && selectedStudentForEdit._id) {
        const res = await studentAPI.update(selectedStudentForEdit._id, formData);
        if (res.success) {
          showToast(`Student ${res.student.name} updated successfully!`, 'success');
          setIsFormOpen(false);
          setRefreshTrigger((prev) => prev + 1);
        }
      } else {
        const res = await studentAPI.create(formData);
        if (res.success) {
          showToast(`Student ${res.student.name} enrolled successfully!`, 'success');
          setIsFormOpen(false);
          setRefreshTrigger((prev) => prev + 1);
        }
      }
    } catch (err) {
      console.error('Error saving student:', err);
      const msg = err.response?.data?.message || 'Failed to save student record';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Perform Deletion
  const handleConfirmDelete = async () => {
    if (!selectedStudentForDelete) return;
    setIsDeleting(true);
    try {
      const res = await studentAPI.delete(selectedStudentForDelete._id);
      if (res.success) {
        showToast(`Student ${selectedStudentForDelete.name} removed successfully`, 'success');
        setIsConfirmOpen(false);
        setSelectedStudentForDelete(null);
        setRefreshTrigger((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Error deleting student:', err);
      const msg = err.response?.data?.message || 'Failed to delete student';
      showToast(msg, 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const portalPageProps = {
    selectedStudentId,
    studentsList,
    onSelectStudent: setSelectedStudentId,
    isAuthenticated,
    user
  };

  return (
    <div className={`app-layout-sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
      />

      {/* Right Side: Top Navbar + Main Content */}
      <div className="app-main-column">
        {/* Top Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAddStudent={handleOpenAddStudent}
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          studentsList={studentsList}
          selectedStudentId={selectedStudentId}
          onSelectStudent={setSelectedStudentId}
        />

        {/* Main Content Area */}
        <main className="main-content">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateToStudents={() => setActiveTab('students')}
              onViewStudent={handleOpenDetailModal}
              onOpenAddStudent={handleOpenAddStudent}
              isAuthenticated={isAuthenticated}
            />
          )}

          {activeTab === 'students' && (
            <StudentsPage
              onViewStudent={handleOpenDetailModal}
              onEditStudent={handleOpenEditStudent}
              onDeleteStudent={handleOpenDeleteModal}
              onOpenAddStudent={handleOpenAddStudent}
              isAuthenticated={isAuthenticated}
              refreshTrigger={refreshTrigger}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendancePage {...portalPageProps} />
          )}

          {activeTab === 'syllabus' && (
            <SyllabusPage isAuthenticated={isAuthenticated} user={user} />
          )}

          {activeTab === 'fees' && (
            <FeesPage {...portalPageProps} />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              selectedStudentId={selectedStudentId}
              studentsList={studentsList}
              onSelectStudent={setSelectedStudentId}
              user={user}
            />
          )}

          {activeTab === 'academic-info' && (
            <AcademicInfoPage
              selectedStudentId={selectedStudentId}
              studentsList={studentsList}
              onSelectStudent={setSelectedStudentId}
              user={user}
            />
          )}

          {activeTab === 'examination' && (
            <ExaminationPage isAuthenticated={isAuthenticated} user={user} />
          )}

          {activeTab === 'result' && (
            <ResultPage {...portalPageProps} />
          )}

          {activeTab === 'hall-ticket' && (
            <HallTicketPage
              selectedStudentId={selectedStudentId}
              studentsList={studentsList}
              onSelectStudent={setSelectedStudentId}
              user={user}
            />
          )}

          {activeTab === 'result-sheet' && (
            <ResultSheetPage
              selectedStudentId={selectedStudentId}
              studentsList={studentsList}
              onSelectStudent={setSelectedStudentId}
              user={user}
            />
          )}

          {activeTab === 'login' && (
            <LoginPage
              onNavigateToRegister={() => setActiveTab('register')}
              onLoginSuccess={() => {
                showToast('Welcome back! Logged in successfully.', 'success');
                setActiveTab('dashboard');
              }}
            />
          )}

          {activeTab === 'register' && (
            <RegisterPage
              onNavigateToLogin={() => setActiveTab('login')}
              onRegisterSuccess={() => {
                showToast('Admin account created! You are now logged in.', 'success');
                setActiveTab('dashboard');
              }}
            />
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-content">
            <span>&copy; {new Date().getFullYear()} EduManage Academic Portal &bull; College Student Management System</span>
            <div className="tech-badge">
              <span className="dot dot-success"></span>
              <span>MERN Stack (MongoDB collegeDB &bull; Express &bull; React &bull; Node.js)</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedStudentForEdit}
        isSubmitting={isSubmitting}
      />

      <StudentDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        student={selectedStudentForDetail}
        onEdit={(student) => {
          setIsDetailOpen(false);
          handleOpenEditStudent(student);
        }}
        onDelete={(student) => {
          setIsDetailOpen(false);
          handleOpenDeleteModal(student);
        }}
        isAuthenticated={isAuthenticated}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record"
        message={
          selectedStudentForDelete
            ? `Are you sure you want to delete ${selectedStudentForDelete.name} (${selectedStudentForDelete.rollNumber})? This record will be permanently removed from collegeDB.`
            : 'Are you sure you want to delete this record?'
        }
        confirmText="Confirm Delete"
        isDeleting={isDeleting}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
