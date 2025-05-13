import React, { useState } from 'react';
import TShirtMockup from './TShirtMockup';
import ImageUploader from './ImageUploader';
import DraggableImage from './DraggableImage';
import { ImageConfig } from '../types';

const PRINTABLE_AREA = {
    top: 150,
    left: 175,
    width: 150,
    height: 200,
};

const DEFAULT_POSITION = {
    x: 250, // Center of the t-shirt
    y: 250,
};

const TShirtCustomizer: React.FC = () => {
    const [uploadedImage, setUploadedImage] = useState<ImageConfig | null>(null);
    const [showPrintableArea, setShowPrintableArea] = useState(true);

    const handleImageUpload = (file: File) => {
        const url = URL.createObjectURL(file);
        const img = new Image();

        img.onload = () => {
            const maxWidth = PRINTABLE_AREA.width * 0.8; // 80% of printable area width
            const scale = maxWidth / img.width;
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            setUploadedImage({
                url,
                position: DEFAULT_POSITION,
                size: {
                    width: scaledWidth,
                    height: scaledHeight,
                },
                initialSize: {
                    width: scaledWidth,
                    height: scaledHeight,
                },
            });
        };

        img.src = url;
    };

    const handleImageDrag = (x: number, y: number) => {
        if (uploadedImage) {
            setUploadedImage({
                ...uploadedImage,
                position: { x, y },
            });
        }
    };

    return (
        <div className="relative w-[500px] h-[500px]">
            <TShirtMockup
                printableArea={PRINTABLE_AREA}
                showPrintableArea={showPrintableArea}
            />

            {uploadedImage && (
                <DraggableImage
                    imageConfig={uploadedImage}
                    printableArea={PRINTABLE_AREA}
                    onDrag={handleImageDrag}
                />
            )}

            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-48">
                <ImageUploader onImageUpload={handleImageUpload} />
            </div>
        </div>
    );
};

export default TShirtCustomizer; 