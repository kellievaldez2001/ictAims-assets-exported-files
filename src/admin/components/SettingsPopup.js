import React, { useState } from 'react';
import './comp_styles/SettingsPopup.css';

// BackupRestore component for backup logic
function BackupRestore() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [restoreFile, setRestoreFile] = useState(null);
  const [message, setMessage] = useState('');

  React.useEffect(() => {
    if (window.electron && window.electron.ipcRenderer) {
      const handleBackupReply = (event, result) => {
        setMessage(result.success ? result.message || 'Backup successful!' : `Backup failed: ${result.message || result.error}`);
      };
      const handleRestoreReply = (event, result) => {
        setMessage(result.success ? result.message || 'Restore successful!' : `Restore failed: ${result.message || result.error}`);
      };
      window.electron.ipcRenderer.on('backup-response', handleBackupReply);
      window.electron.ipcRenderer.on('restore-response', handleRestoreReply);
      return () => {
        window.electron.ipcRenderer.removeListener('backup-response', handleBackupReply);
        window.electron.ipcRenderer.removeListener('restore-response', handleRestoreReply);
      };
    }
  }, []);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setMessage('');
  };

  const handleRestoreFileChange = (e) => {
    setRestoreFile(e.target.files[0]);
    setMessage('');
  };

  const handleBackup = () => {
    if (!selectedFile) {
      setMessage('Please select a .db or .sqlite file first.');
      return;
    }
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('backup-request');
      setMessage('Backup request sent.');
    } else {
      setMessage('Backup logic not implemented for this environment.');
    }
  };

  const handleRestore = () => {
    if (!restoreFile) {
      setMessage('Please select a .db or .sqlite file to restore.');
      return;
    }
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('restore-request', restoreFile.path);
      setMessage('Restore request sent.');
    } else {
      setMessage('Restore logic not implemented for this environment.');
    }
  };

  return (
    <div>
      <button className="settings-btn-outline" onClick={handleBackup}>Create Backup</button>
      <input type="file" accept=".db,.sqlite" className="settings-btn-outline" onChange={handleFileChange} />
      <button className="settings-btn-outline" onClick={handleRestore}>Restore Database</button>
      <input type="file" accept=".db,.sqlite" className="settings-btn-outline" onChange={handleRestoreFileChange} />
      {message && <div style={{ color: '#1976d2', fontSize: '0.95em', marginTop: 4 }}>{message}</div>}
    </div>
  );
}


// Helper to convert array of objects to CSV
function arrayToCSV(data) {
  if (!data || !data.length) return '';
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(',')];
  for (const row of data) {
    csvRows.push(headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','));
  }
  return csvRows.join('\n');
}

// Handler for Download Audit Log button
function handleDownloadAuditLog() {
  if (window.electron && window.electron.ipcRenderer) {
    window.electron.ipcRenderer.invoke('get-audit-log').then((rows) => {
      const csv = arrayToCSV(rows);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit_log.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

const SettingsPopup = ({ settingsOpen, settingsRef, settingsSection, setSettingsSection }) => {
  if (!settingsOpen) return null;
  return (
    <div className="settings-popup">
      <div className="settings-popup-arrow" />
      <div ref={settingsRef} className="settings-popup-box">
        <div className="settings-popup-title">Settings</div>
        {!settingsSection && <>
          <div className="settings-popup-menu-item" onClick={() => setSettingsSection('backup')}>
            <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M16 3v4M8 3v4"/></svg>
            Backup & Restore
          </div>
          <div className="settings-popup-menu-item" onClick={() => setSettingsSection('integration')}>
            <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><path d="M10 13v-2a2 2 0 0 1 2-2h8"/><path d="M14 7l6 6-6 6"/><rect x="3" y="3" width="6" height="6" rx="1"/></svg>
            Integration Settings
          </div>
          <div className="settings-popup-menu-item" onClick={() => setSettingsSection('datetime')}>
            <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 2v4M16 2v4"/></svg>
            Date & Time Format
          </div>
          <div className="settings-popup-menu-item" onClick={() => setSettingsSection('audit')}>
            <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 6h8M8 10h8M8 14h8"/></svg>
            Audit & Log
          </div>
          <div className="settings-popup-menu-item" onClick={() => setSettingsSection('about')}>
            <svg width="18" height="18" fill="none" stroke="#222" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            About & Support
          </div>
        </>}
        {settingsSection === 'backup' && <div className="settings-popup-section">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Backup & Restore</div>
          <BackupRestore />
          <button className="settings-btn-outline" onClick={() => setSettingsSection(null)}>Back</button>
        </div>}
        {settingsSection === 'integration' && <div className="settings-popup-section">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Integration Settings</div>
          <input placeholder="API Key" className="settings-btn-outline" />
          <button className="settings-btn-primary">Save API Key</button>
          <button className="settings-btn-outline" onClick={() => setSettingsSection(null)}>Back</button>
        </div>}
        {settingsSection === 'datetime' && <div className="settings-popup-section">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Date & Time Format</div>
          <select className="settings-btn-outline">
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
          <select className="settings-btn-outline">
            <option value="24h">24-hour</option>
            <option value="12h">12-hour (AM/PM)</option>
          </select>
          <button className="settings-btn-outline" onClick={() => setSettingsSection(null)}>Back</button>
        </div>}
        {settingsSection === 'audit' && <div className="settings-popup-section">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Audit & Log</div>
          <button className="settings-btn-outline" onClick={handleDownloadAuditLog}>Download Audit Log</button>
          <button className="settings-btn-outline" onClick={() => setSettingsSection(null)}>Back</button>
        </div>}
        {settingsSection === 'about' && <div className="settings-popup-section">
          <div style={{ fontWeight: 600, marginBottom: 8 }}>About & Support</div>
          <div style={{ color: '#bdbdbd', fontSize: '1rem', marginBottom: 8 }}>Version 1.0.0</div>
          <button className="settings-btn-text" onClick={() => alert('Contact: support@yourdomain.com')}>Contact Support</button>
          <button className="settings-btn-outline" onClick={() => setSettingsSection(null)}>Back</button>
        </div>}
      </div>
    </div>
  );
};

export default SettingsPopup;
