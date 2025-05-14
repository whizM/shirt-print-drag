import { useRef, useState } from "react";
import Notification from "./Notification";

interface RightProps {
    onImageUpload: (file: File) => void;
    onSizeChange?: (size: number) => void;
    onRotationChange?: (rotation: number) => void;
    onZoneChange: (zone: 'front' | 'pocket' | 'back') => void;
    selectedZone: 'front' | 'pocket' | 'back';
    onTextAdd?: (text: string, fontSize: number, color: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const Right: React.FC<RightProps> = ({ onImageUpload, onSizeChange, onRotationChange, onZoneChange, selectedZone, onTextAdd }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [size, setSize] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState('design');
    const [notification, setNotification] = useState<{
        message: string;
        type: 'error' | 'success' | 'warning';
    } | null>(null);
    const [text, setText] = useState('');
    const [textColor, setTextColor] = useState('#000000');
    const [fontSize, setFontSize] = useState(24);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const validateAndUploadFile = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            setNotification({
                message: 'File size exceeds 10MB limit',
                type: 'error'
            });
            return false;
        }

        if (!file.type.startsWith('image/')) {
            setNotification({
                message: 'Please upload an image file',
                type: 'error'
            });
            return false;
        }

        onImageUpload(file);
        return true;
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            validateAndUploadFile(files[0]);
        }
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(e.target.value);
        setSize(newSize);
        onSizeChange?.(newSize);
    };

    const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRotation = parseInt(e.target.value);
        setRotation(newRotation);
        onRotationChange?.(newRotation);
    };

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            validateAndUploadFile(imageFile);
        } else {
            setNotification({
                message: 'Please upload an image file',
                type: 'error'
            });
        }
    };

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };

    const handleZoneClick = (zone: 'front' | 'pocket' | 'back') => {
        onZoneChange(zone);
    };

    const handleTextAdd = () => {
        if (text.trim()) {
            console.log(text, fontSize, textColor);
            onTextAdd?.(text, fontSize, textColor);
            setText('');
        }
    };

    return (
        <div className="w-full md:w-1/2 lg:w-2/5">
            {/* Show notification if exists */}
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Tabs navigation */}
                <div className="flex border-b border-gray-200">
                    {['product', 'color', 'design', 'text', 'options'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => handleTabClick(tab)}
                            className={`py-3 px-4 font-medium flex-1 text-center capitalize
                                ${activeTab === tab
                                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                                    : 'text-gray-600 hover:text-gray-800'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab content container */}
                <div className="p-6">
                    {/* Design Tab Content */}
                    <div className={activeTab === 'design' ? '' : 'hidden'}>
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="text-lg font-medium text-gray-800">Design Zones</h3>
                                <div className="flex items-center">
                                    <i className="fa-solid fa-circle-question text-gray-400 mr-2"></i>
                                    <span className="text-sm text-indigo-600 cursor-pointer flex gap-1 items-center">
                                        <svg className="text-gray-500 w-4 h-4 svg-inline--fa fa-circle-question" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-question" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM169.8 165.3c7.9-22.3 29.1-37.3 52.8-37.3h58.3c34.9 0 63.1 28.3 63.1 63.1c0 22.6-12.1 43.5-31.7 54.8L280 264.4c-.2 13-10.9 23.6-24 23.6c-13.3 0-24-10.7-24-24V250.5c0-8.6 4.6-16.5 12.1-20.8l44.3-25.4c4.7-2.7 7.6-7.7 7.6-13.1c0-8.4-6.8-15.1-15.1-15.1H222.6c-3.4 0-6.4 2.1-7.5 5.3l-.4 1.2c-4.4 12.5-18.2 19-30.6 14.6s-19-18.2-14.6-30.6l.4-1.2zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"></path></svg>
                                        How it works
                                    </span>
                                </div>
                            </div>

                            {/* Design zones selector */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div
                                    id="zone-front"
                                    onClick={() => handleZoneClick('front')}
                                    className={`design-zone rounded-md p-2 cursor-pointer border ${selectedZone === 'front'
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                                        }`}
                                >
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="relative w-10 h-14">
                                            <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                            <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] border-2 border-dashed border-indigo-400 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-medium text-gray-800 mt-1">Front Center</p>
                                </div>
                                <div
                                    id="zone-pocket"
                                    onClick={() => handleZoneClick('pocket')}
                                    className={`design-zone rounded-md p-2 cursor-pointer border ${selectedZone === 'pocket'
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                                        }`}
                                >
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="relative w-10 h-14">
                                            <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                            <div className="absolute top-[15%] left-[60%] w-[30%] h-[20%] border-2 border-dashed border-gray-400 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-medium text-gray-800 mt-1">Pocket</p>
                                </div>
                                <div
                                    id="zone-back"
                                    onClick={() => handleZoneClick('back')}
                                    className={`design-zone rounded-md p-2 cursor-pointer border ${selectedZone === 'back'
                                        ? 'border-indigo-400 bg-indigo-50'
                                        : 'border-gray-200 hover:border-indigo-500 hover:bg-indigo-50'
                                        }`}
                                >
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="relative w-10 h-14">
                                            <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                            <div className="absolute top-[20%] left-[20%] w-[60%] h-[40%] border-2 border-dashed border-gray-400 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-medium text-gray-800 mt-1">Back</p>
                                </div>
                            </div>
                        </div>

                        {/* Drag & Drop Design Area */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium text-gray-800">Drag & Drop Design</h3>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2 flex gap-1 items-center">Max size: 10MB
                                        <svg className="w-4 h-4 svg-inline--fa fa-circle-info" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="circle-info" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" data-fa-i2svg=""><path fill="currentColor" d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"></path></svg>
                                    </span>
                                </div>
                            </div>

                            <div
                                id="design-dropzone"
                                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer bg-gray-50
                                    ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'}`}
                                onClick={handleUploadClick}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <img
                                    className="w-24 h-24 mx-auto mb-4"
                                    src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d16b92adec-0fba3240cb9b255c9658.png"
                                    alt="cloud upload icon"
                                />
                                <p className="text-gray-600 mb-1">
                                    {isDragging ? 'Drop your image here' : 'Drag and drop your design files here'}
                                </p>
                                <p className="text-gray-500 text-sm mb-4">PNG, JPG, SVG (Max 10MB)</p>
                                <button
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleUploadClick();
                                    }}
                                >
                                    Browse Files
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Product Tab Content */}
                    <div className={activeTab === 'product' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Selection</h3>
                        <p className="text-gray-600">Product options will be displayed here.</p>
                    </div>

                    {/* Color Tab Content */}
                    <div className={activeTab === 'color' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Color Options</h3>
                        <p className="text-gray-600">Color selection will be displayed here.</p>
                    </div>

                    {/* Text Tab Content */}
                    <div className={activeTab === 'text' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Add Text</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-2">
                                    Enter Text
                                </label>
                                <input
                                    type="text"
                                    id="text-input"
                                    className="w-full text-black border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Enter your text here"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Font Size
                                </label>
                                <input
                                    type="range"
                                    min="12"
                                    max="72"
                                    value={fontSize}
                                    onChange={(e) => setFontSize(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                />
                                <span className="text-xs text-gray-500">{fontSize}px</span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Text Color
                                </label>
                                <input
                                    type="color"
                                    value={textColor}
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-full h-10 rounded-md cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={handleTextAdd}
                                className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition-colors"
                            >
                                Add Text
                            </button>
                        </div>
                    </div>

                    {/* Options Tab Content */}
                    <div className={activeTab === 'options' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Options</h3>
                        <p className="text-gray-600">Additional customization options will be displayed here.</p>
                    </div>
                </div>
            </div>

            {/* Design Adjustment Tools - Only show when design tab is active */}
            {activeTab === 'design' && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">Design Adjustments</h3>

                    <div className="space-y-5">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Size</label>
                                <span id="size-value" className="text-xs text-gray-500">{size}%</span>
                            </div>
                            <input
                                id="size-slider"
                                type="range"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                min="20"
                                max="200"
                                value={size}
                                onChange={handleSizeChange}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-medium text-gray-700">Rotation</label>
                                <span id="rotation-value" className="text-xs text-gray-500">{rotation}°</span>
                            </div>
                            <input
                                id="rotation-slider"
                                type="range"
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                min="0"
                                max="360"
                                value={rotation}
                                onChange={handleRotationChange}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Help section */}
            <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start">
                <i className="fa-solid fa-circle-info text-indigo-500 mt-0.5 mr-3"></i>
                <div>
                    <p className="text-gray-700 text-sm">Need help with your design?</p>
                    <p className="text-gray-600 text-xs mt-1">Our design experts can assist you with layout, colors, and more.</p>
                    <button className="mt-2 text-indigo-600 text-sm font-medium hover:text-indigo-800">
                        Get Professional Help
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Right;