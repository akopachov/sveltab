export function getFileExtension(fileName: string) {
  return fileName.slice((Math.max(0, fileName.lastIndexOf('.')) || Infinity) + 1);
}
