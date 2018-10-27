import { IFrame, IListItem } from "./interface";
import { createRectangle } from "./rectangle";

export function createFrame(options: {
  content: IListItem;
  id: string;
  rect: {
    top: number;
    left: number;
    height: number;
    width: number;
  };
}): IFrame {
  return {
    content: options.content,
    id: options.id,
    rect: createRectangle({ ...options.rect })
  };
}
