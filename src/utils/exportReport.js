import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from '../assets/ict-aims-logo.png';

export function exportAssetsToPDF({ assets, filters, columns, systemName = 'ICT-AIMS' }) {
  const doc = new jsPDF({ orientation: 'landscape' });
  
  // Logo
  const pageWidth = doc.internal.pageSize.getWidth();
  const logoWidth = 32;
  const logoHeight = 32;
  doc.addImage(logo, 'PNG', 10, 10, logoWidth, logoHeight);
  
  // System name
  doc.setFontSize(18);
  doc.text(systemName + ' - Asset Report', pageWidth / 2, 20, { align: 'center' });
  
  // Date generated
  doc.setFontSize(10);
  const dateStr = new Date().toLocaleString();
  doc.text('Date generated: ' + dateStr, pageWidth - 10, 16, { align: 'right' });
  
  // Filters applied
  let filterText = Object.entries(filters)
    .filter(([k, v]) => v && v !== '')
    .map(([k, v]) => {
      // Convert filter names to readable format
      const filterNames = {
        from: 'From Date',
        to: 'To Date',
        department: 'Department',
        custodian: 'Custodian',
        category: 'Category',
        status: 'Status'
      };
      return `${filterNames[k] || k}: ${v}`;
    })
    .join(', ');
    
  if (filterText) {
    doc.setFontSize(11);
    doc.text('Filtered by: ' + filterText, 10, 26);
  }
  
  // Table
  const tableData = assets.map(asset => {
    return columns.map(col => {
      const value = asset[col.key];
      if (col.key === 'acquisition_date' && value) {
        return new Date(value).toLocaleDateString();
      }
      return value || '-';
    });
  });
  
  autoTable(doc, {
    head: [columns.map(col => col.label)],
    body: tableData,
    startY: 40,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] },
    margin: { left: 10, right: 10 },
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 15 }, // ID
      1: { cellWidth: 40 }, // Name
      2: { cellWidth: 25 }, // Department
      3: { cellWidth: 25 }, // Category
      4: { cellWidth: 25 }, // Sub-Category
      5: { cellWidth: 30 }, // Custodian
      6: { cellWidth: 20 }, // Acquired
      7: { cellWidth: 20 }, // Status
    }
  });
  
  // Download directly (works in Electron/desktop and browser)
  doc.save('ICT-AIMS-Asset-Report.pdf');
}
