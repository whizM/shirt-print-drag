import { useRef, useState, useEffect } from "react";
import Notification from "./Notification";
import { AlignHorizontalSpaceAround, AlignVerticalJustifyEnd, AlignVerticalJustifyStart, AlignHorizontalJustifyStart, AlignHorizontalJustifyEnd, Trash2, Upload, X } from "lucide-react";

interface RightProps {
    onImageUpload: (file: File) => void;
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
    selectedImageId?: string | null;
    selectedImage?: {
        id: string;
        url: string;
        size: number;
        rotation: number;
        x: number;
        y: number;
    } | null;
    onImageUpdate?: (id: string, updates: Partial<{ size: number; rotation: number; x: number; y: number }>) => void;
    onImageDelete?: (id: string) => void;
    setSelectedTextId: (id: string | null) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

const Right: React.FC<RightProps> = ({
    onImageUpload,
    onTextAdd,
    onTextUpdate,
    selectedTextId,
    selectedText,
    onTextDelete,
    onAlignmentChange,
    onPositionPreset,
    selectedImageId,
    selectedImage,
    onImageUpdate,
    onImageDelete,
    setSelectedTextId
}) => {
    const [activeTab, setActiveTab] = useState('design');
    const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' | 'warning' } | null>(null);
    const [newText, setNewText] = useState('');
    const [fontSize, setFontSize] = useState(24);
    const [textColor, setTextColor] = useState('#000000');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    // Use the selected image's properties for the sliders
    const [imageSize, setImageSize] = useState(100);
    const [imageRotation, setImageRotation] = useState(0);

    // Update local state when selected image changes
    useEffect(() => {
        if (selectedImage) {
            setImageSize(selectedImage.size);
            setImageRotation(selectedImage.rotation);
        } else {
            setImageSize(100);
            setImageRotation(0);
        }
    }, [selectedImage]);

    // Update text form when selected text changes
    useEffect(() => {
        if (selectedText) {
            setNewText(selectedText.text);
            setFontSize(selectedText.fontSize);
            setTextColor(selectedText.color);
        } else {
            setNewText('');
            setFontSize(24);
            setTextColor('#000000');
        }
    }, [selectedText]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleFile = (file: File) => {
        if (file.size > MAX_FILE_SIZE) {
            setNotification({
                message: 'File size exceeds 10MB limit',
                type: 'error'
            });
            return;
        }

        if (!file.type.startsWith('image/')) {
            setNotification({
                message: 'Only image files are allowed',
                type: 'error'
            });
            return;
        }

        onImageUpload(file);
        setNotification({
            message: 'Image uploaded successfully',
            type: 'success'
        });
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleTextSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim()) return;

        if (selectedTextId && onTextUpdate) {
            onTextUpdate(selectedTextId, newText, fontSize, textColor);
        } else if (onTextAdd) {
            onTextAdd(newText, fontSize, textColor);
        }
    };

    const handleCancelEdit = () => {
        if (selectedText) {
            setNewText(selectedText.text);
            setFontSize(selectedText.fontSize);
            setTextColor(selectedText.color);
            setSelectedTextId(null);
        }
    };

    const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSize = parseInt(e.target.value);
        setImageSize(newSize);
        if (selectedImageId && onImageUpdate) {
            onImageUpdate(selectedImageId, { size: newSize });
        }
    };

