import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export default function AssetQR({ value, size = 220, ...props }) {
  return (
    <div style={{
      background:'#fff',
      padding:8,
      borderRadius:16,
      display:'flex',
      justifyContent:'center',
      alignItems:'center'
      }}>
      <QRCodeCanvas value={value} size={size} bgColor="#fff" fgColor="#23293a" includeMargin={false} {...props} />
    </div>
  );
}
