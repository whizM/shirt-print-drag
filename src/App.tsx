import { useState } from 'react'
import TShirtMockup from './components/TShirtMockup'
import './App.css'
import Header from './components/Header'
import Right from './components/Right'

const PRINTABLE_AREAS = {
  front: {
    top: 120,
    left: 150,
    width: 200,
    height: 220,
  },
  pocket: {
    top: 100,
    left: 280,
    width: 80,
    height: 80,
  },
  back: {
    top: 80,
    left: 150,
    width: 200,
    height: 200,
  }
};

function App() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [designSize, setDesignSize] = useState(100)
  const [designRotation, setDesignRotation] = useState(0)
  const [selectedZone, setSelectedZone] = useState<'front' | 'pocket' | 'back'>('front')
  const [designTexts, setDesignTexts] = useState<Array<{
    id: string;
    text: string;
    fontSize: number;
    color: string;
  }>>([]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const handleSizeChange = (size: number) => {
    setDesignSize(size)
  }

  const handleRotationChange = (rotation: number) => {
    setDesignRotation(rotation)
  }

  const handleZoneChange = (zone: 'front' | 'pocket' | 'back') => {
    setSelectedZone(zone)
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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row gap-8 w-screen justify-center">
        <TShirtMockup
          printableArea={PRINTABLE_AREAS[selectedZone]}
          showPrintableArea={true}
          imageUrl={imageUrl}
          designSize={designSize}
          designRotation={designRotation}
          onRotationChange={handleRotationChange}
          texts={designTexts}
          onTextSelect={handleTextSelect}
          selectedTextId={selectedTextId}
        />
        <Right
          onImageUpload={handleImageUpload}
          onSizeChange={handleSizeChange}
          onRotationChange={handleRotationChange}
          onZoneChange={handleZoneChange}
          selectedZone={selectedZone}
          onTextAdd={handleTextAdd}
          onTextUpdate={handleTextUpdate}
          onTextDelete={handleTextDelete}
          selectedTextId={selectedTextId}
          selectedText={selectedText}
        />
      </div>
    </div>
  )
}

export default App
