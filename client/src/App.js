import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import AuthForm from './components/AuthForm';
import Register from './components/Register';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/admindashboard';
import BookRoom from './pages/BookRoom';
import Maintenance from './pages/Maintenance';
import ManageTenants from './pages/ManageTenants';
import Reports from './pages/Reports';
import AddRoom from './pages/AddRoom';
import CancelBooking from './pages/CancelBooking';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <div className="content">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<AuthForm />} />
            <Route path="/register" element={<Register />} />

            {/* Student/Tenant Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/book-room"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <BookRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/student/maintenance"
              element={
                <ProtectedRoute allowedRoles={['tenant']}>
                  <Maintenance />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/add-room"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AddRoom />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/cancel-booking"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <CancelBooking />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/tenants"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <ManageTenants />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Reports />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
