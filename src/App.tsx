import { useState } from 'react'
import TShirtMockup from './components/TShirtMockup'
import ImageUploader from './components/ImageUploader'
import './App.css'

function App() {
  const [imageUrl, setImageUrl] = useState<string>('')

  const handleImageUpload = (file: File) => {
    const url = URL.createObjectURL(file)
    setImageUrl(url)
  }

  const printableArea = {
    top: 120,
    left: 150,
    width: 200,
    height: 220,
  }

  return (
    <div className="relative w-screen h-screen">
      <TShirtMockup
        printableArea={printableArea}
        showPrintableArea={true}
        imageUrl={imageUrl}
      />
      <div className="absolute top-4 right-4 w-48">
        <ImageUploader onImageUpload={handleImageUpload} />
      </div>
    </div>
  )
}

export default App
