import { useRef } from "react";

const Right = ({ onImageUpload }: { onImageUpload: (file: File) => void }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            onImageUpload(files[0]);
        }
    };

    return (
        <div className="w-full md:w-1/2 lg:w-2/5">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                {/* Tabs navigation */}
                <div className="flex border-b border-gray-200">
                    <button data-tab="product" className="tab-button py-3 px-4 text-gray-600 font-medium flex-1 text-center">Product</button>
                    <button data-tab="color" className="tab-button py-3 px-4 text-gray-600 font-medium flex-1 text-center">Color</button>
                    <button data-tab="design" className="tab-button active-tab py-3 px-4 font-medium flex-1 text-center">Design</button>
                    <button data-tab="text" className="tab-button py-3 px-4 text-gray-600 font-medium flex-1 text-center">Text</button>
                    <button data-tab="options" className="tab-button py-3 px-4 text-gray-600 font-medium flex-1 text-center">Options</button>
                </div>

                {/* Tab content container */}
                <div id="tab-content" className="p-6">
                    {/* Design Tab Content (shown by default) */}
                    <div data-content="design" className="tab-content">
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
                                <div id="zone-front" className="design-zone active-zone rounded-md p-2 cursor-pointer">
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
                        <div id="design-upload-area" className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="font-medium text-gray-800">Drag & Drop Design</h3>
                                <div className="flex items-center">
                                    <span className="text-xs text-gray-500 mr-2">Max size: 10MB</span>
                                    <i className="fa-solid fa-circle-info text-gray-400 cursor-pointer"></i>
                                </div>
                            </div>

                            <div id="design-dropzone" className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors cursor-pointer bg-gray-50">
                                <img className="w-24 h-24 mx-auto mb-4" src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d16b92adec-0fba3240cb9b255c9658.png" alt="cloud upload icon" />
                                <p className="text-gray-600 mb-1">Drag and drop your design files here</p>
                                <p className="text-gray-500 text-sm mb-4">PNG, JPG, SVG (Max 10MB)</p>
                                <div className="flex justify-center">
                                    <label htmlFor="file-upload" className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-6 rounded-md font-medium transition duration-200 mr-2 cursor-pointer">
                                        Browse Files
                                    </label>
                                    <input id="file-upload" ref={fileInputRef} onChange={handleFileChange} type="file" accept="image/*" className="hidden" />
                                    <button onClick={handleUploadClick} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-4 rounded-md font-medium transition duration-200">
                                        <i className="fa-brands fa-instagram mr-1"></i> Import
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Other tab contents will be added dynamically */}
                    <div data-content="product" className="tab-content hidden">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Product Selection</h3>
                        <p className="text-gray-600">Product options will be displayed here.</p>
                    </div>

                    <div data-content="color" className="tab-content hidden">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Color Options</h3>
                        <p className="text-gray-600">Color selection will be displayed here.</p>
                    </div>

                    <div data-content="text" className="tab-content hidden">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Text Customization</h3>
                        <p className="text-gray-600">Text editing options will be displayed here.</p>
                    </div>

                    <div data-content="options" className="tab-content hidden">
                        <h3 className="text-lg font-medium text-gray-800 mb-4">Additional Options</h3>
                        <p className="text-gray-600">Additional customization options will be displayed here.</p>
                    </div>
                </div>
            </div>

            {/* Design Adjustment Tools */}
            <div id="design-tools" className="mt-6 bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Design Adjustments</h3>

                <div className="space-y-5">
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Size</label>
                            <span id="size-value" className="text-xs text-gray-500">100%</span>
                        </div>
                        <input id="size-slider" type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" min="20" max="200" value="100" />
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <label className="text-sm font-medium text-gray-700">Rotation</label>
                            <span id="rotation-value" className="text-xs text-gray-500">0°</span>
                        </div>
                        <input id="rotation-slider" type="range" className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" min="0" max="360" value="0" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button id="position-btn" className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            <i className="fa-solid fa-arrows-up-down-left-right mr-2"></i>
                            <span className="text-sm">Position</span>
                        </button>
                        <button id="crop-btn" className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            <i className="fa-solid fa-crop mr-2"></i>
                            <span className="text-sm">Crop</span>
                        </button>
                    </div>

                    <div className="flex justify-between">
                        <button id="remove-btn" className="flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            <i className="fa-solid fa-trash-alt mr-2 text-red-500"></i>
                            <span className="text-sm">Remove</span>
                        </button>
                        <button id="apply-btn" className="flex items-center justify-center py-2 px-4 bg-indigo-600 rounded-md text-white hover:bg-indigo-700">
                            <i className="fa-solid fa-check mr-2"></i>
                            <span className="text-sm">Apply</span>
                        </button>
                    </div>
                </div>
            </div>

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