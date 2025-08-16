const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Generates an HTML file for a given asset object.
 * @param {Object} asset - The asset data object.
 */
function generateAssetHTML(asset) {
  if (!asset || !asset.id) {
    console.error('Asset object with a valid id is required.');
    return;
  }
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Asset Details - ${asset.name || asset.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; }
        h2 { color: #333; }
        .asset-details-list div { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      <h2>Asset Details</h2>
      <div class="asset-details-list">
        <div><strong>ID:</strong> ${asset.id || '-'}</div>
        <div><strong>Name:</strong> ${asset.name || asset.asset_name || '-'}</div>
        <div><strong>Category:</strong> ${asset.category || '-'}</div>
        <div><strong>Serial Number:</strong> ${asset.serial_number || '-'}</div>
        <div><strong>Department:</strong> ${asset.department || '-'}</div>
        <div><strong>Location:</strong> ${asset.location || '-'}</div>
        <div><strong>Custodian:</strong> ${asset.custodian_name || asset.custodian || asset.custodian_id || '-'}</div>
        <div><strong>Status:</strong> ${asset.status || '-'}</div>
        <div><strong>Acquisition Date:</strong> ${asset.acquisition_date || '-'}</div>
        <div><strong>Purchase Cost:</strong> ${asset.purchase_cost || '-'}</div>
        <div><strong>Useful Life:</strong> ${asset.useful_life || '-'}</div>
        <div><strong>Depreciation Method:</strong> ${asset.depreciation_method || asset.depreciation || 'Straight-Line'}</div>
        <div><strong>Supplier:</strong> ${asset.supplier || '-'}</div>
        <div><strong>Contact Person:</strong> ${asset.supplier_contact_person || '-'}</div>
        <div><strong>Contact Number:</strong> ${asset.supplier_contact_number || '-'}</div>
        <div><strong>Email:</strong> ${asset.supplier_email || '-'}</div>
        <div><strong>Address:</strong> ${asset.supplier_address || '-'}</div>
        <div><strong>Document/Receipt Number:</strong> ${asset.document_number || '-'}</div>
        <div><strong>Date Supplied:</strong> ${asset.date_supplied || '-'}</div>
        <div><strong>Warranty Details:</strong> ${asset.warranty_details || '-'}</div>
        <div><strong>Description:</strong> ${asset.description || '-'}</div>
        ${asset.created_at ? `<div><strong>Created At:</strong> ${asset.created_at}</div>` : ''}
        ${asset.updated_at ? `<div><strong>Updated At:</strong> ${asset.updated_at}</div>` : ''}
      </div>
    </body>
    </html>
  `;
  const dir = path.join(__dirname, '..', 'public', 'assets');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `asset-${asset.id}.html`);
  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`Generated HTML for asset ${asset.id}: ${filePath}`);
}

/**
 * Commits and pushes changes to GitHub.
 */
function deployToGithub() {
  exec("git add . && git commit -m 'update assets' && git push origin main", (err, stdout, stderr) => {
    if (err) {
      console.error("Deploy error:", stderr);
      return;
    }
    console.log("Deployed:", stdout);
  });
}

// Example usage:
// const asset = { id: '001', name: 'Sample Asset', ... };
// generateAssetHTML(asset);
// deployToGithub();

module.exports = { generateAssetHTML, deployToGithub };
