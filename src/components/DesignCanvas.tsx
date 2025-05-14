import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Image, Transformer, Group, Rect, Text } from 'react-konva';
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
    text?: string;
    textFontSize?: number;
    textColor?: string;
}

const DesignCanvas: React.FC<DesignCanvasProps> = ({ imageUrl, printableArea, designSize, designRotation, onRotationChange, text, textFontSize = 24, textColor = '#000000' }) => {
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
    const [isSelected, setIsSelected] = useState(false);
    const stageRef = useRef<Konva.Stage>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'image' | 'text' | null>(null);
    const [textElements, setTextElements] = useState<Array<{
        id: string;
        text: string;
        x: number;
        y: number;
        fontSize: number;
        color: string;
        rotation: number;
        draggable: boolean;
        ref: React.RefObject<Konva.Text>;
    }>>([]);

    useEffect(() => {
        if (imageUrl) {
            setIsSelected(true);
        }
    }, [imageUrl]);

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

            if (imageRef.current && transformerRef.current) {
                const layer = transformerRef.current.getLayer();
                transformerRef.current.nodes([imageRef.current]);
                if (layer) {
                    layer.batchDraw();
                }
            }
            setIsSelected(true);
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
    }, [isSelected, image]);

    // Add global click handler
    useEffect(() => {
        const handleGlobalClick = (e: MouseEvent) => {
            // If we're not clicking on the Konva stage or its children
            if (stageRef.current) {
                const stageContainer = stageRef.current.container();
                if (!stageContainer.contains(e.target as Node)) {
                    setIsSelected(false);
                }
            }
        };

        // Add global click listener
        document.addEventListener('mousedown', handleGlobalClick);

        // Cleanup
        return () => {
            document.removeEventListener('mousedown', handleGlobalClick);
        };
    }, []);

    // Update image selection handler
    const handleImageSelect = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true; // Stop event propagation
        setSelectedId(null);
        setSelectedType('image');
        setIsSelected(true);
    };

    // Update text selection handler
    const handleTextSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent | Event>) => {
        e.cancelBubble = true; // Stop event propagation
        setSelectedId(id);
        setSelectedType('text');
        setIsSelected(true);
    };

    // Update deselect handler
    const checkDeselect = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setSelectedId(null);
            setSelectedType(null);
            setIsSelected(false);
        }
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

    // Update text handling
    useEffect(() => {
        if (text) {
            const newTextElement = {
                id: Date.now().toString(),
                text,
                x: printableArea.left + printableArea.width / 2,
                y: printableArea.top + printableArea.height / 2,
                fontSize: textFontSize,
                color: textColor,
                rotation: 0,
                draggable: true,
                ref: React.createRef<Konva.Text>()
            };
            setTextElements(prev => [...prev, newTextElement]);
            setSelectedId(newTextElement.id);
            setSelectedType('text');
            setIsSelected(true);
        }
    }, [text, printableArea, textFontSize, textColor]);

    const handleTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
        const newElements = textElements.map(el => {
            if (el.id === id) {
                return {
                    ...el,
                    x: e.target.x(),
                    y: e.target.y(),
                };
            }
            return el;
        });
        setTextElements(newElements);
    };

    // Update transformer effect
    useEffect(() => {
        if (!isSelected || !transformerRef.current) return;

        let nodeToAttach = null;
        if (selectedType === 'text' && selectedId) {
            nodeToAttach = textElements.find(el => el.id === selectedId)?.ref?.current;
        } else if (selectedType === 'image') {
            nodeToAttach = imageRef.current;
        }

        if (nodeToAttach) {
            transformerRef.current.nodes([nodeToAttach]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected, selectedType, selectedId, textElements]);

    // Handle text transform
    const handleTextTransform = (id: string) => {
        const textNode = textElements.find(el => el.id === id)?.ref?.current;
        if (textNode) {
            const newRotation = textNode.rotation();
            const newScale = textNode.scaleX();

            setTextElements(prev => prev.map(el => {
                if (el.id === id) {
                    return {
                        ...el,
                        rotation: newRotation,
                        fontSize: Math.round(el.fontSize * newScale),
                        x: textNode.x(),
                        y: textNode.y(),
                    };
                }
                return el;
            }));
        }
    };
    console.log(textElements);
    return (
        <Stage
            ref={stageRef}
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
                {/* Render image first */}
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
                            onClick={handleImageSelect}
                            onDragEnd={handleDragEnd}
                            onTransformEnd={handleTransformEnd}
                            onTransform={handleTransformEnd}
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
                    </>
                )}

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

                {/* Render text elements on top */}
                {textElements.map((el) => (
                    <Text
                        key={el.id}
                        ref={el.ref}
                        text={el.text}
                        x={el.x}
                        y={el.y}
                        fontSize={el.fontSize}
                        fill={el.color}
                        rotation={el.rotation}
                        draggable={el.draggable}
                        align="center"
                        verticalAlign="middle"
                        onClick={(e) => handleTextSelect(el.id, e)}
                        onTap={(e) => handleTextSelect(el.id, e)}
                        onDragEnd={(e) => handleTextDragEnd(e, el.id)}
                        onTransform={() => handleTextTransform(el.id)}
                        onTransformEnd={() => handleTextTransform(el.id)}
                    />
                ))}

                {/* Transformer should be last to appear on top of everything */}
                {isSelected && (selectedType === 'text' || selectedType === 'image') && (
                    <Transformer
                        ref={transformerRef}
                        boundBoxFunc={(oldBox, newBox) => {
                            if (selectedType === 'text') {
                                return newBox; // Allow free transform for text
                            }
                            // Existing bounds for image
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
                        enabledAnchors={selectedType === 'text' ? ['middle-left', 'middle-right'] : [
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
                        keepRatio={selectedType !== 'text'} // Don't keep ratio for text
                        padding={5}
                        anchorSize={10}
                        anchorCornerRadius={5}
                        anchorStroke="#3B82F6"
                        anchorFill="white"
                        borderStroke="#3B82F6"
                        borderDash={[3, 3]}
                        onTransformEnd={selectedType === 'text' ?
                            () => selectedId && handleTextTransform(selectedId) :
                            handleTransformEnd
                        }
                    />
                )}
            </Layer>
        </Stage>
    );
};

export default DesignCanvas; 