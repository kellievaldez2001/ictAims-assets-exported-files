import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import isulogo from '../assets/isulogo.png';

// Helper to format date as MM-DD-YYYY
function formatDisplayDate(dateValue) {
  if (!dateValue) return '-';
  let dateObj = null;
  if (dateValue instanceof Date) {
    dateObj = dateValue;
  } else if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    if (!isNaN(parsed.getTime())) {
      dateObj = parsed;
    } else {
      return dateValue;
    }
  } else {
    return '-';
  }
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const dd = String(dateObj.getDate()).padStart(2, '0');
  const yyyy = dateObj.getFullYear();
  return `${mm}-${dd}-${yyyy}`;
}

export function generateAcknowledgmentReceipt(assets, options = {}) {
  // Use portrait A4 (bondpaper size)
  const doc = new jsPDF('p', 'mm', 'a4');

  // Fetch Admin info from custodians table (synchronously via IPC)
  let adminName = '[NAME OF THE SUPPLY OFFICER/ADMIN]';
  let adminPosition = '[Position/Designation]';
  if (window && window.electron && window.electron.ipcRenderer) {
    try {
      const admins = window.electron.ipcRenderer.sendSync('get-admin-custodian');
      if (admins && admins.length > 0) {
        adminName = admins[0].name || adminName;
        adminPosition = admins[0].position_designation || adminPosition;
      }
    } catch (e) {
      // fallback to default
    }
  }

  // Logo placement (left, closer to header)
  const logoX = 20;
  const logoY = 12; // move logo higher
  const logoWidth = 20; // slightly smaller
  const logoHeight = 16;

  // Add logo left-aligned
  doc.addImage(isulogo, 'PNG', logoX, logoY, logoWidth, logoHeight);

  // Header text centered, placed closer to logo
  const pageWidth = doc.internal.pageSize.getWidth();
  let textY = logoY + 2;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text('Republic of the Philippines', pageWidth / 2, textY, { align: 'center' });

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  doc.text('ISABELA STATE UNIVERSITY', pageWidth / 2, textY + 8, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  doc.text('Roxas, Isabela', pageWidth / 2, textY + 16, { align: 'center' });

  // Subheader (gray, centered, smaller)
  doc.setTextColor(150);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('SUPPLY AND PROPERTY OFFICE', pageWidth / 2, logoY+logoHeight+10, { align: 'center' });
  doc.text('PROPERTY ACKNOWLEDGEMENT RECEIPT', pageWidth / 2, logoY+logoHeight+18, { align: 'center' });
  doc.setTextColor(0); // reset for other text

  // Table columns
  const columns = [
    { header: 'NO.', dataKey: 'no' },
    { header: 'ASSET NAME', dataKey: 'name' },
  { header: 'CATEGORY', dataKey: 'category' },
  { header: 'SUBCAT.', dataKey: 'subcategory' },
    { header: 'SERIAL NUMBER', dataKey: 'serial_number' },
    { header: 'DATE ACQUIRED', dataKey: 'acquisition_date' },
    { header: 'LOC.', dataKey: 'location' },
    { header: 'DEPT.', dataKey: 'department' },
    { header: 'UNIT COST', dataKey: 'purchase_cost' },
    { header: 'TOTAL AMOUNT', dataKey: 'total_amount' }
  ];
  // Table data (multiple assets)
  const data = Array.isArray(assets)
    ? assets.map((asset, idx) => ({
        no: idx + 1,
        name: asset.name || asset.asset_name || '',
  category: asset.category || '',
  subcategory: asset.subcategory || '',
        serial_number: asset.serial_number || '',
        acquisition_date: formatDisplayDate(asset.acquisition_date),
        location: asset.location || '',
        department: asset.department || '',
        purchase_cost: asset.purchase_cost || '',
        total_amount: asset.purchase_cost || ''
      }))
    : [{
        no: '1',
        name: assets.name || assets.asset_name || '',
  category: assets.category || '',
  subcategory: assets.subcategory || '',
        serial_number: assets.serial_number || '',
        acquisition_date: formatDisplayDate(assets.acquisition_date),
        location: assets.location || '',
        department: assets.department || '',
        purchase_cost: assets.purchase_cost || '',
        total_amount: assets.purchase_cost || ''
      }];

  autoTable(doc, {
    startY: logoY+logoHeight+24,
    head: [columns.map(col => col.header)],
    body: data.map(row => columns.map(col => row[col.dataKey])),
    styles: { fontSize: 9, halign: 'center', valign: 'middle' },
    headStyles: { fillColor: [255,255,255], textColor: [0,0,0], fontStyle: 'bold' },
    margin: { left: 8, right: 8 },
    tableWidth: 'auto',
    theme: 'grid',
  });

  // Signature section
  let y = doc.lastAutoTable.finalY + 8;
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  // Calculate x position for border between 'SERIAL NUMBER' and 'DATE ACQUIRED' columns
  const colWidths = [18, 28, 18, 18, 28, 20, 14, 14, 18, 22]; // estimated widths for each column
  const serialNumberColIndex = 4; // 0-based index for 'SERIAL NUMBER'
  let receivedFromX = 8;
  for (let i = 0; i < serialNumberColIndex + 1; i++) {
    receivedFromX += colWidths[i];
  }
  const dateStr = formatDisplayDate(new Date());
  // Use first asset for custodian info if array
  const firstAsset = Array.isArray(assets) ? assets[0] : assets;
  // Left side (RECEIVED BY)
  doc.text('Received by:', 8, y);
  doc.text(`${firstAsset.custodian_name || firstAsset.custodian || options.custodian || 'Name of the Custodian/Incharge'}`, 8, y + 14);
  doc.text(`${firstAsset.position_designation || options.position_designation || '[Position/Designation]'}`, 8, y + 21);
  doc.text(`Date: ${dateStr}`, 8, y + 35);

  // Right side (RECEIVED FROM, align sa red line)
  doc.text('Received from:', receivedFromX + 2, y);
  doc.text(`${adminName}`, receivedFromX + 2, y + 14);
  doc.text(`${adminPosition}`, receivedFromX + 2, y + 21);
  doc.text(`Date: ${dateStr}`, receivedFromX + 2, y + 35);

  // Return the PDF as a blob URL for viewing
  return doc.output('bloburl');
}
