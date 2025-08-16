import React from 'react';
import './comp_styles/AddCustodianModal.css';

const AddCustodianModal = ({ open, onClose, onSubmit, newCustodian, setNewCustodian }) => {
  if (!open) return null;
  return (
    <div className="add-custodian-modal-overlay">
      <div className="add-custodian-modal">
        <div className="add-custodian-modal-header">
          <span className="add-custodian-modal-title">Add New Custodian</span>
          <button className="add-custodian-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={e => {
          e.preventDefault();
          // Ensure date_registered is set to MySQL format (YYYY-MM-DD HH:MM:SS)
          const pad = n => n < 10 ? '0' + n : n;
          const now = new Date();
          const mysqlDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
          if (!newCustodian.date_registered) {
            setNewCustodian({ ...newCustodian, date_registered: mysqlDate });
            setTimeout(() => onSubmit(), 0); // submit after state update
          } else {
            onSubmit();
          }
        }}>
          <div className="add-custodian-form-group">
            <label>ID No.</label>
            <input type="text" value={newCustodian.id_no || ''} onChange={e => setNewCustodian({ ...newCustodian, id_no: e.target.value })} />
          </div>
          <div className="add-custodian-form-group">
            <label>Image</label>
            <input type="text" value={newCustodian.image || ''} onChange={e => setNewCustodian({ ...newCustodian, image: e.target.value })} placeholder="Image URL" />
          </div>
          <div className="add-custodian-form-group">
            <label>Name</label>
            <input type="text" required value={newCustodian.name || ''} onChange={e => setNewCustodian({ ...newCustodian, name: e.target.value })} />
          </div>
          <div className="add-custodian-form-group">
            <label>Position/Designation</label>
            <select value={newCustodian.position_designation || ''} onChange={e => setNewCustodian({ ...newCustodian, position_designation: e.target.value })}>
              <option value="">Select Position</option>
              <option value="Registrar">Registrar</option>
              <option value="Professor">Professor</option>
              <option value="Instructor">Instructor</option>
              <option value="Clerk">Clerk</option>
              <option value="Accountant">Accountant</option>
              <option value="IT Officer">IT Officer</option>
              <option value="Guidance Counselor">Guidance Counselor</option>
              <option value="Librarian">Librarian</option>
              <option value="Administrative Assistant">Administrative Assistant</option>
              <option value="Clinic Nurse">Clinic Nurse</option>
              <option value="Supply Officer">Supply Officer</option>
              <option value="Property Custodian">Property Custodian</option>
              <option value="Human Resources Officer">Human Resources Officer</option>
            </select>
          </div>
          <div className="add-custodian-form-group">
            <label>Account Type</label>
            <select value={newCustodian.account_type || 'Viewer'} onChange={e => setNewCustodian({ ...newCustodian, account_type: e.target.value })}>
              <option value="Viewer">Viewer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="add-custodian-form-group">
            <label>Email</label>
            <input type="email" value={newCustodian.email || ''} onChange={e => setNewCustodian({ ...newCustodian, email: e.target.value })} />
          </div>
          <div className="add-custodian-form-group">
            <label>Phone</label>
            <input type="text" value={newCustodian.phone || ''} onChange={e => setNewCustodian({ ...newCustodian, phone: e.target.value })} />
          </div>
          <div className="add-custodian-form-group">
            <label>User Group</label>
            <select value={newCustodian.user_group || ''} onChange={e => setNewCustodian({ ...newCustodian, user_group: e.target.value })}>
              <option value="">Select Group</option>
              <option value="Admin">Admin</option>
              <option value="Faculty">Faculty</option>
              <option value="Teaching Staff">Teaching Staff</option>
              <option value="Non-Teaching Staff">Non-Teaching Staff</option>
            </select>
          </div>
          <div className="add-custodian-form-group">
            <label>Department</label>
            <input type="text" value={newCustodian.department || ''} onChange={e => setNewCustodian({ ...newCustodian, department: e.target.value })} />
          </div>
          <div className="add-custodian-form-group">
            <label>Employment Status</label>
            <select value={newCustodian.employment_status || ''} onChange={e => setNewCustodian({ ...newCustodian, employment_status: e.target.value })}>
              <option value="">Select Employment Status</option>
              <option value="In service">In service</option>
              <option value="Retired">Retired</option>
              <option value="Resigned">Resigned</option>
              <option value="Deceased">Deceased</option>
            </select>
          </div>
          <div className="add-custodian-form-group">
            <label>System Status</label>
            <input type="text" value={newCustodian.system_status || ''} onChange={e => setNewCustodian({ ...newCustodian, system_status: e.target.value })} />
          </div>
          <div className="add-custodian-form-group">
            <label>Date Registered</label>
            <input type="text" value={newCustodian.date_registered || (() => {
              const pad = n => n < 10 ? '0' + n : n;
              const now = new Date();
              return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
            })()} readOnly />
          </div>
          <div className="add-custodian-modal-actions">
            <button type="button" className="add-custodian-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="add-custodian-btn-primary">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustodianModal;
