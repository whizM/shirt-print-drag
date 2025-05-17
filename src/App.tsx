import { useState, useRef, useEffect } from 'react'
import TShirtMockup from './components/TShirtMockup'
import type { TShirtMockupRef } from './components/TShirtMockup'
import './App.css'
import Header from './components/Header'
import Right from './components/Right'
import { ToastContainer } from 'react-toastify';

const getScaledPrintableArea = (containerWidth: number) => {
  const baseWidth = 500;
  const scale = containerWidth / baseWidth;

  return {
    front: {
      top: 120 * scale,
      left: 150 * scale,
      width: 200 * scale,
      height: 220 * scale,
    }
  };
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

  // Add a ref for the text input
  const textInputRef = useRef<HTMLInputElement>(null);

  // Add a handler for text double-click
  const handleTextDoubleClick = (id: string) => {
    setSelectedTextId(id);
    setSelectedImageId(null);

    // Set active tab to 'text' in the Right component
    if (rightComponentRef.current) {
      rightComponentRef.current.setActiveTab('text');
    }

    // Focus the text input with a longer delay for mobile
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();

        // On mobile, we may need to scroll to the input
        textInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Some mobile browsers require this additional step
        setTimeout(() => {
          if (textInputRef.current) {
            textInputRef.current.focus();
          }
        }, 300);
      }
    }, 100);
  };

  // Add a ref for the Right component
  const rightComponentRef = useRef<{ setActiveTab: (tab: string) => void }>(null);

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
      const containerWidth = canvasRef.current?.getContainerWidth() || 500;
      const printableArea = getScaledPrintableArea(containerWidth).front;

      // Calculate the ratio to fit within printable area
      const widthRatio = printableArea.width / img.width;
      const heightRatio = printableArea.height / img.height;
      const fitRatio = Math.min(widthRatio, heightRatio);
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
    // Get the current container width for proper scaling
    const containerWidth = canvasRef.current?.getContainerWidth() || 500;
    const printableArea = getScaledPrintableArea(containerWidth).front;

    const newText = {
      id: Date.now().toString() + Math.random(),
      text,
      fontSize,
      color,
      // Use the current container's scaled printable area for positioning
      x: printableArea.left + printableArea.width / 2,
      y: printableArea.top + printableArea.height / 2,
      rotation: 0
    };

    setDesignTexts(prev => [...prev, newText]);
    setSelectedTextId(newText.id);
    setSelectedImageId(null);
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

    const selectedImage = images.find(img => img.id === selectedImageId);
    if (!selectedImage) return;

    const containerWidth = canvasRef.current?.getContainerWidth() || 500;
    const printableArea = getScaledPrintableArea(containerWidth).front;
    const img = createImage();
    img.src = selectedImage.url;

    let newX = selectedImage.x;
    let newY = selectedImage.y;

    // Horizontal alignment with adjusted printable area
    if (alignment.horizontal === 'left') {
      newX = printableArea.left + (img.width * selectedImage.size / 100) / 2;
    } else if (alignment.horizontal === 'center') {
      newX = printableArea.left + printableArea.width / 2;
    } else if (alignment.horizontal === 'right') {
      newX = printableArea.left + printableArea.width - (img.width * selectedImage.size / 100) / 2;
    }

    // Vertical alignment remains the same
    if (alignment.vertical === 'top') {
      newY = printableArea.top + (img.height * selectedImage.size / 100) / 2;
    } else if (alignment.vertical === 'middle') {
      newY = printableArea.top + printableArea.height / 2;
    } else if (alignment.vertical === 'bottom') {
      newY = printableArea.top + printableArea.height - (img.height * selectedImage.size / 100) / 2;
    }

    handleImageUpdate(selectedImageId, { x: newX, y: newY });
  };

  const handlePositionPreset = (preset: 'center' | 'pocket' | 'full-front') => {
    if (!selectedImageId) return;

    const containerWidth = canvasRef.current?.getContainerWidth() || 500;
    const printableArea = getScaledPrintableArea(containerWidth).front;

    if (preset === 'center') {
      handleImageUpdate(selectedImageId, {
        x: printableArea.left + printableArea.width / 2,
        y: printableArea.top + printableArea.height / 2
      });
    } else if (preset === 'pocket') {
      const selectedImage = images.find(img => img.id === selectedImageId);
      if (!selectedImage) return;

      const img = createImage();
      img.src = selectedImage.url;

      // Calculate the ratio for pocket size (1/3 of original)
      const widthRatio = printableArea.width / img.width;
      const heightRatio = printableArea.height / img.height;
      const coverRatio = Math.min(widthRatio, heightRatio);
      const newSize = coverRatio * 100 / 3; // Make it 1/3 of the full size

      handleImageUpdate(selectedImageId, {
        x: printableArea.left + printableArea.width * 0.75,
        y: printableArea.top + printableArea.height * 0.25,
        size: newSize
      });
    } else if (preset === 'full-front') {
      const selectedImage = images.find(img => img.id === selectedImageId);
      if (!selectedImage) return;

      const img = createImage();
      img.src = selectedImage.url;

      // Calculate the ratio to cover the printable area
      const widthRatio = printableArea.width / img.width;
      const heightRatio = printableArea.height / img.height;
      const coverRatio = Math.min(widthRatio, heightRatio);
      const newSize = coverRatio * 100;

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
      <ToastContainer />
      <Header />
      <div className="lg:w-11/12 md:w-full mx-auto py-6 px-0 md:px-6 flex flex-col md:flex-row gap-8 w-screen justify-center">
        <div ref={canvasContainerRef} className="md:w-3/5 w-full">
          <TShirtMockup
            ref={canvasRef}
            printableArea={getScaledPrintableArea(500).front}
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
            onTextDoubleClick={handleTextDoubleClick}
            onImageUpload={handleImageUpload}
          />
        </div>
        <div ref={rightPanelRef} className="md:w-2/5 w-full">
          <Right
            ref={rightComponentRef}
            textInputRef={textInputRef}
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
