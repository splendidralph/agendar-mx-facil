// Convert SVG to clean data URL (no PNG conversion - done client-side)
export function svgToDataUrl(svgString: string): string {
  const encoder = new TextEncoder();
  const svgBytes = encoder.encode(svgString);
  const svgBase64 = btoa(String.fromCharCode(...svgBytes));
  return `data:image/svg+xml;base64,${svgBase64}`;
}

// Fetch profile image and convert to base64
export async function fetchProfileImageBase64(profileImageUrl: string | null): Promise<string | null> {
  if (!profileImageUrl) return null;
  
  try {
    const profileResponse = await fetch(profileImageUrl);
    if (profileResponse.ok) {
      const profileBuffer = await profileResponse.arrayBuffer();
      return btoa(String.fromCharCode(...new Uint8Array(profileBuffer)));
    }
  } catch (error) {
    console.log('Could not fetch profile image:', error);
  }
  
  return null;
}