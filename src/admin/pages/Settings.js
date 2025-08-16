import React, { useState } from 'react';
import './pages_styles/settings.css';

function Settings() {
  const [backupMessage, setBackupMessage] = useState('');
  const [restoreMessage, setRestoreMessage] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [dateFormat, setDateFormat] = useState('YYYY-MM-DD');
  const [timeFormat, setTimeFormat] = useState('24h');
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Backup handler
  const handleBackup = async () => {
    try {
      const result = await window.electron.ipcRenderer.invoke('backup-database');
      setBackupMessage('Backup created successfully! Saved to Desktop.');
      setTimeout(() => setBackupMessage(''), 3000);
    } catch (err) {
      setBackupMessage('Backup failed!');
      setTimeout(() => setBackupMessage(''), 3000);
    }
  };

  // Restore handler
  const handleRestore = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await window.electron.ipcRenderer.invoke('restore-database', file.path);
      setRestoreMessage('Restore completed!');
      setTimeout(() => setRestoreMessage(''), 3000);
    } catch (err) {
      setRestoreMessage('Restore failed!');
      setTimeout(() => setRestoreMessage(''), 3000);
    }
  };

  // Integration settings handler
  const handleApiKeySave = async () => {
    await window.electron.ipcRenderer.invoke('save-api-key', apiKey);
    alert('API Key saved!');
  };

  // Date/time format handler
  const handleDateFormatChange = (e) => setDateFormat(e.target.value);
  const handleTimeFormatChange = (e) => setTimeFormat(e.target.value);

  // Audit log download
  const handleDownloadAuditLog = async () => {
    setLoadingAudit(true);
    try {
      const logs = await window.electron.ipcRenderer.invoke('get-audit-log');
      // Optionally trigger download as CSV
      const csv = logs.map(l => `${l.date},${l.action},${l.user},${l.item},${l.details}`).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'audit-log.csv';
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download audit log.');
    }
    setLoadingAudit(false);
  };

  return (
    <div className="settings-root" style={{ marginLeft: 0, marginRight: 0 }}>
      {/* Backup & Restore */}
      <div className="settings-section">
        <div className="settings-section-title">Backup & Restore</div>
        <button className="settings-btn-outline" onClick={handleBackup}>Create Backup</button>
        <input
          type="file"
          accept=".db,.sqlite"
          style={{ display: 'block', marginTop: 12 }}
          onChange={handleRestore}
        />
        <div style={{ marginTop: 8, color: '#bdbdbd', fontSize: '0.8rem' }}>
          Select a backup file to restore your database.
        </div>
        {backupMessage && <div className="settings-snackbar">{backupMessage}</div>}
        {restoreMessage && <div className="settings-snackbar">{restoreMessage}</div>}
      </div>

      {/* Integration Settings */}
      <div className="settings-section">
        <div className="settings-section-title">Integration Settings</div>
        <div className="settings-form-group">
          <label>API Key</label>
          <input value={apiKey} onChange={e => setApiKey(e.target.value)} />
        </div>
        <button className="settings-btn-primary" onClick={handleApiKeySave}>Save API Key</button>
        <div style={{ color: '#bdbdbd', fontSize: '0.8rem' }}>
          Integration settings for third-party services.
        </div>
      </div>

      {/* Date/Time Format */}
      <div className="settings-section">
        <div className="settings-section-title">Date & Time Format</div>
        <div className="settings-form-group">
          <label>Date Format</label>
          <select value={dateFormat} onChange={handleDateFormatChange}>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          </select>
        </div>
        <div className="settings-form-group">
          <label>Time Format</label>
          <select value={timeFormat} onChange={handleTimeFormatChange}>
            <option value="24h">24-hour</option>
            <option value="12h">12-hour (AM/PM)</option>
          </select>
        </div>
      </div>

      {/* Audit & Log */}
      <div className="settings-section">
        <div className="settings-section-title">Audit & Logs</div>
        <button className="settings-btn-outline" onClick={handleDownloadAuditLog} disabled={loadingAudit}>
          {loadingAudit ? 'Downloading...' : 'Download Audit Log'}
        </button>
        <div style={{ marginTop: 8, color: '#bdbdbd', fontSize: '0.8rem' }}>
          View or download activity logs/history.
        </div>
      </div>

      {/* About & Support */}
      <div className="settings-section">
        <div className="settings-section-title">About & Support</div>
        <div style={{ color: '#bdbdbd', fontSize: '1rem' }}>Version 1.0.0</div>
        <button className="settings-btn-text" onClick={() => alert('Contact: support@yourdomain.com')}>Contact Support</button>
      </div>
    </div>
  );
}

export default Settings;
