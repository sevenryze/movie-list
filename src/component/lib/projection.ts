import { Rectangle } from "./rectangle";
import { findIndex } from "./find-index";

/**
 * 在给定的数据项集合、胶片矩形表和渲染矩形下，计算应该渲染哪些数据项。
 */
export function projection(options: {
  list: { id: string }[];
  screenRect: Rectangle;
  frameRectMap: {
    [id: string]: Rectangle;
  };
  // 缓冲区高度 / 屏幕高度
  bufferRatio?: number;
}) {
  const { frameRectMap, screenRect, list, bufferRatio = 0.5 } = options;

  const bufferHeight = screenRect.getHeight() * bufferRatio;

  /**
   * 渲染范围
   */
  const renderRectTop = screenRect.getTop() - bufferHeight;
  const renderRectBottom = screenRect.getBottom() + bufferHeight;

  let startIndex = findIndex(
    list,
    item => frameRectMap[item.id].getBottom() > renderRectTop
  );
  if (startIndex < 0) {
    startIndex = list.length - 1;
  }

  let endIndex = findIndex(
    list,
    item => frameRectMap[item.id].getTop() >= renderRectBottom,
    startIndex
  );
  if (endIndex < 0) {
    endIndex = list.length;
  }

  // 获得填充留白的高度
  let blankSpaceAbove =
    list.length <= 0
      ? 0
      : frameRectMap[list[startIndex].id].getTop() -
        frameRectMap[list[0].id].getTop();

  let blankSpaceBelow =
    endIndex >= list.length
      ? 0
      : frameRectMap[list[list.length - 1].id].getBottom() -
        frameRectMap[list[endIndex].id].getBottom();

  return {
    sliceStart: startIndex,
    sliceEnd: endIndex,
    blankSpaceAbove,
    blankSpaceBelow
  };
}
