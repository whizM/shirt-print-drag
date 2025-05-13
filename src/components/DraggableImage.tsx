import React from 'react';
import Draggable from 'react-draggable';
import { ImageConfig } from '../types';

interface DraggableImageProps {
    imageConfig: ImageConfig;
    printableArea: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
    onDrag: (x: number, y: number) => void;
}

const DraggableImage: React.FC<DraggableImageProps> = ({
    imageConfig,
    printableArea,
    onDrag,
}) => {
    const handleDrag = (_: any, data: { x: number; y: number }) => {
        onDrag(data.x, data.y);
    };

    // Calculate clip path coordinates relative to image position
    const clipLeft = printableArea.left - imageConfig.position.x;
    const clipTop = printableArea.top - imageConfig.position.y;
    const clipRight = clipLeft + printableArea.width;
    const clipBottom = clipTop + printableArea.height;

    return (
        <Draggable
            position={{ x: imageConfig.position.x, y: imageConfig.position.y }}
            onDrag={handleDrag}
            bounds="parent"
        >
            <div
                className="absolute"
                style={{
                    width: imageConfig.size.width,
                    height: imageConfig.size.height,
                    transform: 'translate(-50%, -50%)',
                    cursor: 'move',
                }}
            >
                {/* Base image with reduced opacity */}
                <img
                    src={imageConfig.url}
                    alt="Uploaded design"
                    className="absolute top-0 left-0"
                    style={{
                        width: '100%',
                        height: '100%',
                        opacity: 0.5,
                        pointerEvents: 'none',
                    }}
                    draggable={false}
                />

                {/* Clipped image with full opacity */}
                <div
                    className="absolute top-0 left-0 w-full h-full"
                    style={{
                        clipPath: `polygon(
                            ${clipLeft}px ${clipTop}px,
                            ${clipRight}px ${clipTop}px,
                            ${clipRight}px ${clipBottom}px,
                            ${clipLeft}px ${clipBottom}px
                        )`,
                    }}
                >
                    <img
                        src={imageConfig.url}
                        alt=""
                        style={{
                            width: '100%',
                            height: '100%',
                            pointerEvents: 'none',
                        }}
                        draggable={false}
                    />
                </div>
            </div>
        </Draggable>
    );
};

export default DraggableImage; 