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
    text: string;
    fontSize: number;
    color: string;
  }>>([]);

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
    setDesignTexts(prev => [...prev, { text, fontSize, color }]);
  }

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
        />
        <Right
          onImageUpload={handleImageUpload}
          onSizeChange={handleSizeChange}
          onRotationChange={handleRotationChange}
          onZoneChange={handleZoneChange}
          selectedZone={selectedZone}
          onTextAdd={handleTextAdd}
        />
      </div>
    </div>
  )
}

export default App
