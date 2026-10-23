import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ExamTakingView from './pages/ExamTakingView';
import ExamResultView from './pages/ExamResultView';
import FacultyDashboard from './pages/FacultyDashboard';
import CreateExamView from './pages/CreateExamView';
import ManageQuestionsView from './pages/ManageQuestionsView';
import LiveMonitorView from './pages/LiveMonitorView';
import ExamResultsFacultyView from './pages/ExamResultsFacultyView';

// Protected Route Component
function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>Loading session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'ROLE_FACULTY' ? '/faculty' : '/student'} replace />;
  }

  return children;
}

// Root Route Redirector
function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'ROLE_FACULTY' ? '/faculty' : '/student'} replace />;
}

// Layout wrapper to conditionally hide navbar in fullscreen exam mode
function MainLayout({ children }) {
  const location = useLocation();
  const isExamMode = location.pathname.startsWith('/student/exam/');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {!isExamMode && <Navbar />}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <MainLayout>
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Student Routes */}
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/exam/:examId"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <ExamTakingView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/result/:attemptId"
              element={
                <ProtectedRoute allowedRoles={['ROLE_STUDENT']}>
                  <ExamResultView />
                </ProtectedRoute>
              }
            />

            {/* Faculty Routes */}
            <Route
              path="/faculty"
              element={
                <ProtectedRoute allowedRoles={['ROLE_FACULTY', 'ROLE_ADMIN']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/exam/create"
              element={
                <ProtectedRoute allowedRoles={['ROLE_FACULTY', 'ROLE_ADMIN']}>
                  <CreateExamView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/exam/:id/questions"
              element={
                <ProtectedRoute allowedRoles={['ROLE_FACULTY', 'ROLE_ADMIN']}>
                  <ManageQuestionsView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/exam/:id/monitor"
              element={
                <ProtectedRoute allowedRoles={['ROLE_FACULTY', 'ROLE_ADMIN']}>
                  <LiveMonitorView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/faculty/exam/:id/results"
              element={
                <ProtectedRoute allowedRoles={['ROLE_FACULTY', 'ROLE_ADMIN']}>
                  <ExamResultsFacultyView />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </MainLayout>
      </Router>
    </AuthProvider>
  );
}
