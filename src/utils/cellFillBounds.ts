export const CELL_FILL_INSET = {
  top: 1,
  left: 1,
  right: 1,
  bottom:0.3  ,
};

export function getCellFillBounds(rect: {
  x: number;
  y: number;
  width: number;
  height: number;
}, imageWidth: number, imageHeight: number) {
  const startX = Math.max(0, Math.floor(rect.x + CELL_FILL_INSET.left));
  const startY = Math.max(0, Math.floor(rect.y + CELL_FILL_INSET.top));
  const endX = Math.min(imageWidth, Math.ceil(rect.x + rect.width - CELL_FILL_INSET.right));
  const endY = Math.min(imageHeight, Math.ceil(rect.y + rect.height - CELL_FILL_INSET.bottom));

  return { startX, startY, endX, endY };
}
