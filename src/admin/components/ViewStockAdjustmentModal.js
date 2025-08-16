import React from 'react';

function ViewStockAdjustmentModal({ open, onClose, adjustment }) {
  if (!open || !adjustment) return null;

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 24,
        maxWidth: 600,
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 20,
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: 16
        }}>
          <h2 style={{ margin: 0, color: '#1976d2' }}>Stock Adjustment Details</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 24,
              cursor: 'pointer',
              color: '#666',
              padding: 4
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Asset Information Section */}
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8,
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16 }}>Asset Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <strong>Asset Name:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_name_full || adjustment.asset_name || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Serial Number:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_serial_number || adjustment.serial_number || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Category:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_category || adjustment.category || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Subcategory:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_subcategory || adjustment.subcategory || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Department:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_department || adjustment.department || adjustment.department_name || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Location:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_location || adjustment.location || adjustment.asset_location_name || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Custodian:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.asset_custodian || adjustment.custodian_name || adjustment.custodian || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Adjustment Information Section */}
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8,
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16 }}>Adjustment Information</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <strong>Adjustment Type:</strong>
                <div style={{ 
                  marginTop: 4, 
                  color: '#666',
                  padding: '4px 8px',
                  backgroundColor: getAdjustmentTypeColor(adjustment.adjustment_type),
                  borderRadius: 4,
                  display: 'inline-block',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}>
                  {adjustment.adjustment_type || 'N/A'}
                </div>
              </div>
              <div>
                <strong>Adjustment Date:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.adjustment_date ? 
                    (typeof adjustment.adjustment_date === 'string' ? adjustment.adjustment_date.slice(0, 10) : new Date(adjustment.adjustment_date).toLocaleDateString()) : 
                    (adjustment.created_at ? (typeof adjustment.created_at === 'string' ? adjustment.created_at.slice(0, 10) : new Date(adjustment.created_at).toLocaleDateString()) : 'N/A')
                  }
                </div>
              </div>
              <div>
                <strong>Created By:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.created_by || 'N/A'}
                </div>
              </div>
              <div>
                <strong>ID:</strong>
                <div style={{ marginTop: 4, color: '#666' }}>
                  {adjustment.id || 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Reason and Remarks Section */}
          <div style={{ 
            backgroundColor: '#f5f5f5', 
            padding: 16, 
            borderRadius: 8,
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#333', fontSize: 16 }}>Details</h3>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <strong>Reason:</strong>
                <div style={{ 
                  marginTop: 4, 
                  color: '#666',
                  padding: 12,
                  backgroundColor: 'white',
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  minHeight: 40
                }}>
                  {adjustment.reason || 'No reason provided'}
                </div>
              </div>
              <div>
                <strong>Remarks:</strong>
                <div style={{ 
                  marginTop: 4, 
                  color: '#666',
                  padding: 12,
                  backgroundColor: 'white',
                  borderRadius: 4,
                  border: '1px solid #e0e0e0',
                  minHeight: 40
                }}>
                  {adjustment.remarks || 'No remarks provided'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: 24, 
          paddingTop: 16, 
          borderTop: '1px solid #e0e0e0',
          textAlign: 'right'
        }}>
          <button
            onClick={onClose}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 14
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper function to get color for adjustment type
function getAdjustmentTypeColor(type) {
  if (!type) return '#f5f5f5';
  
  const typeLower = type.toLowerCase();
  switch (typeLower) {
    case 'lost':
      return '#ffebee';
    case 'damaged':
      return '#fff3e0';
    case 'found':
      return '#e8f5e8';
    case 'transferred':
      return '#e3f2fd';
    case 'returned':
      return '#f3e5f5';
    default:
      return '#f5f5f5';
  }
}

export default ViewStockAdjustmentModal; 