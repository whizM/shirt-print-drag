import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { Stage, Layer, Transformer, Rect, Text } from 'react-konva';
import Konva from 'konva';
import ImageLayer from './ImageLayer';

interface DesignCanvasProps {
    images: Array<{
        id: string;
        url: string;
        size: number;
        rotation: number;
        x: number;
        y: number;
    }>;
    printableArea: {
        top: number;
        left: number;
        width: number;
        height: number;
    };
    selectedImageId: string | null;
    onImageSelect: (id: string) => void;
    onImageUpdate: (id: string, updates: Partial<{ size: number; rotation: number; x: number; y: number }>) => void;
    texts: Array<{
        id: string;
        text: string;
        fontSize: number;
        color: string;
        x?: number;
        y?: number;
        rotation?: number;
    }>;
    onTextSelect?: (id: string) => void;
    selectedTextId?: string | null;
    onTextUpdate?: (id: string, updates: Partial<{ text: string; fontSize: number; color: string; x: number; y: number; rotation: number }>) => void;
}

// Add ref type
export interface DesignCanvasRef {
    setPosition: (x: number, y: number) => void;
    getImageDimensions: () => { width: number; height: number; scaleX: number; scaleY: number } | null;
    getPosition: () => { x: number; y: number } | null;
}

// Update to use forwardRef
const DesignCanvas = forwardRef<DesignCanvasRef, DesignCanvasProps>(({
    images,
    printableArea,
    selectedImageId,
    onImageSelect,
    onImageUpdate,
    texts,
    onTextSelect,
    selectedTextId,
    onTextUpdate
}, ref) => {
    const stageRef = useRef<Konva.Stage>(null);
    const imageRefs = useRef<{ [key: string]: Konva.Image | null }>({});
    const textRefs = useRef<{ [key: string]: Konva.Text | null }>({});
    const transformerRef = useRef<Konva.Transformer>(null);

    // Update transformer when selection changes
    useEffect(() => {
        if (!transformerRef.current) return;

        if (selectedTextId) {
            // If text is selected, attach transformer to text
            const textNode = textRefs.current[selectedTextId];
            if (textNode) {
                transformerRef.current.nodes([textNode]);
                transformerRef.current.getLayer()?.batchDraw();
            }
        } else {
            // Clear transformer if nothing is selected
            transformerRef.current.nodes([]);
            transformerRef.current.getLayer()?.batchDraw();
        }
    }, [selectedTextId]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
        setPosition: (x: number, y: number) => {
            if (selectedImageId) {
                // Update the position of the selected image
                onImageUpdate(selectedImageId, { x, y });
            }
        },
        getImageDimensions: () => {
            if (selectedImageId) {
                const selectedImage = images.find(img => img.id === selectedImageId);
                if (selectedImage) {
                    const img = document.createElement('img');
                    img.src = selectedImage.url;

                    return {
                        width: img.width || 100,
                        height: img.height || 100,
                        scaleX: selectedImage.size / 100,
                        scaleY: selectedImage.size / 100
                    };
                }
            }
            return null;
        },
        getPosition: () => {
            if (selectedImageId) {
                const selectedImage = images.find(img => img.id === selectedImageId);
                if (selectedImage) {
                    return {
                        x: selectedImage.x,
                        y: selectedImage.y
                    };
                }
            }
            return null;
        }
    }));

    const handleTextDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
        if (onTextUpdate) {
            onTextUpdate(id, {
                x: e.target.x(),
                y: e.target.y()
            });
        }
    };

    const handleTextTransform = (id: string) => {
        const textNode = textRefs.current[id];
        if (textNode && onTextUpdate) {
            onTextUpdate(id, {
                x: textNode.x(),
                y: textNode.y(),
                fontSize: textNode.fontSize() * textNode.scaleX(),
                rotation: textNode.rotation()
            });

            // Reset scale to prevent double scaling
            textNode.scaleX(1);
            textNode.scaleY(1);
        }
    };

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
        >
            <Layer>
                {images.map(image => (
                    <ImageLayer
                        key={image.id}
                        ref={(node) => {
                            imageRefs.current[image.id] = node;
                        }}
                        imageUrl={image.url}
                        x={image.x}
                        y={image.y}
                        size={image.size}
                        rotation={image.rotation}
                        isSelected={selectedImageId === image.id}
                        onSelect={() => onImageSelect(image.id)}
                        onChange={(newAttrs) => onImageUpdate(image.id, newAttrs)}
                    />
                ))}

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
                {texts.map((el) => (
                    <Text
                        key={el.id}
                        ref={(node) => {
                            textRefs.current[el.id] = node;
                        }}
                        text={el.text}
                        x={el.x || printableArea.left + printableArea.width / 2}
                        y={el.y || printableArea.top + printableArea.height / 2}
                        fontSize={el.fontSize}
                        fill={el.color}
                        rotation={el.rotation || 0}
                        draggable
                        offsetX={el.text.length * el.fontSize / 4}
                        offsetY={el.fontSize / 2}
                        onClick={() => onTextSelect && onTextSelect(el.id)}
                        onTap={() => onTextSelect && onTextSelect(el.id)}
                        onDragEnd={(e) => handleTextDragEnd(e, el.id)}
                        onTransformEnd={() => handleTextTransform(el.id)}
                    />
                ))}

                {/* Transformer for text elements */}
                <Transformer
                    ref={transformerRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        // Limit minimum size
                        if (newBox.width < 10 || newBox.height < 10) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                    enabledAnchors={['middle-left', 'middle-right']}
                    rotateEnabled={true}
                    keepRatio={false}
                />
            </Layer>
        </Stage>
    );
});

export default DesignCanvas; 