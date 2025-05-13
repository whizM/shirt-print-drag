export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ImageConfig {
  url: string;
  position: Position;
  size: Size;
  initialSize: Size;
}