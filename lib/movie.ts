import { createFrame } from "./frame";
import { IFrame, IListItem, IMovie, IRenderedFrameHeight } from "./interface";

export function createMovie(
  assumedHeight: number,
  data: IListItem[],
  renderedFrameHeights?: IRenderedFrameHeight
): IMovie {
  const frameList = data.reduce((accframes: IFrame[], currentItem) => {
    const currentId = currentItem.id;

    accframes.push(
      createFrame({
        content: currentItem,
        id: currentItem.id,
        rect: {
          height:
            renderedFrameHeights && renderedFrameHeights[currentId] ? renderedFrameHeights[currentId] : assumedHeight,
          left: 0,
          top: accframes.length === 0 ? 0 : accframes[accframes.length - 1].rect.bottom,
          width: 0
        }
      })
    );

    return accframes;
  }, []);

  return {
    assumedHeight,
    frameList
  };
}

export function getTotalHeight(movie: IMovie): number {
  const frameList = movie.frameList;
  return frameList[frameList.length - 1].rect.bottom - frameList[0].rect.top;
}

class MovieError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MovieError";
  }
}
