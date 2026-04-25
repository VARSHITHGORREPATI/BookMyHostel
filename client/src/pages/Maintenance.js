import React, { useState, useEffect, useCallback } from 'react';
import './Maintenance.css';

const Maintenance = () => {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState({
    name: '',
    title: '',
    description: '',
    priority: 'medium',
  });
  const [tenantBooking, setTenantBooking] = useState(null);
  const [isLoadingBooking, setIsLoadingBooking] = useState(true);
  const [bookingError, setBookingError] = useState(null);

  useEffect(() => {
    const fetchUserAndBooking = async () => {
      setIsLoadingBooking(true);
      setBookingError(null);
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        setBookingError('Please log in to submit a maintenance request.');
        setIsLoadingBooking(false);
        return;
      }
      const parsedUser = JSON.parse(storedUser);

      try {
        const response = await fetch(`http://localhost:3001/tenants?email=${parsedUser.email}&status=Active`);
        if (!response.ok) {
          throw new Error('Failed to fetch booking details.');
        }
        const bookings = await response.json();
        if (bookings.length > 0) {
          setTenantBooking(bookings[0]);
        } else {
          setBookingError('No active room booking found. You must have an active booking to submit a request.');
        }
      } catch (err) {
        console.error('Error fetching booking:', err);
        setBookingError(err.message || 'Failed to retrieve your booking details.');
      } finally {
        setIsLoadingBooking(false);
      }
    };

    fetchUserAndBooking();
  }, []);

  useEffect(() => {
    fetch('http://localhost:3001/maintenanceRequests')
      .then(res => res.json())
      .then(data => setRequests(data))
      .catch(err => console.error('Error fetching maintenance requests:', err));
  }, []);

  const handleInputChange = useCallback((e) => {
    setNewRequest(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!tenantBooking || !tenantBooking.roomId) {
      alert(bookingError || 'Cannot submit request without an active room booking.');
      return;
    }

    let roomNumber = 'N/A';
    try {
        const roomResponse = await fetch(`http://localhost:3001/rooms/${tenantBooking.roomId}`);
        if (roomResponse.ok) {
            const roomData = await roomResponse.json();
            roomNumber = roomData.roomNumber; 
        }
    } catch (fetchErr) {
        console.error("Failed to fetch room number, using ID as fallback", fetchErr);
        roomNumber = `ID: ${tenantBooking.roomId}`; 
    }

    try {
      const response = await fetch('http://localhost:3001/maintenanceRequests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newRequest, 
          roomNumber: roomNumber, 
          roomId: tenantBooking.roomId, 
          tenantId: tenantBooking.id, 
          status: 'Pending',
          reportedDate: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to submit request');
      }

      const data = await response.json();
      setRequests(prevRequests => [...prevRequests, data]); // Use functional update
      // Reset form
      setNewRequest({
        name: '',
        title: '',
        description: '',
        priority: 'medium'
      });
      alert('Maintenance request submitted successfully!');
    } catch (error) {
      console.error('Error submitting maintenance request:', error);
      alert(`Failed to submit maintenance request: ${error.message}`);
    }
  }, [newRequest, tenantBooking, bookingError]);

  // Render loading state for booking check
  if (isLoadingBooking) {
    return (
      <div className="maintenance">
        <h1>Maintenance Requests</h1>
        <div className="loading">Loading your booking details...</div>
      </div>
    );
  }

  return (
    <div className="maintenance">
      <h1>Maintenance Requests</h1>

      <div className="maintenance-container">
        <div className="new-request">
          <h2>Submit New Request</h2>
          {/* Display booking error if any */}
          {bookingError && <div className="error">{bookingError}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={newRequest.name}
                onChange={handleInputChange}
                required
                disabled={!!bookingError} // Disable if booking error
              />
            </div>

            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={newRequest.title}
                onChange={handleInputChange}
                required
                disabled={!!bookingError}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={newRequest.description}
                onChange={handleInputChange}
                required
                disabled={!!bookingError}
              />
            </div>

            {/* Room Number Input Removed */}

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                name="priority"
                value={newRequest.priority}
                onChange={handleInputChange}
                disabled={!!bookingError}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoadingBooking || !!bookingError || !tenantBooking} // Disable button based on state
            >
              {isLoadingBooking ? 'Loading...' : (bookingError || !tenantBooking ? 'Booking Required' : 'Submit Request')}
            </button>
          </form>
        </div>

        <div className="requests-list">
          <h2>All Requests</h2>
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.title}</h3>
                {request.name && <span className="reporter-name">Reported by: {request.name}</span>}
                <span className={`priority ${request.priority}`}>
                  {request.priority}
                </span>
              </div>
              <p className="description">{request.description}</p>
              <div className="request-details">
                {/* Display room number fetched from room details or fallback */}
                <p>Room: {request.roomNumber || `ID: ${request.roomId}` || 'N/A'}</p> 
                <p>Status: <span className={`status ${request.status}`}>{request.status}</span></p>
                <p>Submitted: {new Date(request.reportedDate).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Maintenance; 