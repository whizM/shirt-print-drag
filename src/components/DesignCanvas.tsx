import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
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
    texts: Array<{
        id: string;
        text: string;
        fontSize: number;
        color: string;
    }>;
    onTextSelect?: (id: string) => void;
    selectedTextId?: string | null;
    isImageSelected?: boolean;
    onImageSelect?: () => void;
    onImageDeselect?: () => void;
    isFullFront?: boolean;
}

// Add ref type
export interface DesignCanvasRef {
    setPosition: (x: number, y: number) => void;
    getImageDimensions: () => { width: number; height: number; scaleX: number; scaleY: number } | null;
    getPosition: () => { x: number; y: number } | null;
}

// Update to use forwardRef
const DesignCanvas = forwardRef<DesignCanvasRef, DesignCanvasProps>(({
    imageUrl,
    printableArea,
    designSize,
    designRotation,
    onRotationChange,
    texts,
    onTextSelect,
    selectedTextId,
    isImageSelected,
    onImageSelect,
    onImageDeselect,
    isFullFront = false
}, ref) => {
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
    console.log('designSize', designSize / 100);
    console.log('scale', transform.scaleX, transform.scaleY);
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

            // Store the initial scale for normal sizing
            setInitialScale(scale);

            // If in Full Front mode, calculate the scale to cover the printable area
            if (isFullFront) {
                const widthRatio = printableArea.width / image.width;
                const heightRatio = printableArea.height / image.height;
                const coverRatio = Math.min(widthRatio, heightRatio);

                setTransform(prev => ({
                    ...prev,
                    width: image.width,
                    height: image.height,
                    scaleX: coverRatio,
                    scaleY: coverRatio,
                }));
            } else {
                // Normal scaling based on designSize
                setTransform(prev => ({
                    ...prev,
                    width: image.width,
                    height: image.height,
                    scaleX: scale * (designSize / 100),
                    scaleY: scale * (designSize / 100),
                }));
            }

            if (imageRef.current && transformerRef.current) {
                const layer = transformerRef.current.getLayer();
                transformerRef.current.nodes([imageRef.current]);
                if (layer) {
                    layer.batchDraw();
                }
            }
            setIsSelected(true);
        }
    }, [image, printableArea, designSize, isFullFront]);

    useEffect(() => {
        if (initialScale && image) {
            // If in Full Front mode, calculate the scale directly to cover the printable area
            if (isFullFront) {
                const widthRatio = printableArea.width / image.width;
                const heightRatio = printableArea.height / image.height;
                const coverRatio = Math.min(widthRatio, heightRatio);

                setTransform(prev => ({
                    ...prev,
                    rotation: designRotation,
                    scaleX: coverRatio,
                    scaleY: coverRatio,
                }));
            } else {
                // Normal scaling
                setTransform(prev => ({
                    ...prev,
                    rotation: designRotation,
                    scaleX: initialScale * (designSize / 100),
                    scaleY: initialScale * (designSize / 100),
                }));
            }
        }
    }, [designSize, designRotation, initialScale, image, printableArea, isFullFront]);

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

    // Update useEffect to handle image selection
    useEffect(() => {
        if (image && isImageSelected) {
            setIsSelected(true);
            setSelectedType('image');
            if (imageRef.current && transformerRef.current) {
                transformerRef.current.nodes([imageRef.current]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }
    }, [image, isImageSelected]);

    // Update click handler to manage image selection
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        const clickedOnEmpty = e.target === e.target.getStage();
        if (clickedOnEmpty) {
            setIsSelected(false);
            setSelectedType(null);
            setSelectedId(null);
            onImageDeselect?.();
            if (onTextSelect) {
                onTextSelect('');
            }
        }
    };

    const handleImageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true;
        setIsSelected(true);
        setSelectedType('image');
        setSelectedId(null);
        onImageSelect?.();
        if (onTextSelect) {
            onTextSelect('');
        }
    };

    // Update text selection handler
    const handleTextSelect = (id: string, e: Konva.KonvaEventObject<MouseEvent | Event>) => {
        e.cancelBubble = true; // Stop event propagation
        console.log(id);
        setSelectedId(id);
        setSelectedType('text');
        setIsSelected(true);

        // Call parent's onTextSelect
        onTextSelect?.(id);
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

    // Update text elements when texts prop or printable area changes
    useEffect(() => {
        const newTextElements = texts.map((textData) => {
            // Find existing element by ID instead of index
            const existingElement = textElements.find(el => el.id === textData.id);

            // If element exists, keep its position relative to the printable area
            if (existingElement) {
                const relativeX = (existingElement.x - printableArea.left) / printableArea.width;
                const relativeY = (existingElement.y - printableArea.top) / printableArea.height;

                return {
                    ...existingElement,
                    id: textData.id,
                    text: textData.text,
                    fontSize: textData.fontSize,
                    color: textData.color,
                    x: printableArea.left + (printableArea.width * relativeX),
                    y: printableArea.top + (printableArea.height * relativeY),
                };
            }

            // For new elements, position them in the center of the printable area
            return {
                id: textData.id,
                text: textData.text,
                x: printableArea.left + printableArea.width / 2,
                y: printableArea.top + printableArea.height / 2,
                fontSize: textData.fontSize,
                color: textData.color,
                rotation: 0,
                draggable: true,
                ref: React.createRef<Konva.Text>()
            };
        });

        setTextElements(newTextElements);
    }, [texts, printableArea]);

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

    // Update useEffect to sync selectedId with selectedTextId from props
    useEffect(() => {
        if (selectedTextId && selectedTextId !== selectedId) {
            setSelectedId(selectedTextId);
            setSelectedType('text');
            setIsSelected(true);

            // Find the text element and set up the transformer
            const textElement = textElements.find(el => el.id === selectedTextId);
            if (textElement && textElement.ref.current && transformerRef.current) {
                transformerRef.current.nodes([textElement.ref.current]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        }
    }, [selectedTextId, textElements]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        setPosition: (x: number, y: number) => {
            if (imageRef.current) {
                setTransform(prev => ({
                    ...prev,
                    x,
                    y
                }));

                // Update the image position
                imageRef.current.x(x);
                imageRef.current.y(y);

                // Redraw the layer
                imageRef.current.getLayer()?.batchDraw();
            }
        },
        getImageDimensions: () => {
            if (image) {
                return {
                    width: transform.width,
                    height: transform.height,
                    scaleX: transform.scaleX,
                    scaleY: transform.scaleY
                };
            }
            return null;
        },
        getPosition: () => {
            if (imageRef.current) {
                return {
                    x: transform.x,
                    y: transform.y
                };
            }
            return null;
        }
    }));

    return (
        <Stage
            ref={stageRef}
            width={500}
            height={500}
            style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                transform: 'none',
            }}
            onClick={handleStageClick}
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
                            onClick={handleImageClick}
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
});

export default DesignCanvas; 