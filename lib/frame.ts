import { IFrame } from "./interface";
import { createRectangle } from "./rectangle";

export function createFrame(options: {
  content: object;
  rect: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
}): IFrame {
  return {
    content: options.content,
    rect: createRectangle({ ...options.rect })
  };
}
