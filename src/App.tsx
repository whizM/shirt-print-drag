import { useState } from 'react'
import TShirtMockup from './components/TShirtMockup'
import './App.css'
import Header from './components/Header'
import Right from './components/Right'

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
    <div className="min-h-screen bg-white">
      <Header />
      <div className="container mx-auto py-6 px-4 md:px-6 flex flex-col md:flex-row gap-8 w-screen justify-center">
        <TShirtMockup
          printableArea={printableArea}
          showPrintableArea={true}
          imageUrl={imageUrl}
        />
        <Right onImageUpload={handleImageUpload} />
      </div>
    </div>
  )
}

export default App
