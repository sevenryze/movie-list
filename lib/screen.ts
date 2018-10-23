import { IMovie, IPoint, IRectangle, IScreen } from "./interface";
import { createRectangle } from "./rectangle";

/**
 * Get screen object, related to movie origin.
 *
 * @param screenWorldRect Screen coordinates related to world
 * @param movieWorldRect Movie coordinates related to world
 */
export function createScreenRelativeToMovie(screenWorldRect: IRectangle, movieWorldRect: IRectangle): IScreen {
  return {
    rectRelativeToMovie: createRectangle({
      height: screenWorldRect.height,
      left: screenWorldRect.left - movieWorldRect.left,
      top: screenWorldRect.top - movieWorldRect.top,
      width: screenWorldRect.width
    }),
    rectRelativeToWorld: screenWorldRect
  };
}

export function project(options: { screen: IScreen; movie: IMovie; bufferRatio: number }) {
  const { movie, bufferRatio, screen } = options;
  const frameList = movie.frameList;

  const bufferHeight = screen.rectRelativeToMovie.height * bufferRatio;

  // The range that is to rendering.
  // TODO: Support horizonzal scroll and render.
  const renderRectTop = screen.rectRelativeToMovie.top - bufferHeight;
  const renderRectBottom = screen.rectRelativeToMovie.bottom + bufferHeight;

  let startIndex = frameList.findIndex(frame => frame.rect.bottom > renderRectTop);
  if (startIndex < 0) {
    startIndex = frameList.length - 1;
  }

  let endIndex = frameList.findIndex(frame => frame.rect.bottom >= renderRectBottom);
  if (endIndex < 0) {
    // Array.slice(start, end), `end` NOT included
    endIndex = frameList.length;
  }

  return {
    sliceEnd: endIndex,
    sliceStart: startIndex
  };
}
