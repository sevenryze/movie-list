import { IRectangle, createRectangle } from "./rectangle";
import { IMovie } from "./movie";

export interface IPoint {
  top: number;
  left: number;
}

export interface IScreen {
  rectRelativeToWorld: IRectangle;
  rectRelativeToMovie: IRectangle;
}

/**
 * 相对于影片的原点，计算screen的位置。
 * 即：获得当前屏幕投影到了影片的哪个位置。
 *
 * 世界坐标系为client坐标系
 *
 * @param worldRect 相对于世界坐标系的屏幕对象
 * @param movieOrigin 相对于世界坐标系的原点
 */
export function createScreenRelativeToMovie(
  worldRect: {
    top: number;
    left: number;
    height: number;
    width: number;
  },
  movieOrigin: IPoint
): IScreen {
  return {
    rectRelativeToWorld: createRectangle(worldRect),
    rectRelativeToMovie: createRectangle({
      top: worldRect.top - movieOrigin.top,
      left: 0,
      height: worldRect.height,
      width: worldRect.width
    })
  };
}

export function project(options: {
  screen: IScreen;
  movie: IMovie;
  bufferRatio: number;
}) {
  const { movie, bufferRatio, screen } = options;
  const frameList = movie.frameList;

  const bufferHeight = screen.rectRelativeToMovie.height * bufferRatio;

  // 渲染rect范围
  const renderRectTop = screen.rectRelativeToMovie.top - bufferHeight;
  const renderRectBottom = screen.rectRelativeToMovie.bottom + bufferHeight;

  let startIndex = frameList.findIndex(
    frame => frame.rect.bottom > renderRectTop
  );
  if (startIndex < 0) {
    startIndex = frameList.length - 1;
  }

  let endIndex = frameList.findIndex(
    frame => frame.rect.top >= renderRectBottom
  );
  if (endIndex < 0) {
    endIndex = frameList.length;
  }

  return {
    sliceStart: startIndex,
    sliceEnd: endIndex
  };
}
