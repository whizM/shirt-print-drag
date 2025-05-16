import { useState, useRef, useEffect } from 'react'
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
  const [images, setImages] = useState<Array<{
    id: string;
    url: string;
    size: number;
    rotation: number;
    x: number;
    y: number;
  }>>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [designTexts, setDesignTexts] = useState<Array<{
    id: string;
    text: string;
    fontSize: number;
    color: string;
  }>>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const canvasRef = useRef<TShirtMockupRef>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Handle clicks outside of canvas and right panel to deselect elements
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Skip if clicking on the canvas or right panel
      if (
        (canvasContainerRef.current && canvasContainerRef.current.contains(event.target as Node)) ||
        (rightPanelRef.current && rightPanelRef.current.contains(event.target as Node))
      ) {
        return;
      }

      // Deselect all elements
      setSelectedImageId(null);
      setSelectedTextId(null);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const createImage = () => {
    return document.createElement('img');
  };

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    const img = createImage();

    img.onload = () => {
      // Calculate the ratio to fit within printable area
      const printableArea = PRINTABLE_AREAS.front;
      const widthRatio = printableArea.width / img.width;
      const heightRatio = printableArea.height / img.height;

      // Use the smaller ratio to ensure the image fits inside the printable area
      const fitRatio = Math.min(widthRatio, heightRatio);

      // If image is smaller than printable area, keep original size (100%)
      // If larger, scale it down to fit
      const initialSize = fitRatio < 1 ? fitRatio * 100 : 100;

      const newImage = {
        id: Date.now().toString() + Math.random(),
        url,
        size: initialSize,
        rotation: 0,
        x: printableArea.left + printableArea.width / 2,
        y: printableArea.top + printableArea.height / 2
      };

      setImages(prev => [...prev, newImage]);
      setSelectedImageId(newImage.id);
    };

    img.src = url;
  };

  const handleImageSelect = (id: string) => {
    setSelectedImageId(id);
    setSelectedTextId(null); // Deselect text when selecting an image
  };

  const handleImageUpdate = (id: string, updates: Partial<{ size: number; rotation: number; x: number; y: number }>) => {
    setImages(prev => prev.map(img =>
      img.id === id ? { ...img, ...updates } : img
    ));
  };

  const handleImageDelete = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    if (selectedImageId === id) {
      setSelectedImageId(null);
    }
  };

  const handleTextAdd = (text: string, fontSize: number, color: string) => {
    const newText = {
      id: Date.now().toString() + Math.random(),
      text,
      fontSize,
      color,
      x: PRINTABLE_AREAS.front.left + PRINTABLE_AREAS.front.width / 2,
      y: PRINTABLE_AREAS.front.top + PRINTABLE_AREAS.front.height / 2,
      rotation: 0
    };
    setDesignTexts(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setSelectedImageId(null); // Deselect image when adding text
  };

  const handleTextSelect = (id: string) => {
    setSelectedTextId(id);
    setSelectedImageId(null); // Deselect image when selecting text
  };

  const handleTextUpdate = (id: string, text: string, fontSize: number, color: string) => {
    setDesignTexts(prev => prev.map(item =>
      item.id === id ? { ...item, text, fontSize, color } : item
    ));
    // Don't deselect after update
  };

  const handleTextPositionUpdate = (id: string, updates: Partial<{ x: number; y: number; fontSize: number; rotation: number }>) => {
    setDesignTexts(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const handleTextDelete = (id: string) => {
    setDesignTexts(prev => prev.filter(item => item.id !== id));
    if (selectedTextId === id) {
      setSelectedTextId(null);
    }
  };

  // Get the selected text object
  const selectedText = designTexts.find(text => text.id === selectedTextId) || null;

  const handleAlignmentChange = (alignment: { horizontal?: 'left' | 'center' | 'right', vertical?: 'top' | 'middle' | 'bottom' }) => {
    if (!selectedImageId) return;

    // Find the selected image
    const selectedImage = images.find(img => img.id === selectedImageId);
    if (!selectedImage) return;

    // Calculate new position based on alignment
    const printableArea = PRINTABLE_AREAS.front;

    // Get current image dimensions
    const img = createImage();
    img.src = selectedImage.url;

    let newX = selectedImage.x;
    let newY = selectedImage.y;

    // Horizontal alignment
    if (alignment.horizontal === 'left') {
      newX = printableArea.left + (img.width * selectedImage.size / 100) / 2;
    } else if (alignment.horizontal === 'center') {
      newX = printableArea.left + printableArea.width / 2;
    } else if (alignment.horizontal === 'right') {
      newX = printableArea.left + printableArea.width - (img.width * selectedImage.size / 100) / 2;
    }

    // Vertical alignment
    if (alignment.vertical === 'top') {
      newY = printableArea.top + (img.height * selectedImage.size / 100) / 2;
    } else if (alignment.vertical === 'middle') {
      newY = printableArea.top + printableArea.height / 2;
    } else if (alignment.vertical === 'bottom') {
      newY = printableArea.top + printableArea.height - (img.height * selectedImage.size / 100) / 2;
    }

    // Update the image position
    handleImageUpdate(selectedImageId, { x: newX, y: newY });
  };

  const handlePositionPreset = (preset: 'center' | 'pocket' | 'full-front') => {
    if (!selectedImageId) return;

    const printableArea = PRINTABLE_AREAS.front;

    if (preset === 'center') {
      handleImageUpdate(selectedImageId, {
        x: printableArea.left + printableArea.width / 2,
        y: printableArea.top + printableArea.height / 2
      });
    } else if (preset === 'pocket') {
      // For full-front, we need to resize the image to cover the printable area
      const selectedImage = images.find(img => img.id === selectedImageId);
      if (!selectedImage) return;

      const img = createImage();
      img.src = selectedImage.url;

      // Calculate the ratio to cover the printable area
      const widthRatio = printableArea.width / img.width;
      const heightRatio = printableArea.height / img.height;
      const coverRatio = Math.min(widthRatio, heightRatio);

      // Convert to percentage for size
      const newSize = coverRatio * 100;
      handleImageUpdate(selectedImageId, {
        x: printableArea.left + printableArea.width * 0.75,
        y: printableArea.top + printableArea.height * 0.25,
        size: newSize / 3
      });
    } else if (preset === 'full-front') {
      // For full-front, we need to resize the image to cover the printable area
      const selectedImage = images.find(img => img.id === selectedImageId);
      if (!selectedImage) return;

      const img = createImage();
      img.src = selectedImage.url;

      // Calculate the ratio to cover the printable area
      const widthRatio = printableArea.width / img.width;
      const heightRatio = printableArea.height / img.height;
      const coverRatio = Math.min(widthRatio, heightRatio);

      // Convert to percentage for size
      const newSize = coverRatio * 100;

      // Update the image
      handleImageUpdate(selectedImageId, {
        x: printableArea.left + printableArea.width / 2,
        y: printableArea.top + printableArea.height / 2,
        size: newSize
      });
    }
  };

  const handleDeselect = () => {
    setSelectedImageId(null);
    setSelectedTextId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row gap-8 w-screen justify-center">
        <div ref={canvasContainerRef} className="md:w-3/5 w-full">
          <TShirtMockup
            ref={canvasRef}
            printableArea={PRINTABLE_AREAS.front}
            showPrintableArea={true}
            images={images}
            selectedImageId={selectedImageId}
            onImageSelect={handleImageSelect}
            onImageUpdate={handleImageUpdate}
            designTexts={designTexts}
            onTextSelect={handleTextSelect}
            selectedTextId={selectedTextId}
            onTextUpdate={handleTextPositionUpdate}
            onDeselect={handleDeselect}
          />
        </div>
        <div ref={rightPanelRef} className="md:w-2/5 w-full">
          <Right
            onImageUpload={handleImageUpload}
            onTextAdd={handleTextAdd}
            onTextUpdate={handleTextUpdate}
            onTextDelete={handleTextDelete}
            selectedTextId={selectedTextId}
            selectedText={selectedText}
            onAlignmentChange={handleAlignmentChange}
            onPositionPreset={handlePositionPreset}
            selectedImageId={selectedImageId}
            selectedImage={images.find(img => img.id === selectedImageId) || null}
            onImageUpdate={handleImageUpdate}
            onImageDelete={(id) => handleImageDelete(id)}
            setSelectedTextId={setSelectedTextId}
          />
        </div>
      </div>
    </div>
  )
}

export default App
