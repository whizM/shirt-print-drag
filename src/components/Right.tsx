import { useRef, useState } from "react";

interface RightProps {
    onImageUpload: (file: File) => void;
    onSizeChange?: (size: number) => void;
    onRotationChange?: (rotation: number) => void;
}

const Right: React.FC<RightProps> = ({ onImageUpload, onSizeChange, onRotationChange }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [size, setSize] = useState(100);
    const [rotation, setRotation] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState('design');

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onImageUpload(files[0]);
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
            onImageUpload(imageFile);
        }
    };

    const handleTabClick = (tabName: string) => {
        setActiveTab(tabName);
    };

    return (
        <div className="w-full md:w-1/2 lg:w-2/5">
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
                                    <span className="text-sm text-indigo-600 cursor-pointer">How it works</span>
                                </div>
                            </div>

                            {/* Design zones selector */}
                            <div className="grid grid-cols-3 gap-3 mb-4">
                                <div id="zone-front" className="design-zone active-zone rounded-md p-2 cursor-pointer border border-indigo-400 bg-indigo-50">
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="relative w-10 h-14">
                                            <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                            <div className="absolute top-[30%] left-[20%] w-[60%] h-[40%] border-2 border-dashed border-indigo-400 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-medium text-gray-800 mt-1">Front Center</p>
                                </div>
                                <div id="zone-pocket" className="design-zone border border-gray-200 rounded-md p-2 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
                                    <div className="h-16 flex items-center justify-center">
                                        <div className="relative w-10 h-14">
                                            <div className="absolute inset-0 bg-gray-200 rounded"></div>
                                            <div className="absolute top-[15%] left-[60%] w-[30%] h-[20%] border-2 border-dashed border-gray-400 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-center text-xs font-medium text-gray-800 mt-1">Pocket</p>
                                </div>
                                <div id="zone-back" className="design-zone border border-gray-200 rounded-md p-2 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50">
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
                                    <span className="text-xs text-gray-500 mr-2">Max size: 10MB</span>
                                    <i className="fa-solid fa-circle-info text-gray-400 cursor-pointer"></i>
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
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Text Customization</h3>
                        <p className="text-gray-600">Text editing options will be displayed here.</p>
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