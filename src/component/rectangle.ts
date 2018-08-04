export interface IRectangle {
  top: number;
  left: number;
  height: number;
  width: number;
  bottom: number;
  right: number;
}

export function createRectangle(options: {
  top: number;
  left: number;
  height: number;
  width: number;
}): IRectangle {
  return {
    top: options.top,
    left: options.left,
    height: options.height,
    width: options.width,
    bottom: options.top + options.height,
    right: options.left + options.width
  };
}
