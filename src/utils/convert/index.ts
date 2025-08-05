// src/utils/convertGoogleDriveUrl.ts
export function convertGoogleDriveUrlToImageSrc(sharedUrl: string): string | null {
  const match = sharedUrl.match(/\/file\/d\/([^/]+)\//);
  if (!match) return null;

  const fileId = match[1];
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}
