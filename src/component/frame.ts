import { Rectangle } from "./module/rectangle";

export class Frame {
  public rect: Rectangle;

  public content: object;

  constructor(content: object, rect: Rectangle = new Rectangle()) {
    this.content = content;
    this.rect = rect;
  }
}
