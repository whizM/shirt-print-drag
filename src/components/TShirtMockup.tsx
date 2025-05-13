import React from 'react';
import DesignCanvas from './DesignCanvas';

interface PrintableAreaDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TShirtMockupProps {
  printableArea: PrintableAreaDimensions;
  showPrintableArea: boolean;
  imageUrl?: string;
}

const TShirtMockup: React.FC<TShirtMockupProps> = ({ printableArea, showPrintableArea, imageUrl }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* T-shirt silhouette */}
      <div className="relative w-[500px] h-[500px]">
        <svg
          width="500"
          height="500"
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute"
        >
          <path
            d="M125 80C125 80 150 60 250 60C350 60 375 80 375 80L400 110C400 110 410 115 415 110C420 105 450 90 450 90L430 180L390 160V400C390 400 380 420 250 420C120 420 110 400 110 400V160L70 180L50 90C50 90 80 105 85 110C90 115 100 110 100 110L125 80Z"
            fill="white"
            stroke="#CBD5E1"
            strokeWidth="2"
          />
          {/* Collar */}
          <path
            d="M220 80C220 80 235 95 250 95C265 95 280 80 280 80"
            stroke="#CBD5E1"
            strokeWidth="2"
            fill="none"
          />
        </svg>

        {/* Design Canvas */}
        <div className="absolute inset-0">
          {imageUrl && (
            <DesignCanvas
              imageUrl={imageUrl}
              printableArea={printableArea}
            />
          )}
        </div>

        {/* Printable area visualization */}
        {showPrintableArea && (
          <div
            className="absolute border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-10 pointer-events-none"
            style={{
              top: `${printableArea.top}px`,
              left: `${printableArea.left}px`,
              width: `${printableArea.width}px`,
              height: `${printableArea.height}px`,
            }}
          ></div>
        )}
      </div>
    </div>
  );
};

export default TShirtMockup;