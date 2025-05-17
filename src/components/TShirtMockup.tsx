import { useState, useImperativeHandle, forwardRef, useRef, useEffect } from 'react';
import DesignCanvas from './DesignCanvas';
import type { DesignCanvasRef } from './DesignCanvas';
import { RefreshCw, ZoomIn, ZoomOut, ChevronDown, RotateCcw, RotateCw, Upload } from 'lucide-react';

// Import t-shirt images
const tshirtImages = {
  front: {
    white: '/images/tshirt-front-white.png',
    black: '/images/tshirt-front-black.png',
  },
  back: {
    white: '/images/tshirt-back-white.png',
    black: '/images/tshirt-back-black.png',
  }
};

// Add shirt styles
const shirtStyles = [
  { id: 'tshirt', name: 'Classic T-Shirt', color: 'white' },
  { id: 'tshirt-black', name: 'Classic T-Shirt', color: 'black' },
  // Add more shirt styles as needed
];

interface PrintableAreaDimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface TShirtMockupProps {
  printableArea: PrintableAreaDimensions;
  showPrintableArea: boolean;
  images: Array<{
    id: string;
    url: string;
    size: number;
    rotation: number;
    x: number;
    y: number;
  }>;
  selectedImageId: string | null;
  onImageSelect: (id: string) => void;
  onImageUpdate: (id: string, updates: Partial<{ size: number; rotation: number; x: number; y: number }>) => void;
  designTexts: Array<{
    id: string;
    text: string;
    fontSize: number;
    color: string;
  }>;
  onTextSelect?: (id: string) => void;
  selectedTextId?: string | null;
  onTextUpdate?: (id: string, updates: Partial<{ x: number; y: number; fontSize: number; rotation: number }>) => void;
  onDeselect?: () => void;
  onTextDoubleClick?: (id: string) => void;
  onImageUpload?: (file: File) => void;
}

// Make sure the interface is exported
export interface TShirtMockupRef {
  setPosition: (x: number, y: number) => void;
  getImageDimensions: () => { width: number; height: number; scaleX: number; scaleY: number } | null;
  getPosition: () => { x: number; y: number } | null;
  getContainerWidth: () => number;
}

// Add this function at the top of the file
const calculateScaledDimensions = (containerWidth: number) => {
  const baseWidth = 500;
  const scale = containerWidth / baseWidth;

  return {
    scale,
    width: containerWidth,
    height: 500 * scale,
    printableArea: {
      top: 120 * scale,
      left: 150 * scale,
      width: 200 * scale,
      height: 220 * scale,
    }
  };
};

