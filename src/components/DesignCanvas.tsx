import React, { useEffect, useState } from 'react';
import { Stage, Layer, Image, Transformer, Group, Rect } from 'react-konva';
import Konva from 'konva';

interface DesignCanvasProps {
    imageUrl: string;
    printableArea: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({ imageUrl, printableArea }) => {
    const [image, setImage] = useState<HTMLImageElement | null>(null);
    const [transform, setTransform] = useState({
        x: printableArea.left + printableArea.width / 2,
        y: printableArea.top + printableArea.height / 2,
        width: 100,
        height: 100,
        rotation: 0,
    });

    const imageRef = React.useRef<Konva.Image>(null);
    const transformerRef = React.useRef<Konva.Transformer>(null);

    useEffect(() => {
        if (imageUrl) {
            const img = new window.Image();
            img.src = imageUrl;
            img.onload = () => {
                setImage(img);
                // Set initial size maintaining aspect ratio
                const scale = Math.min(
                    printableArea.width / img.width,
                    printableArea.height / img.height
                ) * 0.8;
                setTransform(prev => ({
                    ...prev,
                    width: img.width * scale,
                    height: img.height * scale,
                }));
            };
        }
    }, [imageUrl, printableArea]);

    useEffect(() => {
        if (transformerRef.current && imageRef.current) {
            transformerRef.current.nodes([imageRef.current]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [image]);

    const handleTransformEnd = () => {
        if (imageRef.current) {
            const node = imageRef.current;
            setTransform({
                x: node.x(),
                y: node.y(),
                width: node.width() * node.scaleX(),
                height: node.height() * node.scaleY(),
                rotation: node.rotation(),
            });
            node.scaleX(1);
            node.scaleY(1);
        }
    };

    return (
        <Stage
            width={500}
            height={500}
            style={{
                position: 'absolute',
                top: 100,
                left: 350,
            }}
        >
            <Layer>
                {image && (
                    <>
                        {/* Faded background image */}
                        <Image
                            image={image}
                            x={transform.x}
                            y={transform.y}
                            width={transform.width}
                            height={transform.height}
                            offsetX={transform.width / 2}
                            offsetY={transform.height / 2}
                            rotation={transform.rotation}
                            opacity={0.3}
                            listening={false}
                        />

                        {/* Main draggable image with clip */}
                        <Group
                            clipFunc={(ctx) => {
                                ctx.beginPath();
                                ctx.rect(
                                    printableArea.left,
                                    printableArea.top,
                                    printableArea.width,
                                    printableArea.height
                                );
                                ctx.closePath();
                            }}
                        >
                            <Image
                                ref={imageRef}
                                image={image}
                                x={transform.x}
                                y={transform.y}
                                width={transform.width}
                                height={transform.height}
                                offsetX={transform.width / 2}
                                offsetY={transform.height / 2}
                                rotation={transform.rotation}
                                draggable
                                onTransformEnd={handleTransformEnd}
                                onDragEnd={(e) => {
                                    setTransform(prev => ({
                                        ...prev,
                                        x: e.target.x(),
                                        y: e.target.y(),
                                    }));
                                }}
                            />
                        </Group>

                        {/* Printable area outline */}
                        <Rect
                            x={printableArea.left}
                            y={printableArea.top}
                            width={printableArea.width}
                            height={printableArea.height}
                            stroke="#3B82F6" // blue-500
                            strokeWidth={2}
                            dash={[4, 4]}
                            listening={false}
                        />

                        {/* Transformer */}
                        <Transformer
                            ref={transformerRef}
                            boundBoxFunc={(oldBox, newBox) => {
                                const maxWidth = printableArea.width * 1.5;
                                const maxHeight = printableArea.height * 1.5;
                                const minWidth = 20;
                                const minHeight = 20;

                                if (
                                    newBox.width < minWidth ||
                                    newBox.height < minHeight ||
                                    newBox.width > maxWidth ||
                                    newBox.height > maxHeight
                                ) {
                                    return oldBox;
                                }
                                return newBox;
                            }}
                        />
                    </>
                )}
            </Layer>
        </Stage>
    );
};

export default DesignCanvas; 