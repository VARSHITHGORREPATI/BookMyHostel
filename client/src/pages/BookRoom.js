import React, { useState, useEffect, useCallback, useMemo } from 'react';
import './BookRoom.css';

const BookRoom = () => {
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [hasExistingBooking, setHasExistingBooking] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    rollNumber: '',
    startMonth: '',
    numberOfMonths: 1
  });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTenant, setCurrentTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoize user data to prevent unnecessary re-renders
  const userData = useMemo(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }, []);

  // Memoized fetch function with proper error handling
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!userData) {
        setError('Please log in to view rooms');
        setLoading(false);
        return;
      }

      setUser(userData);

      // Fetch rooms and check existing booking in parallel
      const [roomsResponse, bookingResponse] = await Promise.all([
        fetch('http://localhost:3001/rooms'),
        fetch(`http://localhost:3001/tenants?email=${userData.email}&status=Active`)
      ]);

      if (!roomsResponse.ok) throw new Error('Failed to fetch rooms');
      if (!bookingResponse.ok) throw new Error('Failed to check existing booking');

      const [roomsData, bookings] = await Promise.all([
        roomsResponse.json(),
        bookingResponse.json()
      ]);

      setRooms(roomsData);

      if (bookings.length > 0) {
        setCurrentTenant(bookings[0]);
        setHasExistingBooking(true);
        setBookingDetails(prev => ({
          ...prev,
          rollNumber: bookings[0].rollNumber || ''
        }));
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userData]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize filtered rooms to prevent unnecessary re-renders
  const filteredRooms = useMemo(() => {
    if (!searchTerm) return rooms;

    return rooms.filter(room => 
      room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.building.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.floor.toString().includes(searchTerm)
    );
  }, [rooms, searchTerm]);

  // Memoize room selection handler
  const handleRoomSelect = useCallback((room) => {
    if (hasExistingBooking && room.id !== currentTenant?.roomId) {
      alert('You already have an active room booking. You cannot book another room.');
      return;
    }
    if (user?.role !== 'admin' && room.status !== 'Available') {
      alert('This room is not available for booking.');
      return;
    }
    if (user?.role !== 'admin' && room.occupied >= room.capacity) {
      alert('This room is at full capacity.');
      return;
    }
    setSelectedRoom(room);
  }, [hasExistingBooking, currentTenant, user]);

  // Memoize input change handler
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setBookingDetails(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Memoize booking handler
  const handleBooking = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedRoom || !user) return;

    try {
      setLoading(true);
      setError(null);

      // Check if roll number is already registered
      const rollNumberCheck = await fetch(`http://localhost:3001/tenants?rollNumber=${bookingDetails.rollNumber}&status=Active`);
      const existingRollNumber = await rollNumberCheck.json();
      
      if (existingRollNumber.length > 0 && existingRollNumber[0].id !== currentTenant?.id) {
        throw new Error('This roll number is already registered with another booking.');
      }

      // Update room status
      const roomResponse = await fetch(`http://localhost:3001/rooms/${selectedRoom.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: selectedRoom.occupied + 1 >= selectedRoom.capacity ? 'Occupied' : 'Available',
          occupied: selectedRoom.occupied + 1
        })
      });

      if (!roomResponse.ok) throw new Error('Failed to update room status');
      const updatedRoom = await roomResponse.json();

      // Create tenant record
      const tenantData = {
        name: user.name,
        email: user.email,
        roomId: selectedRoom.id,
        startMonth: bookingDetails.startMonth,
        numberOfMonths: parseInt(bookingDetails.numberOfMonths),
        status: 'Active',
        rollNumber: bookingDetails.rollNumber,
        checkInDate: new Date().toISOString()
      };

      const tenantResponse = await fetch('http://localhost:3001/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenantData)
      });

      if (!tenantResponse.ok) throw new Error('Failed to create tenant record');
      const newTenant = await tenantResponse.json();

      // Create payment record
      const paymentResponse = await fetch('http://localhost:3001/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: newTenant.id,
          roomId: selectedRoom.id,
          type: 'Payment',
          amount: selectedRoom.rent * parseInt(bookingDetails.numberOfMonths),
          date: new Date().toISOString(),
          description: `Payment for ${bookingDetails.numberOfMonths} month(s)`,
          status: 'Paid'
        })
      });

      if (!paymentResponse.ok) throw new Error('Failed to create payment record');

      // Update state in a single batch
      setCurrentTenant(newTenant);
      setHasExistingBooking(true);
      setRooms(prevRooms => prevRooms.map(room => 
        room.id === selectedRoom.id ? updatedRoom : room
      ));
      setSelectedRoom(null);
      setBookingDetails({
        startMonth: '',
        numberOfMonths: 1,
        rollNumber: ''
      });

      alert('Booking successful!');
    } catch (error) {
      console.error('Error creating booking:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [selectedRoom, user, currentTenant, bookingDetails]);

  if (loading) {
    return (
      <div className="book-room">
        <h1>Book a Room</h1>
        <div className="loading">Loading rooms...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="book-room">
        <h1>Book a Room</h1>
        <div className="error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="book-room">
        <h1>Book a Room</h1>
        <div className="booking-container">
          <div className="existing-booking-message">
            <h2>Please log in to book a room</h2>
            <p>You need to be logged in to view and book rooms.</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasExistingBooking && !currentTenant) {
    return (
      <div className="book-room">
        <h1>Book a Room</h1>
        <div className="booking-container">
          <div className="existing-booking-message">
            <h2>You already have an active room booking</h2>
            <p>You cannot book another room while you have an active booking.</p>
          </div>
        </div>
      </div>
    );
  }

  if (hasExistingBooking && currentTenant) {
    return (
      <div className="book-room">
        <h1>Your Room Booking</h1>
        <div className="booking-container">
          <div className="existing-booking-message">
            <h2>You have an active room booking</h2>
            <div className="booking-details">
              <p><strong>Room Number:</strong> {rooms.find(r => r.id === currentTenant.roomId)?.roomNumber || 'Loading...'}</p>
              <p><strong>Building:</strong> {rooms.find(r => r.id === currentTenant.roomId)?.building || 'Loading...'}</p>
              <p><strong>Floor:</strong> {rooms.find(r => r.id === currentTenant.roomId)?.floor || 'Loading...'}</p>
              <p><strong>Rent:</strong> ₹{rooms.find(r => r.id === currentTenant.roomId)?.rent || 'Loading...'}/month</p>
              <p><strong>Start Month:</strong> {currentTenant.startMonth}</p>
              <p><strong>Duration:</strong> {currentTenant.numberOfMonths} months</p>
              <p><strong>Roll Number:</strong> {currentTenant.rollNumber}</p>
              <p><strong>Status:</strong> <span className={`status ${rooms.find(r => r.id === currentTenant.roomId)?.status.toLowerCase() || 'available'}`}>
                {rooms.find(r => r.id === currentTenant.roomId)?.status || 'Available'}
              </span></p>
            </div>
            <p>Visit your dashboard to see more details about your booking.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="book-room">
      <h1>Book a Room</h1>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by room number, building, or floor..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="booking-container">
        <div className="rooms-grid">
          {filteredRooms.map(room => (
            <div
              key={room.id}
              className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
              onClick={() => handleRoomSelect(room)}
            >
              <div className="room-header">
                <h3>Room {room.roomNumber}</h3>
                <span className={`status ${room.status.toLowerCase()}`}>
                  {room.status}
                </span>
              </div>
              <div className="room-details">
                <p><strong>Building:</strong> {room.building}</p>
                <p><strong>Floor:</strong> {room.floor}</p>
                <p><strong>Capacity:</strong> {room.capacity}</p>
                <p><strong>Occupied:</strong> {room.occupied}</p>
                <p><strong>Rent:</strong> ₹{room.rent}/month</p>
              </div>
            </div>
          ))}
        </div>

        {selectedRoom && (
          <div className="booking-form">
            <h2>Booking Details</h2>
            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="rollNumber"
                  value={bookingDetails.rollNumber}
                  onChange={handleInputChange}
                  required
                  disabled={hasExistingBooking}
                />
              </div>
              <div className="form-group">
                <label>Start Month</label>
                <input
                  type="month"
                  name="startMonth"
                  value={bookingDetails.startMonth}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Number of Months</label>
                <input
                  type="number"
                  name="numberOfMonths"
                  value={bookingDetails.numberOfMonths}
                  onChange={handleInputChange}
                  min="1"
                  max="12"
                  required
                />
              </div>
              <div className="payment-summary">
                <h3>Payment Summary</h3>
                <p>Room Rent: ₹{selectedRoom.rent}/month</p>
                <p>Duration: {bookingDetails.numberOfMonths} month(s)</p>
                <p className="total">Total Amount: ₹{selectedRoom.rent * bookingDetails.numberOfMonths}</p>
              </div>
              <button type="submit" className="submit-btn">
                Confirm Booking
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookRoom;