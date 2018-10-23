import { IRectangle } from "./interface";

export function createRectangle(options: { top: number; left: number; height: number; width: number }): IRectangle {
  return {
    bottom: options.top + options.height,
    height: options.height,
    left: options.left,
    right: options.left + options.width,
    top: options.top,
    width: options.width
  };
}
