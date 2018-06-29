import { Frame } from "./frame";
import { Rectangle } from "./module/rectangle";

export class Movie {
  public frameList: Frame[] = [];
  public assumedHeight = 0;

  constructor(list: any[]) {
    list.forEach(item => {
      let frame = new Frame(item);

      this.frameList.push(frame);
    });
  }

  get height(): number {
    let frameLength = this.frameList.length;

    if (frameLength === 0) {
      return 0;
    }
    return (
      this.frameList[frameLength - 1].rect.getBottom() -
      this.frameList[0].rect.getTop()
    );
  }

  /**
   * 更新帧的高度
   *
   * @param heights 索引和实际高度的映射对象
   * @returns {number} 高度差值
   */
  public updateHeights = (heights: { [index: number]: number }) => {
    const heightError = Object.keys(heights).reduce(
      (acc: number, currentValue: string) => {
        let key = Number.parseInt(currentValue);

        let frame = this.frameList[key];
        let frameHeight = frame.rect.getHeight();

        let projectedValue =
          frameHeight === 0 ? this.assumedHeight : frameHeight;

        let actualValue = heights[key];

        if (projectedValue !== actualValue) {
          frame.rect = new Rectangle({
            top: frame.rect.getTop(),
            height: actualValue,
            left: frame.rect.getLeft(),
            width: frame.rect.getWidth()
          });

          return acc + actualValue - projectedValue;
        } else {
          return acc;
        }
      },
      0
    );

    return heightError;
  };
}
