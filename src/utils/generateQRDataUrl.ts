import React from 'react';
import ReactDOM from 'react-dom/client';
import { QRCodeSVG } from 'qrcode.react';

export const generateQRDataUrl = (value: string, size = 200): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tempDiv = document.createElement('div');
    document.body.appendChild(tempDiv);

    const root = ReactDOM.createRoot(tempDiv);
    root.render(
      React.createElement(QRCodeSVG, {
        value,
        size,
        level: 'H',
        includeMargin: false,
      })
    );

    setTimeout(() => {
      const svg = tempDiv.querySelector('svg');
      if (!svg) {
        root.unmount();
        document.body.removeChild(tempDiv);
        reject(new Error('Failed to generate QR code'));
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        root.unmount();
        document.body.removeChild(tempDiv);
        reject(new Error('Failed to get canvas context'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);
        ctx.drawImage(img, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/png');
        root.unmount();
        document.body.removeChild(tempDiv);
        resolve(dataUrl);
      };
      img.onerror = () => {
        root.unmount();
        document.body.removeChild(tempDiv);
        reject(new Error('Failed to load QR image'));
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }, 100);
  });
};
