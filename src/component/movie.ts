import { IFrame, createFrame } from "./frame";
import { createRectangle } from "./module/rectangle";

export interface IMovie {
  frameList: IFrame[];
  assumedHeight: number;
}

export function createMovie(assumedHeight: number): IMovie {
  return {
    assumedHeight: assumedHeight,
    frameList: []
  };
}

/**
 * 更新movie对象的尺寸
 *
 * TODO: 这个函数会改变传入的movie的属性，也许会有一个没有side-effect的设计？
 *
 * @param movie 影片对象
 * @param renderedHeights 实际渲染的高度map
 */
export function updateFrameHeights(
  movie: IMovie,
  renderedHeights: Record<number, number>
): number {
  const heightError = movie.frameList.reduce(
    (errorAcc, currentFrame, currentIndex) => {
      let tmpAcc = errorAcc;
      let height = currentFrame.rect.height;

      if (renderedHeights[currentIndex]) {
        height = renderedHeights[currentIndex];

        const currentError =
          renderedHeights[currentIndex] - currentFrame.rect.height;

        tmpAcc = errorAcc + currentError;
      }

      currentFrame.rect = createRectangle({
        top:
          currentIndex === 0
            ? 0
            : movie.frameList[currentIndex - 1].rect.bottom,
        height: height,
        left: 0,
        width: 0
      });

      return tmpAcc;
    },
    0
  );

  return heightError;
}

function getTotalHeight(movie: IMovie): number {
  const frameList = movie.frameList;
  return frameList[frameList.length - 1].rect.bottom - frameList[0].rect.top;
}

export function prefixFrames(movie: IMovie, data: any[]): IMovie {
  if (!Array.isArray(data)) {
    throw new MovieError("新添加的列表数据必须为数据类型");
  }

  let newMovie = createMovie(movie.assumedHeight);

  let prefixFrames = [];

  data.reduce((top, currentItem) => {
    const frame = createFrame({
      content: currentItem,
      rect: {
        top: top,
        height: newMovie.assumedHeight,
        left: 0,
        width: 0
      }
    });

    prefixFrames.push(frame);

    return top + newMovie.assumedHeight;
  }, 0);

  newMovie.frameList = prefixFrames.concat(movie.frameList);

  return newMovie;
}

export function appendFrames(movie: IMovie, data: any[]): IMovie {
  if (!Array.isArray(data)) {
    throw new MovieError("新添加的列表数据必须为数据类型");
  }

  let newMovie = createMovie(movie.assumedHeight);

  let appendFrames = [];

  data.reduce((top, currentItem) => {
    const frame = createFrame({
      content: currentItem,
      rect: {
        top: top,
        height: newMovie.assumedHeight,
        left: 0,
        width: 0
      }
    });

    appendFrames.push(frame);

    return top + newMovie.assumedHeight;
  }, movie.frameList.length === 0 ? 0 : movie.frameList[movie.frameList.length - 1].rect.bottom);

  newMovie.frameList = movie.frameList.concat(appendFrames);

  return newMovie;
}

class MovieError extends Error {
  constructor(message) {
    super(message);
    this.name = "MovieError";
  }
}
