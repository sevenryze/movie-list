import { findIndex } from "./find-index";

function searchIndexWhen(list, initSearchIndex, predicator) {
  if (initSearchIndex < 0 || initSearchIndex >= list.length) {
    return -1;
  }

  if (predicator(list[initSearchIndex])) {
    return initSearchIndex;
  }

  for (let step = 1; ; step++) {
    const back = initSearchIndex - step;
    const forward = initSearchIndex + step;
    const illegal = back < 0;
    const outOfBound = forward >= list.length;
    if (illegal && outOfBound) {
      break;
    }
    if (!outOfBound && predicator(list[forward])) {
      return forward;
    }

    if (!illegal && predicator(list[back])) {
      return back;
    }
  }

  return -1;
}

// 找到旧列表和新列表的交界处, 主要是判断是prefix还是append原始的列表
export function findNewSlice(originList, newList, sliceStart, sliceEnd) {
  const newIds = newList.reduce((ids, item) => {
    ids[item.id] = true;
    return ids;
  }, {});

  const commonItemIndex = searchIndexWhen(
    originList,
    sliceStart,
    item => newIds[item.id]
  );
  if (-1 === commonItemIndex) {
    return null;
  }

  const newSliceStart = findIndex(
    newList,
    item => originList[commonItemIndex].id === item.id
  );

  return {
    sliceStart: newSliceStart,
    sliceEnd: Math.min(newList.length, newSliceStart + sliceEnd - sliceStart)
  };
}

/**
 * 计算当前渲染帧在新列表中的位置，返回新的位置。
 *
 * 新的帧添加在胶片后部时，对当前渲染帧的位置是没有影响的。
 * 而添加到胶片的前部时，我们需要更新当前渲染帧的索引以反映其在新列表中的位置，防止跳跃。
 *
 * @returns {{start: number; end: number}} 当前渲染帧的新位置
 * @param options 当前渲染帧的索引范围和新添加帧的索引范围
 */
export function mapOldFrameIndexIntoNewFilm(options: {
  // 当前渲染帧的起始索引
  currentFrameStart: number;
  // 当前渲染帧的终止索引（不包含）
  currentFrameEnd: number;
  newFrameStart: number;
  newFrameEnd: number;
}) {
  let {
    newFrameEnd,
    newFrameStart,
    currentFrameEnd,
    currentFrameStart
  } = options;

  const currentFrameLength = currentFrameEnd - currentFrameStart;

  let slice = {
    start: 0,
    end: 0
  };

  // 在老film之前添加frames
  if (newFrameStart === 0) {
    slice.start = newFrameEnd + currentFrameStart;
    slice.end = slice.start + currentFrameLength;
  }
  // 在old film之后添加frames
  else {
    slice.start = currentFrameStart;
    slice.end = currentFrameEnd;
  }

  return slice;
}
