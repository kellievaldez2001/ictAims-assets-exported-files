// Utility for consistent date formatting (YYYY-MM-DD)
export function formatDate(val) {
  if (!val) return '';
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    if (/^\d{4}-\d{2}-\d{2}T/.test(val)) return val.slice(0, 10);
    return val;
  }
  if (val instanceof Date && !isNaN(val)) return val.toISOString().slice(0, 10);
  return String(val);
}
