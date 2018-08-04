import { createRectangle, IRectangle } from "./module/rectangle";

export interface IFrame {
  rect: IRectangle;
  content: object;
}

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
