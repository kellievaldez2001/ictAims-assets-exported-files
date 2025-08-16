import React, { useState } from 'react';

function QuantityReceivedModal({ open, maxQuantity, onClose, onSubmit }) {
  const [qty, setQty] = useState(maxQuantity || 1);
  const handleSubmit = e => {
    e.preventDefault();
    if (qty < 1 || qty > maxQuantity) return;
    onSubmit(qty);
  };
  if (!open) return null;
  return (
    <div className="assets-modal-overlay">
      <div className="assets-modal">
        <div className="assets-modal-header">
          <span className="assets-modal-title">Enter Quantity Received</span>
          <button className="assets-modal-close" onClick={onClose}>&times;</button>
        </div>
        <form className="assets-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="assets-form-group">
            <label>Quantity Received (max: {maxQuantity})</label>
            <input type="number" min="1" max={maxQuantity} value={qty} onChange={e => setQty(Number(e.target.value))} required />
          </div>
          <div className="assets-modal-actions">
            <button type="button" className="assets-btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="assets-btn-primary">Next</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default QuantityReceivedModal;
