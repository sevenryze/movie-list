function findAnchor(prevPos, nextPos) {
  const viewportRect = prevPos.getScreenRect();

  const findBest = (list, comparator) => {
    if (list.length <= 0) {
      return null;
    }

    /**
     * 遍历列表，打擂台法更新best
     */
    return list.reduce((best, item) => {
      /**
       * 比较器，比较哪个离viewport的top更近一点，哪个就是anchor
       */
      return comparator(item, best) > 0 ? item : best;
    });
  };

  const inViewport = rect => rect && rect.doesIntersectWith(viewportRect);

  /**
   * 计算数据项矩形的top到当前viewport的距离
   */
  const distanceToViewportTop = rect => {
    return rect ? Math.abs(viewportRect.getTop() - rect.getTop()) : 1 / 0;
  };

  /**
   * 如果新的数据项矩形没有与viewport干涉而best项干涉，就选择best项。
   * 反之亦然。
   * 如果都干涉，就返回0（相等），然后交给numberCompartor比较。
   */
  const boolCompartor = (getValue, a, b) => {
    const aResult = getValue(a);
    const bResult = getValue(b);

    if (aResult && !bResult) {
      return 1;
    } else if (!aResult && bResult) {
      return -1;
    } else {
      return 0;
    }
  };

  /**
   * 简单的比大小
   */
  const numberCompartor = (getValue, a, b) => {
    const aResult = getValue(a);
    const bResult = getValue(b);

    return bResult - aResult;
  };

  // 得到两次投影均渲染的帧列表
  const bothRendered = nextPos.getFrameList().filter(item => {
    const id = item.id;
    return prevPos.isRendered(id) && nextPos.isRendered(id);
  });

  if (bothRendered.length <= 0) {
    return null;
  }

  const theBest = findBest(bothRendered, (current, best) => {
    const item = prevPos.getFrameRectBy(current.id);
    const bestItem = prevPos.getFrameRectBy(best.id);

    return (
      boolCompartor(inViewport, item, bestItem) ||
      numberCompartor(distanceToViewportTop, item, bestItem)
    );
  });

  return theBest;
}

/**
 * 主要解决在列表上方增加元素后，如何解决滑动位置正确显示的问题。
 *
 * 还有就是滑动的位置重建到了中间或者下方，这时候再往上滑动的时候，解决滑动条位置。
 *
 * 总之就是要修正滑动条的位置
 */
export function offsetCorrection(prevPos, nextPos) {
  const anchor = findAnchor(prevPos, nextPos);

  // 如果没有anchor，则说明没有没有假设和实际高度的差别。
  if (!anchor) {
    return 0;
  }

  const anchorId = anchor.id;

  const offsetToViewport =
    prevPos.getFrameRectBy(anchorId).getTop() -0
    //prevPos.getScreenRect().getTop();

  //console.log(`offsetToViewport: ${offsetToViewport}`);
  console.log(
    `prevFrameTop: ${prevPos
      .getFrameRectBy(anchorId)
      .getTop()}, screenTop: ${prevPos
      .getScreenRect()
      .getTop()}, offset: ${offsetToViewport}`
  );

  const nextOffsetToViewport =
    nextPos.getFrameRectBy(anchorId).getTop() -0
    //nextPos.getScreenRect().getTop();

  //console.log(`nextOffsetToViewport: ${nextOffsetToViewport}`);
  console.log(
    `nextFrameTop: ${nextPos
      .getFrameRectBy(anchorId)
      .getTop()}, screenTop: ${nextPos
      .getScreenRect()
      .getTop()}, offset: ${nextOffsetToViewport}`
  );

  console.log(`offset: ${nextOffsetToViewport - offsetToViewport}`);

  return nextOffsetToViewport - offsetToViewport;
}