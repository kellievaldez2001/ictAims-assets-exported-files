// qr.js - Utility to generate QR code as data URL using 'qrcode' npm package
// Usage: import generateQRCode from './qr';
import QRCode from 'qrcode';

export default async function generateQRCode(text) {
  try {
    return await QRCode.toDataURL(text, { width: 200, margin: 1 });
  } catch (err) {
    console.error('QR code generation failed:', err);
    return '';
  }
}
