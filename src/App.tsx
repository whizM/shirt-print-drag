import { useState, useRef } from 'react'
import TShirtMockup from './components/TShirtMockup'
import type { TShirtMockupRef } from './components/TShirtMockup'
import './App.css'
import Header from './components/Header'
import Right from './components/Right'

const PRINTABLE_AREAS = {
  front: {
    top: 120,
    left: 150,
    width: 200,
    height: 220,
  }
};

function App() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [designSize, setDesignSize] = useState(100)
  const [designRotation, setDesignRotation] = useState(0)
  const [designTexts, setDesignTexts] = useState<Array<{
    id: string;
    text: string;
    fontSize: number;
    color: string;
  }>>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isImageSelected, setIsImageSelected] = useState(false);
  const [isFullFront, setIsFullFront] = useState(false);

  // Add the canvasRef
  const canvasRef = useRef<TShirtMockupRef>(null);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
    setIsImageSelected(true)
    setSelectedTextId(null)
  }

  const handleSizeChange = (size: number) => {
    setDesignSize(size)
  }

  const handleRotationChange = (rotation: number) => {
    setDesignRotation(rotation)
  }

  const handleTextAdd = (text: string, fontSize: number, color: string) => {
    setDesignTexts(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      text,
      fontSize,
      color
    }]);
  }

  const handleTextDelete = (id: string) => {
    setDesignTexts(prev => prev.filter(text => text.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  const handleTextSelect = (id: string) => {
    setSelectedTextId(id);
  };

  const handleTextUpdate = (id: string, text: string, fontSize: number, color: string) => {
    setDesignTexts(prev => prev.map(item =>
      item.id === id ? { ...item, text, fontSize, color } : item
    ));
    setSelectedTextId(null); // Deselect after update
  };

  const selectedText = selectedTextId
    ? designTexts.find(text => text.id === selectedTextId) || null
    : null;

  const handleAlignmentChange = (alignment: { horizontal?: 'left' | 'center' | 'right', vertical?: 'top' | 'middle' | 'bottom' }) => {
    if (!imageUrl) return;

    // Calculate new position based on alignment
    const printableArea = PRINTABLE_AREAS.front;

    if (canvasRef.current) {
      // Get current image dimensions and position from the canvas
      const imageDimensions = canvasRef.current.getImageDimensions?.();
      const currentPosition = canvasRef.current.getPosition?.();

      if (imageDimensions && currentPosition) {
        const { width, height, scaleX, scaleY } = imageDimensions;
        const { x: currentX, y: currentY } = currentPosition;
        const scaledWidth = width * scaleX;
        const scaledHeight = height * scaleY;

        let newX = currentX; // Default to current X position
        let newY = currentY; // Default to current Y position

        // Only update X if horizontal alignment is specified
        if (alignment.horizontal === 'left') {
          // Align left edge of image with left edge of printable area
          newX = printableArea.left + (scaledWidth / 2);
        } else if (alignment.horizontal === 'center') {
          // Center horizontally
          newX = printableArea.left + printableArea.width / 2;
        } else if (alignment.horizontal === 'right') {
          // Align right edge of image with right edge of printable area
          newX = printableArea.left + printableArea.width - (scaledWidth / 2);
        }

        // Only update Y if vertical alignment is specified
        if (alignment.vertical === 'top') {
          // Align top edge of image with top edge of printable area
          newY = printableArea.top + (scaledHeight / 2);
        } else if (alignment.vertical === 'middle') {
          // Center vertically
          newY = printableArea.top + printableArea.height / 2;
        } else if (alignment.vertical === 'bottom') {
          // Align bottom edge of image with bottom edge of printable area
          newY = printableArea.top + printableArea.height - (scaledHeight / 2);
        }

        // Update position in DesignCanvas
        canvasRef.current.setPosition(newX, newY);
      }
    }
  };

  const handlePositionPreset = (preset: 'center' | 'pocket' | 'full-front') => {
    if (!imageUrl) return;

    const printableArea = PRINTABLE_AREAS.front;

    if (preset === 'center') {
      // Center position with normal size
      setDesignSize(100);
      setIsFullFront(false);
      if (canvasRef.current) {
        canvasRef.current.setPosition(
          printableArea.left + printableArea.width / 2,
          printableArea.top + printableArea.height / 2
        );
      }
    } else if (preset === 'pocket') {
      // Pocket position (top left) with smaller size
      setDesignSize(40);
      setIsFullFront(false);
      if (canvasRef.current) {
        canvasRef.current.setPosition(
          printableArea.left + printableArea.width * 0.75,
          printableArea.top + printableArea.height * 0.25
        );
      }
    } else if (preset === 'full-front') {
      // Full front - set flag to true and let DesignCanvas handle the scaling
      setIsFullFront(true);
      if (canvasRef.current) {
        // Center the image in the printable area
        canvasRef.current.setPosition(
          printableArea.left + printableArea.width / 2,
          printableArea.top + printableArea.height / 2
        );
      }
    }
  };

  const handleImageDelete = () => {
    setImageUrl('');
    setIsImageSelected(false);
    setSelectedTextId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row gap-8 w-screen justify-center">
        <TShirtMockup
          ref={canvasRef}
          printableArea={PRINTABLE_AREAS.front}
          showPrintableArea={true}
          imageUrl={imageUrl}
          designSize={designSize}
          designRotation={designRotation}
          onRotationChange={handleRotationChange}
          texts={designTexts}
          onTextSelect={handleTextSelect}
          selectedTextId={selectedTextId}
          isImageSelected={isImageSelected}
          onImageSelect={() => setIsImageSelected(true)}
          onImageDeselect={() => setIsImageSelected(false)}
          isFullFront={isFullFront}
        />
        <Right
          onImageUpload={handleImageUpload}
          onSizeChange={handleSizeChange}
          onRotationChange={handleRotationChange}
          onTextAdd={handleTextAdd}
          onTextUpdate={handleTextUpdate}
          onTextDelete={handleTextDelete}
          selectedTextId={selectedTextId}
          selectedText={selectedText}
          onAlignmentChange={handleAlignmentChange}
          onPositionPreset={handlePositionPreset}
          isImageSelected={isImageSelected}
          setIsImageSelected={setIsImageSelected}
          onImageDelete={handleImageDelete}
        />
      </div>
    </div>
  )
}

export default App
