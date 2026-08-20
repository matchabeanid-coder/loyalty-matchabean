import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner({ onScanSuccess }) {
  useEffect(() => {
    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        onScanSuccess(decodedText);
      },
      (errorMessage) => {
        // ignore scan errors
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Scanner clear error", err));
    };
  }, [onScanSuccess]);

  return (
    <div className="w-full bg-[#1b2a20] p-4 rounded-2xl border border-[#2b3f31]">
      <div id="qr-reader" className="w-full overflow-hidden rounded-xl"></div>
    </div>
  );
}
