import { Rectangle } from "../module/rectangle";
import { Frame } from "../controller";

/**
 * 在给定的数据项集合、胶片矩形表和渲染矩形下，计算应该渲染哪些数据项。
 */
export function projection(options: {
  screenRect: Rectangle;
  frameList: Frame[];
  // 缓冲区高度 / 屏幕高度
  bufferHeightRatio: number;
}) {
  const { frameList, screenRect, bufferHeightRatio } = options;

  const bufferHeight = screenRect.getHeight() * bufferHeightRatio;

  /**
   * 渲染范围
   */
  const renderRectTop = screenRect.getTop() - bufferHeight;
  const renderRectBottom = screenRect.getBottom() + bufferHeight;

  let startIndex = frameList.findIndex(
    frame => frame.rect.getBottom() > renderRectTop
  );
  if (startIndex < 0) {
    startIndex = frameList.length - 1;
  }

  let endIndex = frameList.findIndex(
    frame => frame.rect.getTop() >= renderRectBottom
  );
  if (endIndex < 0) {
    endIndex = frameList.length;
  }

  return {
    sliceStart: startIndex,
    sliceEnd: endIndex
  };
}
