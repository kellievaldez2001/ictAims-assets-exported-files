// Centralized asset utilities

// Calculate depreciation fields
export function calculateDepreciation({ purchase_cost, useful_life, acquisition_date }) {
  const cost = parseFloat(purchase_cost) || 0;
  const life = parseFloat(useful_life) || 0;
  if (!cost || !life) {
    return {
      annual_depreciation: null,
      accumulated_depreciation: null,
      book_value: null
    };
  }
  const annual_depreciation = +(cost / life).toFixed(2);
  let years_elapsed = 0;
  if (acquisition_date) {
    const acq = new Date(acquisition_date);
    const now = new Date();
    years_elapsed = now.getFullYear() - acq.getFullYear();
    if (
      now.getMonth() < acq.getMonth() ||
      (now.getMonth() === acq.getMonth() && now.getDate() < acq.getDate())
    ) {
      years_elapsed--;
    }
    years_elapsed = Math.max(0, Math.min(years_elapsed, life));
  }
  const accumulated_depreciation = +(annual_depreciation * years_elapsed).toFixed(2);
  const book_value = +(cost - accumulated_depreciation).toFixed(2);
  return {
    annual_depreciation,
    accumulated_depreciation,
    book_value: book_value < 0 ? 0 : book_value
  };
}

// Build asset object for saving (merges defaults, computed, and user fields)
import { formatDate } from './dateUtils';

export function buildAssetForSave(asset, extra = {}) {
  console.log('buildAssetForSave - Input asset:', asset);
  const dep = calculateDepreciation(asset);
  console.log('buildAssetForSave - Calculated depreciation:', dep);
  // Helper function to convert empty strings to null for numeric fields
  const convertNumericField = (value) => {
    if (value === '' || value === null || value === undefined) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  };
  // Always use string YYYY-MM-DD for date fields
  const acquisition_date = asset.acquisition_date ? formatDate(asset.acquisition_date) : '';
  const date_supplied = asset.date_supplied ? formatDate(asset.date_supplied) : '';
  const updated_at = asset.updated_at ? formatDate(asset.updated_at) : undefined;
  const result = {
    ...asset,
    asset_name: asset.name || asset.asset_name || '',
    document_number: asset.document_number || '',
    category: asset.category || '',
    subcategory: asset.subcategory || '',
    department: asset.department || '',
    location: asset.location || '',
    status: asset.status || 'Available',
    useful_life: convertNumericField(asset.useful_life),
    purchase_cost: convertNumericField(asset.purchase_cost),
    annual_depreciation: dep.annual_depreciation,
    accumulated_depreciation: dep.accumulated_depreciation,
    book_value: dep.book_value,
    acquisition_date,
    date_supplied,
    ...(updated_at ? { updated_at } : {}),
    ...extra
  };
  console.log('buildAssetForSave - Output result:', result);
  return result;
}
