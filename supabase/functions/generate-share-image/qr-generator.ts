// Generate QR Code using QR Server API (PNG format)
export async function generateQRCodeBase64(text: string, size: number = 200): Promise<string> {
  try {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&format=png&margin=0`;
    const response = await fetch(qrApiUrl);
    
    if (!response.ok) {
      throw new Error(`QR API failed: ${response.status}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('QR generation failed:', error);
    // Return a simple fallback data URL
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg width="${size}" height="${size}" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
        <rect width="25" height="25" fill="white"/>
        <g fill="black">
          <rect x="0" y="0" width="7" height="7"/><rect x="1" y="1" width="5" height="5" fill="white"/>
          <rect x="2" y="2" width="3" height="3"/><rect x="18" y="0" width="7" height="7"/>
          <rect x="19" y="1" width="5" height="5" fill="white"/><rect x="20" y="2" width="3" height="3"/>
          <rect x="0" y="18" width="7" height="7"/><rect x="1" y="19" width="5" height="5" fill="white"/>
          <rect x="2" y="20" width="3" height="3"/><rect x="10" y="10" width="5" height="5"/>
        </g>
      </svg>
    `);
  }
}