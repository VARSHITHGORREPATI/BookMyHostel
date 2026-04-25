import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StudentDashboard.css';

const StudentDashboard = () => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const userData = JSON.parse(localStorage.getItem('user'));
        if (!userData) {
          setError('Please log in to view your dashboard');
          setLoading(false);
          return;
        }

        // Fetch tenant details
        const tenantResponse = await fetch(`http://localhost:3001/tenants?email=${userData.email}&status=Active`);
        if (!tenantResponse.ok) {
          throw new Error('Failed to fetch tenant details');
        }
        const tenants = await tenantResponse.json();
        
        if (tenants.length > 0) {
          const tenant = tenants[0];
          // Fetch room details
          const roomResponse = await fetch(`http://localhost:3001/rooms/${tenant.roomId}`);
          if (!roomResponse.ok) {
            throw new Error('Failed to fetch room details');
          }
          const roomData = await roomResponse.json();
          setRoomDetails({ ...roomData, tenant });

          // Fetch maintenance requests
          const maintenanceResponse = await fetch(`http://localhost:3001/maintenance?tenantId=${tenant.id}`);
          if (maintenanceResponse.ok) {
            const maintenanceData = await maintenanceResponse.json();
            setMaintenanceRequests(maintenanceData);
          }
        }
      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleMaintenanceRequest = () => {
    navigate('/student/maintenance');
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.name}!</p>
        </div>
        <div className="loading">Loading your dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="student-dashboard">
        <div className="dashboard-header">
          <h1>Student Dashboard</h1>
          <p className="welcome-message">Welcome back, {user?.name}!</p>
        </div>
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p className="welcome-message">Welcome back, {user?.name}!</p>
      </div>

      <div className="dashboard-content">
        {roomDetails ? (
          <>
            <div className="room-details">
              <h2>Your Room Information</h2>
              <div className="room-info">
                <div className="info-item">
                  <span className="label">Room Number:</span>
                  <span className="value">{roomDetails.roomNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">Building:</span>
                  <span className="value">{roomDetails.building}</span>
                </div>
                <div className="info-item">
                  <span className="label">Floor:</span>
                  <span className="value">{roomDetails.floor}</span>
                </div>
                <div className="info-item">
                  <span className="label">Rent:</span>
                  <span className="value">₹{roomDetails.rent}/month</span>
                </div>
                <div className="info-item">
                  <span className="label">Roll Number:</span>
                  <span className="value">{roomDetails.tenant.rollNumber}</span>
                </div>
                <div className="info-item">
                  <span className="label">Check-in Date:</span>
                  <span className="value">{new Date(roomDetails.tenant.checkInDate).toLocaleDateString()}</span>
                </div>
                <div className="info-item">
                  <span className="label">Duration:</span>
                  <span className="value">{roomDetails.tenant.numberOfMonths} months</span>
                </div>
                <div className="info-item">
                  <span className="label">Status:</span>
                  <span className={`status ${roomDetails.status.toLowerCase()}`}>{roomDetails.status}</span>
                </div>
              </div>
            </div>

            <div className="maintenance-section">
              <div className="section-header">
                <h2>Maintenance Requests</h2>
                <button 
                  className="request-btn"
                  onClick={handleMaintenanceRequest}
                >
                  New Request
                </button>
              </div>
              {maintenanceRequests.length > 0 ? (
                <div className="maintenance-list">
                  {maintenanceRequests.map(request => (
                    <div key={request.id} className="maintenance-card">
                      <div className="request-header">
                        <h3>{request.title}</h3>
                        <span className={`status ${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                      </div>
                      <p className="request-description">{request.description}</p>
                      <div className="request-meta">
                        <span>Date: {new Date(request.date).toLocaleDateString()}</span>
                        <span>Priority: {request.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-requests">No maintenance requests yet.</p>
              )}
            </div>
          </>
        ) : (
          <div className="no-room">
            <h2>No Active Room Booking</h2>
            <p>You haven't booked a room yet.</p>
            <button 
              className="book-room-btn"
              onClick={() => navigate('/student/book-room')}
            >
              Book a Room
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 