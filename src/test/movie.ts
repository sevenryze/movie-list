import { Frame } from "./frame";
import { Rectangle } from "./module/rectangle";

export class Movie {
  public frameList: Frame[] = [];
  public readonly assumedHeight: number;

  constructor(options: { assumedHeight: number }) {
    this.assumedHeight = options.assumedHeight;
  }

/*  get height(): number {
    let frameLength = this.frameList.length;

    if (frameLength === 0) {
      return 0;
    }
    return (
      this.frameList[frameLength - 1].rect.getBottom() -
      this.frameList[0].rect.getTop()
    );
  }*/

  /**
   * 更新帧的高度
   *
   * @param renderedHeights 索引和实际高度的映射对象
   * @returns 高度差值
   */
  public updateFrameHeights = (renderedHeights: Record<number, number>) => {
    const heightError = this.frameList.reduce(
      (acc, currentFrame, currentIndex) => {
        let tmpAcc = acc;
        let height = currentFrame.rect.getHeight();

        if (renderedHeights[currentIndex]) {
          height = renderedHeights[currentIndex];
          tmpAcc =
            acc + renderedHeights[currentIndex] - currentFrame.rect.getHeight();
        }

        currentFrame.rect = new Rectangle({
          height: height,
          top:
            currentIndex === 0
              ? 0
              : this.frameList[currentIndex - 1].rect.getBottom()
        });

        return tmpAcc;
      },
      0
    );

    return heightError;
  };

  /**
   * 在电影前添加新的帧
   *
   * @param data 新的数据列表
   * @returns 新的movie实例
   */
  public prefixFrameList = (data: any[]) => {
    if (!Array.isArray(data)) {
      return;
    }

    let newMoive = new Movie({
      assumedHeight: this.assumedHeight
    });

    let prefixFrames = [];

    data.reduce((top, currentItem) => {
      let frame = new Frame(
        currentItem,
        new Rectangle({ top: top, height: this.assumedHeight })
      );

      prefixFrames.push(frame);

      return top + this.assumedHeight;
    }, 0);

    newMoive.frameList = prefixFrames.concat(this.frameList);

    return newMoive;
  };

  public appendFrameList = (data: any[]) => {
    if (!Array.isArray(data)) {
      return;
    }

    let newMovie = new Movie({
      assumedHeight: this.assumedHeight
    });

    let appendFrames = [];

    data.reduce((top, currentItem) => {
      let frame = new Frame(
        currentItem,
        new Rectangle({ top: top, height: this.assumedHeight })
      );

      appendFrames.push(frame);

      return top + this.assumedHeight;
    }, this.frameList.length === 0 ? 0 : this.frameList[this.frameList.length - 1].rect.getBottom());

    newMovie.frameList = this.frameList.concat(appendFrames);

    return newMovie;
  };
}
