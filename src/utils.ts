import { ImageConfig } from './types';

interface PrintableArea {
  top: number;
  left: number;
  width: number;
  height: number;
}

export const isWithinPrintableArea = (
  imageConfig: ImageConfig,
  printableArea: PrintableArea
): boolean => {
  const halfWidth = imageConfig.size.width / 2;
  const halfHeight = imageConfig.size.height / 2;

  const imageLeft = imageConfig.position.x - halfWidth;
  const imageTop = imageConfig.position.y - halfHeight;
  const imageRight = imageLeft + imageConfig.size.width;
  const imageBottom = imageTop + imageConfig.size.height;

  const areaRight = printableArea.left + printableArea.width;
  const areaBottom = printableArea.top + printableArea.height;

  return (
    imageLeft >= printableArea.left &&
    imageTop >= printableArea.top &&
    imageRight <= areaRight &&
    imageBottom <= areaBottom
  );
};