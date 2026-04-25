import React, { useState, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import './Reports.css';

const Reports = () => {
  const [tenants, setTenants] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalRooms: 0,
    occupiedRooms: 0,
    availableRooms: 0,
    totalStudents: 0,
    maintenanceRequests: 0,
    pendingRequests: 0
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [roomsRes, tenantsRes, maintenanceRes] = await Promise.all([
        fetch('http://localhost:3001/rooms'),
        fetch('http://localhost:3001/tenants'),
        fetch('http://localhost:3001/maintenanceRequests')
      ]);

      if (!roomsRes.ok || !tenantsRes.ok || !maintenanceRes.ok) {
        throw new Error('Failed to fetch data');
      }

      const [roomsData, tenantsData, maintenanceData] = await Promise.all([
        roomsRes.json(),
        tenantsRes.json(),
        maintenanceRes.json()
      ]);

      setRooms(roomsData);
      setTenants(tenantsData);
      setMaintenanceRequests(maintenanceData);

      // Calculate statistics
      setStats({
        totalRooms: roomsData.length,
        occupiedRooms: roomsData.filter(room => room.status === 'Occupied').length,
        availableRooms: roomsData.filter(room => room.status === 'Available').length,
        totalStudents: tenantsData.length,
        maintenanceRequests: maintenanceData.length,
        pendingRequests: maintenanceData.filter(req => req.status === 'Pending').length
      });

      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to fetch data. Please try again later.');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const downloadTenantsPDF = () => {
    if (tenants.length === 0) {
      alert('No tenant data available to download');
      return;
    }

    // Initialize jsPDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Tenant Details Report', 14, 15);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);

    // Prepare data for the table
    const tableData = tenants.map(tenant => {
      // Find the room details for this tenant
      const tenantRoom = rooms.find(room => room.id === tenant.roomId);
      const roomNumber = tenantRoom ? `Room ${tenantRoom.roomNumber}` : 'N/A';
      
      return [
        tenant.name || 'N/A',
        roomNumber,
        tenant.email || 'N/A',
        tenant.status || 'N/A',
        tenant.checkInDate ? new Date(tenant.checkInDate).toLocaleDateString() : 'N/A'
      ];
    });

    // Add table using autoTable
    autoTable(doc, {
      head: [['Name', 'Room Number', 'Email', 'Status', 'Check-in Date']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    // Save the PDF
    doc.save('tenant_details_report.pdf');
  };

  if (loading) return <div className="loading">Loading reports...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="reports-container">
      <h1>Reports</h1>
      
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Rooms</h3>
          <p>{stats.totalRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Occupied Rooms</h3>
          <p>{stats.occupiedRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Available Rooms</h3>
          <p>{stats.availableRooms}</p>
        </div>
        <div className="stat-card">
          <h3>Total Students</h3>
          <p>{stats.totalStudents}</p>
        </div>
        <div className="stat-card">
          <h3>Maintenance Requests</h3>
          <p>{stats.maintenanceRequests}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Requests</h3>
          <p>{stats.pendingRequests}</p>
        </div>
      </div>

      <div className="report-actions">
        <button 
          className="download-btn"
          onClick={downloadTenantsPDF}
          disabled={tenants.length === 0}
        >
          {tenants.length === 0 ? 'No Data Available' : 'Download Tenant Details PDF'}
        </button>
      </div>

      <div className="reports-grid">
        <div className="report-card">
          <h3>Room Status</h3>
          <div className="room-status">
            {rooms.map(room => (
              <div key={room.id} className="room-item">
                <span className="room-number">Room {room.roomNumber}</span>
                <span className={`status ${room.status.toLowerCase()}`}>
                  {room.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="report-card">
          <h3>Maintenance Requests</h3>
          <div className="maintenance-list">
            {maintenanceRequests.map(request => (
              <div key={request.id} className="request-item">
                <div className="request-header">
                  <span className="room-number">Room {request.roomNumber}</span>
                  <span className={`status ${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </div>
                <p className="request-description">{request.description}</p>
                <div className="request-meta">
                  <span>Priority: {request.priority}</span>
                  <span>Date: {new Date(request.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 