import { useRef, useState, useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import Notification from "./Notification";
import { AlignHorizontalSpaceAround, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, AlignVerticalSpaceAround, AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd, Trash2, Upload } from "lucide-react";

interface RightProps {
    onImageUpload: (file: File) => void;
    onSizeChange?: (size: number) => void;
    onRotationChange?: (rotation: number) => void;
    onTextAdd?: (text: string, fontSize: number, color: string) => void;
    onTextUpdate?: (id: string, text: string, fontSize: number, color: string) => void;
    selectedTextId?: string | null;
    selectedText?: {
        id: string;
        text: string;
        fontSize: number;
        color: string;
    } | null;
    onTextDelete?: (id: string) => void;
    onAlignmentChange?: (alignment: { horizontal?: 'left' | 'center' | 'right', vertical?: 'top' | 'middle' | 'bottom' }) => void;
    onPositionPreset?: (preset: 'center' | 'pocket' | 'full-front') => void;
    isImageSelected?: boolean;
    onImageDelete?: () => void;
    setIsImageSelected?: Dispatch<SetStateAction<boolean>>;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const Right: React.FC<RightProps> = ({
    onImageUpload,
    onSizeChange,
    onRotationChange,
    onTextAdd,
    onTextUpdate,
    selectedTextId,
    selectedText,
    onTextDelete,
    onAlignmentChange,
    onPositionPreset,
    isImageSelected,
    setIsImageSelected,
    onImageDelete
}) => {
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
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (selectedText) {
            setText(selectedText.text);
            setFontSize(selectedText.fontSize);
            setTextColor(selectedText.color);
            setIsEditing(true);
            setActiveTab('text');
        } else {
            setIsEditing(false);
        }
    }, [selectedText]);

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

    const handleTextAction = () => {
        if (text.trim()) {
            if (isEditing && selectedTextId && onTextUpdate) {
                onTextUpdate(selectedTextId, text, fontSize, textColor);
                setText('');
                setFontSize(24);
                setTextColor('#000000');
                setIsEditing(false);
            } else if (onTextAdd) {
                onTextAdd(text, fontSize, textColor);
                setText('');
            }
        }
    };

    const handleCancelEdit = () => {
        setText('');
        setFontSize(24);
        setTextColor('#000000');
        setIsEditing(false);
    };

    const handleHorizontalAlign = (alignment: 'left' | 'center' | 'right') => {
        // Get current vertical alignment and keep it
        onAlignmentChange?.({ horizontal: alignment });
    };

    const handleVerticalAlign = (alignment: 'top' | 'middle' | 'bottom') => {
        // Get current horizontal alignment and keep it
        onAlignmentChange?.({ vertical: alignment });
    };

    const handlePositionPreset = (preset: 'center' | 'pocket' | 'full-front') => {
        onPositionPreset?.(preset);
    };

    return (
        <div className="w-2/5 bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-fit">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

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

            <div className="mt-6">
                <div>
                    <div className={activeTab === 'design' ? '' : 'hidden'}>
                        {!isImageSelected ? (
                            // Show drag & drop area when no image is selected
                            <div
                                className={`border-2 ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-dashed border-gray-300'} rounded-lg p-6 text-center`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center justify-center space-y-3">
                                    <div className="p-3 bg-indigo-50 rounded-full">
                                        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-gray-700 font-medium">Drag & drop your design here</p>
                                        <p className="text-gray-500 text-sm mt-1">or</p>
                                    </div>
                                    <button
                                        onClick={handleUploadClick}
                                        className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        Browse Files
                                    </button>
                                    <p className="text-xs text-gray-500 mt-2">Supported formats: PNG, JPG, GIF (max 10MB)</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => onImageDelete?.()}
                                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 px-4 rounded-md hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 flex items-center justify-center"
                                >
                                    <Trash2 className="mr-2" size={18} />
                                    Delete Image
                                </button>
                                <button
                                    onClick={() => setIsImageSelected?.(false)}
                                    className="flex-1 bg-indigo-50 text-indigo-600 border border-indigo-200 py-2 px-4 rounded-md hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center"
                                >
                                    <Upload className="mr-2" size={18} />
                                    Add New Image
                                </button>
                            </div>
                        )}
                        <div className="flex flex-col space-y-4">
                            {/* Position presets */}
                            <div className="mt-6 border-t pt-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Position Presets
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handlePositionPreset('center')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Center
                                    </button>
                                    <button
                                        onClick={() => handlePositionPreset('full-front')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Full Front
                                    </button>
                                    <button
                                        onClick={() => handlePositionPreset('pocket')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        Pocket
                                    </button>
                                </div>
                            </div>

                            {/* Alignment controls */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Horizontal Alignment
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleHorizontalAlign('left')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <AlignHorizontalJustifyStart />
                                    </button>
                                    <button
                                        onClick={() => handleHorizontalAlign('center')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <AlignHorizontalSpaceAround />
                                    </button>
                                    <button
                                        onClick={() => handleHorizontalAlign('right')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <AlignHorizontalJustifyEnd />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Vertical Alignment
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleVerticalAlign('top')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <AlignVerticalJustifyStart />
                                    </button>
                                    <button
                                        onClick={() => handleVerticalAlign('middle')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <AlignVerticalSpaceAround />
                                    </button>
                                    <button
                                        onClick={() => handleVerticalAlign('bottom')}
                                        className="flex-1 bg-white border border-gray-300 rounded-md py-2 flex items-center justify-center text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    >
                                        <AlignVerticalJustifyEnd />
                                    </button>
                                </div>
                            </div>

                            {/* Design adjustments */}
                            <div className="mt-6 border-t pt-6">
                                <h3 className="font-medium text-gray-800 mb-4">Design Adjustments</h3>
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
                        </div>
                    </div>

                    <div className={activeTab === 'product' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Selection</h3>
                        <p className="text-gray-600">Product options will be displayed here.</p>
                    </div>

                    <div className={activeTab === 'color' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Color Options</h3>
                        <p className="text-gray-600">Color selection will be displayed here.</p>
                    </div>

                    <div className={activeTab === 'text' ? '' : 'hidden'}>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Add Text</h3>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
                                        Enter Text
                                    </label>
                                    <input
                                        type="text"
                                        id="text-input"
                                        className="w-full px-3 text-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Your text here"
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
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

                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleTextAction}
                                        className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                                    >
                                        {isEditing ? 'Update Text' : 'Add Text'}
                                    </button>

                                    {isEditing && (
                                        <>
                                            <button
                                                onClick={handleCancelEdit}
                                                className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedTextId && onTextDelete) {
                                                        onTextDelete(selectedTextId);
                                                        handleCancelEdit();
                                                    }
                                                }}
                                                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={activeTab === 'options' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Options</h3>
                        <p className="text-gray-600">Additional customization options will be displayed here.</p>
                    </div>
                </div>
            </div>

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