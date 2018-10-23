import { createFrame } from "./frame";
import { IFrame, IMovie } from "./interface";
import { createRectangle } from "./rectangle";

export function createMovie(assumedHeight: number): IMovie {
  return {
    assumedHeight,
    frameList: []
  };
}

/**
 * 更新movie对象中帧的尺寸
 *
 * TODO: 这个函数会改变传入的movie的属性，也许会有一个没有side-effect的设计？
 *
 * @param movie 影片对象
 * @param renderedHeights 实际渲染的高度map
 */
export function updateFrameHeights(movie: IMovie, renderedHeights: Record<number, number>): number {
  const heightError = movie.frameList.reduce((errorAcc, currentFrame, currentIndex) => {
    let tmpAcc = errorAcc;
    let height = currentFrame.rect.height;

    if (renderedHeights[currentIndex]) {
      height = renderedHeights[currentIndex];

      const currentError = renderedHeights[currentIndex] - currentFrame.rect.height;

      tmpAcc = errorAcc + currentError;
    }

    currentFrame.rect = createRectangle({
      height,
      left: 0,
      top: currentIndex === 0 ? 0 : movie.frameList[currentIndex - 1].rect.bottom,
      width: 0
    });

    return tmpAcc;
  }, 0);

  return heightError;
}

export function getTotalHeight(movie: IMovie): number {
  const frameList = movie.frameList;
  return frameList[frameList.length - 1].rect.bottom - frameList[0].rect.top;
}

/**
 * Format new data as frames and add these frames at the begin of movie.
 *
 * // TODO: 暂时不支持基于anchor的scrollbar调整。因此添加数据到影片前方会导致滚动条有些许抖动。
 *
 * @param movie The old movie object
 * @param data New data array
 * @returns The new moive object with new data added
 */
export function prefixFrames(movie: IMovie, data: any[]): IMovie {
  if (!Array.isArray(data)) {
    throw new MovieError("The new data must be Array type");
  }

  return addFramesToMoive("prefix", movie, data);
}

/**
 * Format new data as frames and append these frames to the end of movie.
 *
 * @param movie The old movie object
 * @param data New data array
 * @returns The new moive object with new data appended
 */
export function appendFrames(movie: IMovie, data: any[]): IMovie {
  if (!Array.isArray(data)) {
    throw new MovieError("The new data must be Array type");
  }

  return addFramesToMoive("append", movie, data);
}

class MovieError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MovieError";
  }
}

function addFramesToMoive(type: "prefix" | "append", oldMovie: IMovie, data: any[]) {
  const newMovie = createMovie(oldMovie.assumedHeight);

  const newFrames = data.reduce((frames: IFrame[], currentItem) => {
    const frame = createFrame({
      content: currentItem,
      rect: {
        height: oldMovie.assumedHeight,
        left: 0,
        top: frames.length === 0 ? 0 : frames[frames.length - 1].rect.bottom,
        width: 0
      }
    });

    frames.push(frame);

    return frames;
  }, type === "prefix" ? [] : oldMovie.frameList);

  if (type === "prefix") {
    newMovie.frameList = newFrames.concat(oldMovie.frameList);
  } else {
    newMovie.frameList = oldMovie.frameList.concat(newFrames);
  }

  return newMovie;
}
