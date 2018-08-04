/**
 * 计算当前渲染帧在新列表中的位置，返回新的位置。
 *
 * 新的帧添加在胶片后部时，对当前渲染帧的位置是没有影响的。
 * 而添加到胶片的前部时，我们需要更新当前渲染帧的索引以反映其在新列表中的位置，防止跳跃。
 *
 * @returns 当前渲染帧的新位置
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

  // 在old film之前添加frames
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