// Update to use forwardRef
const TShirtMockup = forwardRef<TShirtMockupRef, TShirtMockupProps>(({
  showPrintableArea,
  images,
  selectedImageId,
  onImageSelect,
  onImageUpdate,
  designTexts,
  onTextSelect,
  selectedTextId,
  onTextUpdate,
  onDeselect,
  onTextDoubleClick,
  onImageUpload,
}, ref) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [currentView, setCurrentView] = useState<'front' | 'back'>('front');
  const [currentColor, setCurrentColor] = useState<'white' | 'black'>('white');
  const [isShirtSelectorOpen, setIsShirtSelectorOpen] = useState(false);
  const canvasRef = useRef<DesignCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [areControlsWrapped, setAreControlsWrapped] = useState(false);

  const scaledDimensions = calculateScaledDimensions(containerWidth);

  // Function to update width
  const updateWidth = () => {
    if (containerRef.current) {
      // Force a reflow to ensure accurate measurements
      setTimeout(() => {
        if (containerRef.current) {
          setContainerWidth(containerRef.current.offsetWidth);
        }
      }, 0);
    }
  };

  useEffect(() => {
    // Get initial width after the component has fully rendered
    updateWidth();

    // Check if controls should be wrapped
    setAreControlsWrapped(containerWidth < 460);

    // Also listen for window resize events to handle initial sizing better
    window.addEventListener('resize', updateWidth);

    // Use ResizeObserver for more accurate tracking of the specific element
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          const newWidth = entry.contentRect.width;
          setContainerWidth(newWidth);
          setAreControlsWrapped(newWidth < 460);
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        window.removeEventListener('resize', updateWidth);
        resizeObserver.disconnect();
      };
    }

    return () => {
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    setPosition: (x: number, y: number) => {
      if (canvasRef.current) {
        canvasRef.current.setPosition(x, y);
      }
    },
    getImageDimensions: () => {
      if (canvasRef.current) {
        return canvasRef.current.getImageDimensions();
      }
      return null;
    },
    getPosition: () => {
      if (canvasRef.current) {
        return canvasRef.current.getPosition();
      }
      return null;
    },
    getContainerWidth: () => containerWidth
  }));

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5));
  };

  const handleColorChange = (color: 'white' | 'black') => {
    setCurrentColor(color);
    setIsShirtSelectorOpen(false);
  };

  const handleViewChange = (view: 'front' | 'back') => {
    setCurrentView(view);
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.currentTarget === e.target && onDeselect) {
      onDeselect();
    }
  };

  // Update the printable area calculation
  const calculatePrintableArea = (containerWidth: number) => {
    const { printableArea: scaledArea } = calculateScaledDimensions(containerWidth);
    return scaledArea;
  };

  // Add file input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0 && onImageUpload) {
      onImageUpload(files[0]);
    }
  };

  return (
    <div className="md:bg-gray-50 bg-none md:rounded-lg rounded-none md:p-4 p-0 h-auto flex flex-col">
      {/* Preview controls */}
      <div className={`flex mb-4 flex-wrap gap-3 md:px-0 px-2 ${areControlsWrapped ? 'justify-center' : 'justify-between'}`}>
        <div className="flex space-x-2">
          {/* Shirt selector dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsShirtSelectorOpen(!isShirtSelectorOpen)}
              className="bg-white border border-gray-200 px-3 p-2 rounded-md text-gray-700 hover:bg-gray-50 font-medium text-sm flex items-center gap-2"
            >
              <span className='leading-6'>Select Style</span>
              <ChevronDown className='w-4 h-4' />
            </button>

            {isShirtSelectorOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                {shirtStyles.map((style) => (
                  <button
                    key={`${style.id}-${style.color}`}
                    onClick={() => handleColorChange(style.color as 'white' | 'black')}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border ${style.color === 'white' ? 'bg-rose-50' : 'bg-green-700'
                        }`}
                    />
                    <span className='text-black'>{style.name}</span>
                    {currentColor === style.color && (
                      <span className="ml-auto text-indigo-600">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Existing zoom controls */}
          <button onClick={handleZoomIn} className="bg-white border border-gray-200 p-2 rounded-md text-gray-600 hover:bg-gray-50">
            <ZoomIn className='w-4 h-4' />
          </button>
          <button onClick={handleZoomOut} className="bg-white border border-gray-200 p-2 rounded-md text-gray-600 hover:bg-gray-50">
            <ZoomOut className='w-4 h-4' />
          </button>
          <button onClick={() => setZoomLevel(1)} className="bg-white border border-gray-200 p-2 rounded-md text-gray-600 hover:bg-gray-50">
            <RefreshCw className='w-4 h-4' />
          </button>
        </div>

        {/* Add front/back view toggle buttons */}
        <div className="flex space-x-2">
          <button
            onClick={() => handleViewChange('front')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${currentView === 'front'
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span>Front</span>
          </button>
          <button
            onClick={() => handleViewChange('back')}
            className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${currentView === 'back'
              ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
              }`}
          >
            <RotateCw className="w-4 h-4" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Product preview */}
      <div
        className="flex-grow flex items-center justify-center relative bg-white md:rounded-lg rounded-none border border-gray-200 overflow-hidden"
        onClick={handleBackgroundClick}
        style={{
          height: scaledDimensions.height,
          maxHeight: '600px'
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-200"
          style={{
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'center center',
            maxWidth: scaledDimensions.width,
          }}
          ref={containerRef}
        >
          {/* T-shirt image */}
          <img
            src={tshirtImages[currentView][currentColor]}
            alt={`T-shirt ${currentView} view`}
            className="absolute inset-0 w-full h-full object-contain"
            style={{
              filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))'
            }}
          />

          {/* Upload button in the middle of printable area when no images */}
          {images.length === 0 && (
            <div
              className="absolute md:hidden flex flex-col items-center justify-center cursor-pointer"
              style={{
                top: `${calculatePrintableArea(containerWidth).top + calculatePrintableArea(containerWidth).height / 2 - 30}px`,
                left: `${calculatePrintableArea(containerWidth).left + calculatePrintableArea(containerWidth).width / 2 - 30}px`,
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(219, 234, 254, 0.3)',
                borderRadius: '8px',
                zIndex: 10
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-5 h-5 text-indigo-500 mb-1" />
              <p className="text-xs font-medium text-indigo-600">Upload</p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </div>
          )}

          <DesignCanvas
            ref={canvasRef}
            containerWidth={scaledDimensions.width}
            images={images}
            printableArea={calculatePrintableArea(containerWidth)}
            selectedImageId={selectedImageId}
            onImageSelect={onImageSelect}
            onImageUpdate={onImageUpdate}
            texts={designTexts}
            onTextSelect={onTextSelect}
            selectedTextId={selectedTextId}
            onTextUpdate={onTextUpdate}
            onTextDoubleClick={onTextDoubleClick}
          />

          {showPrintableArea && (
            <div
              className="absolute border-2 border-dashed border-blue-400 bg-blue-50 bg-opacity-10 pointer-events-none"
              style={{
                top: `${calculatePrintableArea(containerWidth).top}px`,
                left: `${calculatePrintableArea(containerWidth).left}px`,
                width: `${calculatePrintableArea(containerWidth).width}px`,
                height: `${calculatePrintableArea(containerWidth).height}px`,
              }}
            ></div>
          )}
        </div>
      </div>
    </div>
  );
});

export default TShirtMockup;