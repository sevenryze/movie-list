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
 * Update the height of frame with the actual rendered height.
 *
 * @param movie The movie object
 * @param renderedHeights Rendered height map
 * @returns The height error and new updated movie object
 */
export function updateFrameHeights(
  movie: IMovie,
  renderedHeights: Record<number, number>
): { heightError: number; newMovie: IMovie } {
  const result = movie.frameList.reduce(
    (acc: { heightError: number; newFrames: IFrame[] }, currentFrame, currentIndex) => {
      let currentHeight = currentFrame.rect.height;

      if (renderedHeights[currentIndex]) {
        currentHeight = renderedHeights[currentIndex];

        const currentError = currentHeight - currentFrame.rect.height;

        acc.heightError = acc.heightError + currentError;
      }

      acc.newFrames.push(
        createFrame({
          content: currentFrame.content,
          rect: {
            height: currentHeight,
            left: 0,
            top: currentIndex === 0 ? 0 : acc.newFrames[currentIndex - 1].rect.bottom,
            width: 0
          }
        })
      );

      return acc;
    },
    {
      heightError: 0,
      newFrames: []
    }
  );

  const newMovie = createMovie(movie.assumedHeight);

  newMovie.frameList = result.newFrames;

  return {
    heightError: result.heightError,
    newMovie
  };
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

  const newFrames = data.reduce((accframes: IFrame[], currentItem) => {
    function getTop() {
      if (accframes.length === 0) {
        return type === "prefix" || oldMovie.frameList.length === 0
          ? 0
          : oldMovie.frameList[oldMovie.frameList.length - 1].rect.bottom;
      } else {
        return accframes[accframes.length - 1].rect.bottom;
      }
    }

    accframes.push(
      createFrame({
        content: currentItem,
        rect: {
          height: oldMovie.assumedHeight,
          left: 0,
          top: getTop(),
          width: 0
        }
      })
    );

    return accframes;
  }, []);

  newMovie.frameList = type === "prefix" ? newFrames.concat(oldMovie.frameList) : oldMovie.frameList.concat(newFrames);

  return newMovie;
}