    const handleRotationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newRotation = parseInt(e.target.value);
        setImageRotation(newRotation);
        if (selectedImageId && onImageUpdate) {
            onImageUpdate(selectedImageId, { rotation: newRotation });
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification(null)}
                />
            )}

            <div className="mb-4">
                <div className="flex border-b border-gray-200">
                    <button
                        className={`py-2 px-4 font-medium text-sm ${activeTab === 'design' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('design')}
                    >
                        Design
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm ${activeTab === 'text' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('text')}
                    >
                        Text
                    </button>
                    <button
                        className={`py-2 px-4 font-medium text-sm ${activeTab === 'options' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                        onClick={() => setActiveTab('options')}
                    >
                        Options
                    </button>
                </div>

                <div className="mt-4">
                    <div className={activeTab === 'design' ? '' : 'hidden'}>
                        <div className="mb-6">
                            <h3 className="text-lg font-medium text-gray-800 mb-4">Upload Image</h3>
                            <div
                                ref={dropZoneRef}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
                                    }`}
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                    Drag and drop an image here, or click to select a file
                                </p>
                                <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        {selectedImageId && selectedImage && (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-800 mb-4">Image Settings</h3>
                                <div className="space-y-4">

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Alignment</label>
                                        <div className="grid grid-cols-3 gap-2 text-gray-700">
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'left', vertical: 'top' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Top Left"
                                            >
                                                <div className="transform -rotate-45">
                                                    <AlignHorizontalJustifyStart className="w-4 h-4" />
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ vertical: 'top' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Top Center"
                                            >
                                                <AlignVerticalJustifyStart className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'right', vertical: 'top' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Top Right"
                                            >
                                                <div className="transform rotate-45">
                                                    <AlignHorizontalJustifyEnd className="w-4 h-4" />
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'left' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Middle Left"
                                            >
                                                <AlignHorizontalJustifyStart className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'center', vertical: 'middle' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Center"
                                            >
                                                <AlignHorizontalSpaceAround className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'right' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Middle Right"
                                            >
                                                <AlignHorizontalJustifyEnd className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'left', vertical: 'bottom' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Bottom Left"
                                            >
                                                <div className="transform rotate-45">
                                                    <AlignHorizontalJustifyStart className="w-4 h-4" />
                                                </div>
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ vertical: 'bottom' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Bottom Center"
                                            >
                                                <AlignVerticalJustifyEnd className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onAlignmentChange && onAlignmentChange({ horizontal: 'right', vertical: 'bottom' })}
                                                className="p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
                                                title="Bottom Right"
                                            >
                                                <div className="transform -rotate-45">
                                                    <AlignHorizontalJustifyEnd className="w-4 h-4" />
                                                </div>
                                            </button>
                                        </div>
                                    </div>

                                    <label className="block text-sm font-medium text-gray-700 mb-2">Position Presets</label>
                                    <div className="grid grid-cols-3 gap-2  text-gray-700">
                                        <button
                                            onClick={() => onPositionPreset && onPositionPreset('pocket')}
                                            className="p-2 border border-gray-300 rounded hover:bg-gray-100 text-xs font-medium"
                                        >
                                            Pocket
                                        </button>
                                        <button
                                            onClick={() => onPositionPreset && onPositionPreset('full-front')}
                                            className="p-2 border border-gray-300 rounded hover:bg-gray-100 text-xs font-medium"
                                        >
                                            Full Front
                                        </button>
                                    </div>

                                    <div>
                                        <button
                                            onClick={() => onImageDelete && onImageDelete(selectedImageId)}
                                            className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 flex items-center justify-center"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" />
                                            Delete Image
                                        </button>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Size
                                        </label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="200"
                                            value={imageSize}
                                            onChange={handleSizeChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>Small</span>
                                            <span>Large</span>
                                        </div>
                                    </div>


                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Rotation
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="360"
                                            value={imageRotation}
                                            onChange={handleRotationChange}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0°</span>
                                            <span>360°</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>

                    <div className={activeTab === 'options' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Options</h3>
                        <p className="text-gray-600">Additional customization options will be displayed here.</p>
                    </div>

                    <div className={activeTab === 'text' ? '' : 'hidden'}>
                        <h3 className="text-lg font-medium text-gray-800 mb-4">
                            {selectedTextId ? "Edit Text" : "Add Text"}
                        </h3>
                        <form onSubmit={handleTextSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="text-input" className="block text-sm font-medium text-gray-700 mb-1">
                                        Text
                                    </label>
                                    <input
                                        id="text-input"
                                        type="text"
                                        value={newText}
                                        onChange={(e) => setNewText(e.target.value)}
                                        className="w-full text-gray-700 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter your text"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="font-size" className="block text-sm font-medium text-gray-700 mb-1">
                                        Font Size
                                    </label>
                                    <input
                                        id="font-size"
                                        type="range"
                                        min="12"
                                        max="72"
                                        value={fontSize}
                                        onChange={(e) => setFontSize(parseInt(e.target.value))}
                                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Small</span>
                                        <span>{fontSize}px</span>
                                        <span>Large</span>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="text-color" className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <input
                                        id="text-color"
                                        type="color"
                                        value={textColor}
                                        onChange={(e) => setTextColor(e.target.value)}
                                        className="w-full h-10 p-1 border border-gray-300 rounded-md shadow-sm cursor-pointer"
                                    />
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        {selectedTextId ? "Update Text" : "Add Text"}
                                    </button>

                                    {selectedTextId && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={handleCancelEdit}
                                                className="flex-1 items-center flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                <X className="w-4 h-4 mr-1" />
                                                Cancel
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onTextDelete && selectedTextId && onTextDelete(selectedTextId)}
                                                className="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </form>
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