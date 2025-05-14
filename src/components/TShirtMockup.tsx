import React from 'react';
import DesignCanvas from './DesignCanvas';
import { RefreshCw, ZoomIn } from 'lucide-react';

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
    <div className="w-3/5">
      <div className="bg-gray-50 rounded-lg p-4 h-[500px] md:h-[600px] flex flex-col">
        {/* Preview controls */}
        <div className="flex justify-between mb-4">
          <div className="flex space-x-2">
            <button className="bg-white border border-gray-200 p-2 rounded-md text-gray-600 hover:bg-gray-50">
              <ZoomIn />
            </button>
            <button className="bg-white border border-gray-200 p-2 rounded-md text-gray-600 hover:bg-gray-50">
              <RefreshCw />
            </button>
          </div>
          <div className="flex space-x-2">
            <button id="view-front" className="bg-white border border-gray-200 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm active">
              Front
            </button>
            <button id="view-back" className="bg-white border border-gray-200 px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm">
              Back
            </button>
          </div>
        </div>

        {/* Product preview */}
        <div className="flex-grow flex items-center justify-center relative bg-white rounded-lg border border-gray-200">
          {/* Konva stage container */}

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
      </div>
    </div>

  );
};

export default TShirtMockup;