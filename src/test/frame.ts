import { Rectangle } from "./module/rectangle";

export class Frame {
  public rect: Rectangle = new Rectangle();

  public content;

  constructor(content: object) {
    this.content = content;
  }
}
