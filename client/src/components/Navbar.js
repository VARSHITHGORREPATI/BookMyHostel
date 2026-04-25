import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">Hostel Management</Link>
      </div>
      
      <div className="navbar-links">
        {!token ? (
          <>
            <Link to="/">Home</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/login" className="login-btn">Login</Link>
          </>
        ) : (
          <>
            {user?.role === 'admin' ? (
              <>
                <Link to="/admin/dashboard">Admin Dashboard</Link>
                <Link to="/admin/tenants">Manage Tenants</Link>
                <Link to="/admin/reports">Reports</Link>
              </>
            ) : (
              <>
                <Link to="/student/dashboard">Student Dashboard</Link>
                <Link to="/student/book-room">Book Room</Link>
                <Link to="/student/maintenance">Maintenance</Link>
              </>
            )}
            <div className="user-info">
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar; 