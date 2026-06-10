export function formatBytes(bytes: number): string {
  if (bytes === 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const unitIndex = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / 1024 ** unitIndex;
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatPixels(pixels: number): string {
  return Intl.NumberFormat('en-US').format(pixels);
}

export function ensurePng(file: File): void {
  const isPng = file.type === 'image/png' || file.name.toLowerCase().endsWith('.png');
  if (!isPng) {
    throw new Error('Only PNG files are supported.');
  }
}
