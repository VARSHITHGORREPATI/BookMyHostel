import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CancelBooking.css';

const CancelBooking = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Fetch all rooms and filter occupied ones
    const fetchRooms = async () => {
      try {
        const response = await fetch('http://localhost:3001/rooms');
        if (!response.ok) {
          throw new Error('Failed to fetch rooms');
        }
        const data = await response.json();
        // Filter rooms where occupied > 0
        const occupiedRooms = data.filter(room => room.occupied > 0);
        setRooms(occupiedRooms);
      } catch (err) {
        setError('Failed to load rooms. Please try again.');
      }
    };

    fetchRooms();
  }, []);

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  const handleCancelBooking = async () => {
    if (!selectedRoom) return;

    try {
      // First, find the tenant associated with this room
      const tenantsResponse = await fetch('http://localhost:3001/tenants');
      if (!tenantsResponse.ok) {
        throw new Error('Failed to fetch tenants');
      }
      const tenants = await tenantsResponse.json();
      const tenant = tenants.find(t => t.roomId === selectedRoom.id);

      // Update room status
      const roomResponse = await fetch(`http://localhost:3001/rooms/${selectedRoom.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'Available',
          occupied: 0
        }),
      });

      if (!roomResponse.ok) {
        throw new Error('Failed to update room status');
      }

      // If we found a tenant, delete their record
      if (tenant) {
        const tenantResponse = await fetch(`http://localhost:3001/tenants/${tenant.id}`, {
          method: 'DELETE',
        });

        if (!tenantResponse.ok) {
          throw new Error('Failed to remove tenant record');
        }
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="cancel-booking">
      <h1>Cancel Room Booking</h1>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">Booking cancelled successfully! Redirecting...</div>}

      <div className="rooms-list">
        <h2>Occupied Rooms</h2>
        {rooms.length === 0 ? (
          <p>No occupied rooms found</p>
        ) : (
          <div className="room-grid">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                onClick={() => handleRoomSelect(room)}
              >
                <h3>Room {room.roomNumber}</h3>
                <p>Building: {room.building}</p>
                <p>Floor: {room.floor}</p>
                <p>Capacity: {room.capacity}</p>
                <p>Rent: ₹{room.rent}</p>
                <p>Occupied: {room.occupied}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedRoom && (
        <div className="confirmation-section">
          <h2>Confirm Cancellation</h2>
          <p>Are you sure you want to cancel the booking for Room {selectedRoom.roomNumber}?</p>
          <div className="action-buttons">
            <button className="cancel-btn" onClick={handleCancelBooking}>
              Confirm Cancellation
            </button>
            <button className="back-btn" onClick={() => navigate('/admin/dashboard')}>
              Back to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CancelBooking; 