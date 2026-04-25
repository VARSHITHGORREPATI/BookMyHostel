import React, { useState, useEffect } from 'react';
import './ManageTenants.css';

const ManageTenants = () => {
  const [tenants, setTenants] = useState([]);
  const [selectedTenant, setSelectedTenant] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const response = await fetch('http://localhost:3001/tenants');
        if (!response.ok) {
          throw new Error('Failed to fetch tenants');
        }
        const data = await response.json();
        setTenants(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchTenants();
  }, []);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredTenants = tenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.roomId.toString().includes(searchTerm.toLowerCase()) ||
    tenant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = async (tenantId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update tenant status');
      }

      const updatedTenant = await response.json();
      setTenants(tenants.map(tenant =>
        tenant.id === tenantId ? updatedTenant : tenant
      ));
      
      if (selectedTenant && selectedTenant.id === tenantId) {
        setSelectedTenant(updatedTenant);
      }
    } catch (error) {
      console.error('Error updating tenant status:', error);
      alert('Failed to update tenant status. Please try again.');
    }
  };

  if (loading) {
    return <div className="manage-tenants">Loading...</div>;
  }

  if (error) {
    return <div className="manage-tenants">Error: {error}</div>;
  }

  return (
    <div className="manage-tenants">
      <h1>Manage Tenants</h1>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name, room number, or email..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      <div className="tenants-container">
        <div className="tenants-list">
          {filteredTenants.length > 0 ? (
            filteredTenants.map(tenant => (
              <div
                key={tenant.id}
                className={`tenant-card ${selectedTenant?.id === tenant.id ? 'selected' : ''}`}
                onClick={() => setSelectedTenant(tenant)}
              >
                <div className="tenant-info">
                  <h3>{tenant.name}</h3>
                  <p>Room: {tenant.roomId}</p>
                  <p>Email: {tenant.email}</p>
                  <span className={`status ${tenant.status}`}>{tenant.status}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              No tenants found matching your search criteria.
            </div>
          )}
        </div>

        {selectedTenant && (
          <div className="tenant-details">
            <h2>Tenant Details</h2>
            <div className="details-content">
              <div className="detail-group">
                <label>Name</label>
                <p>{selectedTenant.name}</p>
              </div>
              <div className="detail-group">
                <label>Room Number</label>
                <p>{selectedTenant.roomId}</p>
              </div>
              <div className="detail-group">
                <label>Email</label>
                <p>{selectedTenant.email}</p>
              </div>
              <div className="detail-group">
                <label>Check-in Date</label>
                <p>{new Date(selectedTenant.checkInDate).toLocaleDateString()}</p>
              </div>
              <div className="detail-group">
                <label>Status</label>
                <select
                  value={selectedTenant.status}
                  onChange={(e) => handleStatusChange(selectedTenant.id, e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTenants; 