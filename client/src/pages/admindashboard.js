import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    pendingRequests: 0,
    totalStudents: 0
  });

  useEffect(() => {
    // Fetch all data from JSON server
    Promise.all([
      fetch('http://localhost:3001/rooms').then(res => res.json()),
      fetch('http://localhost:3001/maintenanceRequests').then(res => res.json())
    ])
      .then(([roomsData, maintenanceData]) => {
        setRooms(roomsData);
        setMaintenanceRequests(maintenanceData);

        // Calculate statistics
        setStats({
          totalRooms: roomsData.length,
          occupiedRooms: roomsData.filter(room => room.occupied > 0).length,
          pendingRequests: maintenanceData.filter(request => request.status === 'Pending').length,
          totalStudents: roomsData.reduce((sum, room) => sum + room.occupied, 0)
        });
      })
      .catch(err => console.error('Error fetching dashboard data:', err));
  }, []);

  const handleMaintenanceStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/maintenanceRequests/${requestId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update maintenance request status');
      }

      const updatedRequest = await response.json();
      setMaintenanceRequests(prevRequests =>
        prevRequests.map(request =>
          request.id === requestId ? updatedRequest : request
        )
      );
    } catch (error) {
      console.error('Error updating maintenance request:', error);
      alert('Failed to update maintenance request status');
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="action-buttons">
          <button 
            className="add-room-btn"
            onClick={() => navigate('/admin/add-room')}
          >
            Add New Room
          </button>
          <button 
            className="cancel-booking-btn"
            onClick={() => navigate('/admin/cancel-booking')}
          >
            Cancel Booking
          </button>
        </div>
      </div>
      
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h2>Statistics</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <h3>Total Rooms</h3>
              <p>{stats.totalRooms}</p>
            </div>
            <div className="stat-item">
              <h3>Occupied Rooms</h3>
              <p>{stats.occupiedRooms}</p>
            </div>
            <div className="stat-item">
              <h3>Pending Requests</h3>
              <p>{stats.pendingRequests}</p>
            </div>
            <div className="stat-item">
              <h3>Total Students</h3>
              <p>{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        {/* Recent Rooms */}
        <div className="dashboard-card">
          <h2>Recent Rooms</h2>
          {rooms.length > 0 ? (
            <div className="rooms-list">
              {rooms.slice(0, 5).map(room => (
                <div key={room.id} className="room-item">
                  <h3>Room {room.roomNumber}</h3>
                  <p>Building: {room.building}</p>
                  <p>Status: {room.status}</p>
                </div>
              ))}
            </div>
          ) : (
            <p>No rooms available</p>
          )}
        </div>

        {}
        <div className="dashboard-card">
          <h2>Maintenance Requests</h2>
          {maintenanceRequests.length > 0 ? (
            <div className="maintenance-requests">
              {maintenanceRequests.map(request => (
                <div key={request.id} className="request-item">
                  <div className="request-header">
                    <h3>Room {request.roomId}</h3>
                    <span className={`status ${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="request-description">{request.description}</p>
                  <div className="request-meta">
                    <span>Priority: {request.priority}</span>
                    <span>Date: {new Date(request.date).toLocaleDateString()}</span>
                  </div>
                  <div className="request-actions">
                    <select
                      value={request.status}
                      onChange={(e) => handleMaintenanceStatusUpdate(request.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>No maintenance requests</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
