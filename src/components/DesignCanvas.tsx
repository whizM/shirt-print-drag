import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Transformer, Group, Rect } from 'react-konva';
import Konva from 'konva';
import useImage from 'use-image';

interface DesignCanvasProps {
    imageUrl: string;
    printableArea: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
    designSize: number;
    designRotation: number;
    onRotationChange?: (rotation: number) => void;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({ imageUrl, printableArea, designSize, designRotation, onRotationChange }) => {
    const [image] = useImage(imageUrl);
    const [initialScale, setInitialScale] = useState(1);
    const [transform, setTransform] = useState({
        x: printableArea.left + printableArea.width / 2,
        y: printableArea.top + printableArea.height / 2,
        width: 100,
        height: 100,
        rotation: designRotation,
        scaleX: designSize / 100,
        scaleY: designSize / 100,
    });
    const imageRef = useRef<Konva.Image>(null);
    const transformerRef = useRef<Konva.Transformer>(null);
    const [isSelected, setIsSelected] = useState(true);

    useEffect(() => {
        if (image) {
            // Calculate initial scale to fit the printable area
            const scale = Math.min(
                printableArea.width / image.width,
                printableArea.height / image.height
            ) * 0.8;
            setInitialScale(scale);
            setTransform(prev => ({
                ...prev,
                width: image.width,
                height: image.height,
                scaleX: scale * (designSize / 100),
                scaleY: scale * (designSize / 100),
            }));
        }
    }, [image, printableArea, designSize]);

    useEffect(() => {
        if (initialScale) {
            setTransform(prev => ({
                ...prev,
                scaleX: initialScale * (designSize / 100),
                scaleY: initialScale * (designSize / 100),
                rotation: designRotation
            }));
        }
    }, [designSize, designRotation, initialScale]);

    useEffect(() => {
        if (isSelected && imageRef.current && transformerRef.current) {
            const layer = transformerRef.current.getLayer();
            transformerRef.current.nodes([imageRef.current]);
            if (layer) {
                layer.batchDraw();
            }
        }
    }, [isSelected]);

    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setIsSelected(false);
        }
    };

    const handleSelect = () => {
        setIsSelected(true);
    };

    const handleTransformEnd = () => {
        if (imageRef.current) {
            const node = imageRef.current;
            const newRotation = node.rotation();

            // Normalize rotation to 0-360 range
            const normalizedRotation = ((newRotation % 360) + 360) % 360;

            // Update parent component's rotation state
            onRotationChange?.(Math.round(normalizedRotation));

            setTransform({
                x: node.x(),
                y: node.y(),
                width: node.width(),
                height: node.height(),
                rotation: normalizedRotation,
                scaleX: node.scaleX(),
                scaleY: node.scaleY(),
            });
        }
    };

    const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
        setTransform(prev => ({
            ...prev,
            x: e.target.x(),
            y: e.target.y(),
        }));
    };

    return (
        <Stage
            width={500}
            height={500}
            style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translate(-50%, -20%)',
            }}
            onClick={checkDeselect}
            onTap={checkDeselect}
        >
            <Layer>
                {image && (
                    <>
                        {/* Main draggable image */}
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
                            scaleX={transform.scaleX}
                            scaleY={transform.scaleY}
                            opacity={0.3}
                            draggable
                            onClick={handleSelect}
                            onDragEnd={handleDragEnd}
                            onTransformEnd={handleTransformEnd}
                        />

                        {/* Clipped version of the same image */}
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
                                image={image}
                                x={transform.x}
                                y={transform.y}
                                width={transform.width}
                                height={transform.height}
                                offsetX={transform.width / 2}
                                offsetY={transform.height / 2}
                                rotation={transform.rotation}
                                scaleX={transform.scaleX}
                                scaleY={transform.scaleY}
                                opacity={1}
                                listening={false}
                            />
                        </Group>

                        {/* Printable area outline */}
                        <Rect
                            x={printableArea.left}
                            y={printableArea.top}
                            width={printableArea.width}
                            height={printableArea.height}
                            strokeWidth={2}
                            dash={[4, 4]}
                            listening={false}
                        />

                        {/* Only show transformer when selected */}
                        {isSelected && (
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
                                enabledAnchors={[
                                    'top-left',
                                    'top-center',
                                    'top-right',
                                    'middle-left',
                                    'middle-right',
                                    'bottom-left',
                                    'bottom-center',
                                    'bottom-right'
                                ]}
                                rotateEnabled={true}
                                keepRatio={false}
                                padding={5}
                                anchorSize={10}
                                anchorCornerRadius={5}
                                anchorStroke="#3B82F6"
                                anchorFill="white"
                                borderStroke="#3B82F6"
                                borderDash={[3, 3]}
                                onTransformEnd={handleTransformEnd}
                            />
                        )}
                    </>
                )}
            </Layer>
        </Stage>
    );
};

export default DesignCanvas; 