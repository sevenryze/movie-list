import * as React from "react";
import throttle from "lodash.throttle";
import { requestAnimationFrame } from "./lib/rAF";
import { List, HeightMap } from "./list";
import { createScheduler } from "./lib/schedule";
import { mapOldFrameIndexIntoNewFilm } from "./lib/find-new-slice";
import { Snapshot } from "./module/snapshot";
import { Rectangle } from "./module/rectangle";
import { offsetCorrection } from "./lib/offset-adjust";
import { projection } from "./lib/projection";
import { Screen } from "./module/screen";

export interface DataItem {
  id: string;
  content: any;
}

export interface Frame {
  id: string;
  rect: Rectangle;
  content: any;
}

export class Controller extends React.PureComponent<
  {
    list: DataItem[];
    itemRenderer: Function;
    onSnapshotUpdate?: Function;
    assumedItemHeight: number;

    // 用户可视屏幕
    screen: Screen;

    // Buffer height / Screen height
    bufferHeightRatio: number;

    // 新添加frame data的起始位置
    newDataSliceStart: number;
    newDataSliceEnd: number;
  },
  {
    // 渲染的数据项片段的起始索引
    renderSliceStart: number; // 渲染的数据项片段的结束索引
    renderSliceEnd: number;
  }
> {
  state = {
    renderSliceStart: 0,
    renderSliceEnd: 0
  };

  /**
   * 缓存的高度表，记录所有已经渲染过的数据项的高度。
   *
   * 包含已渲染但被滑动出屏幕的数据项。
   *
   * 使用数据项的`id`作为其高度的索引.
   */
  private _renderedHeightCache: HeightMap = {};

  // 创建投影和快照的调度器
  private _scheduleProjection = createScheduler(() => {
    const { list, bufferHeightRatio } = this.props;

    if (this._isUnmounted || 0 === list.length) {
      return;
    }

    const result = projection({
      screenRect: this._getScreenRect(),
      frameList: this._getFrameList(),
      bufferHeightRatio: bufferHeightRatio
    });

    console.log(
      `Projecting result: ${JSON.stringify(result)}, scrollY: ${window.scrollY}`
    );

    this._scheduleSnapshotNotification();
    this.setState({
      renderSliceStart: result.sliceStart,
      renderSliceEnd: result.sliceEnd
    });
  }, requestAnimationFrame);
  private _scheduleSnapshotNotification = createScheduler(() => {
    if (!this._isUnmounted && this.props.onSnapshotUpdate) {
      this.props.onSnapshotUpdate(this._getSnapshot());
    }
  }, requestAnimationFrame);

  private _listRef;

  private _prevSnapshot;

  /**
   * 因为采用了异步更新，如果virtualScroll已经被卸载，那么会导致找不到引用对象等错误。
   * 使用这个标志检查是否被卸载
   */
  private _isUnmounted;

  private _unlistenScroll;
  private _unlistenResize;

  /**
   * scroll到指定frame的位置
   *
   * @param index frame在文档内的索引
   */
  scrollToIndex(index) {
    const { screen } = this.props;
    const frame = this._getFrameList()[index];

    screen.scrollTo(frame.rect.getTop() + screen.getOffsetTop());
  }

  private _handleRefUpdate = ref => {
    this._listRef = ref;
  };

  /**
   * 更新高度表
   *
   * @returns {number} 实际高度和估计高度之间的误差
   * @private
   */
  private _updateHeight = (): number => {
    // 得到已渲帧的高度表
    const renderedItemHeightMap = this._listRef.getRenderedItemHeightMap();

    // 计算总体的高度误差
    const heightError = Object.keys(renderedItemHeightMap).reduce(
      (accHeight, key) => {
        const itemHeight = this._renderedHeightCache.hasOwnProperty(key)
          ? this._renderedHeightCache[key]
          : this.props.assumedItemHeight;

        return accHeight + renderedItemHeightMap[key] - itemHeight;
      },
      0
    );

    // 如果高度差值不为零，更新高度表。
    if (heightError !== 0) {
      this._renderedHeightCache = Object.assign(
        this._renderedHeightCache,
        renderedItemHeightMap
      );
    }

    return heightError;
  };

  /**
   * 矫正当前的投影，用于在投影渲染结束后矫正误差
   *
   * @param hasListChanged 数据列表是否发生变化
   * @private
   */
  private _correctProjection = hasListChanged => {
    if (!this._listRef) {
      return;
    }

    let heightError = this._updateHeight();

    console.log(`heightError: ${heightError}`);
    //if (heightError !== 0) this._scheduleProjection();

    //this.props.screen.scrollBy(heightError);

    // 矫正scrollBar的位置
    if ((hasListChanged || heightError !== 0) && this._prevSnapshot) {
      // 校正anchor的位置
      let offset = offsetCorrection(this._prevSnapshot, this._getSnapshot());

      //console.log(`scroll offset: ${offset}`);

      // 滑动到校正过的位置
      this.props.screen.scrollBy(offset);
    }

    // 如果高度差超过一个估计高，则有可能slice的范围出错，需要重新projection
    /*  if (
      hasListChanged ||
      Math.abs(heightError) >= this.props.assumedItemHeight
    ) {
      console.log(`重新投影`);
      this._scheduleProjection();
    }*/

    this._scheduleSnapshotNotification();
  };

  private _getFrameList = () => {
    let { list, assumedItemHeight } = this.props;

    let top = 0;
    const frameList: Frame[] = [];

    list.forEach(item => {
      const id = item.id;

      const height = this._renderedHeightCache[id]
        ? this._renderedHeightCache[id]
        : assumedItemHeight;

      frameList.push({
        id: id,
        rect: new Rectangle({
          top,
          height
        }),
        content: item.content
      });

      top += height;
    });

    return frameList;
  };

  private _getSnapshot() {
    const { renderSliceStart, renderSliceEnd } = this.state;

    return new Snapshot({
      screenRect: this._getScreenRect(),
      frameList: this._getFrameList(),
      sliceStart: renderSliceStart,
      sliceEnd: renderSliceEnd
    });
  }

  /**
   * 以胶片film为原点，得到screen的坐标
   *
   * 表明当前screen投影到film的哪个位置
   */
  private _getScreenRect() {
    if (!this._listRef) {
      return new Rectangle({ top: 0, height: 0 });
    }

    const listNode = this._listRef.getWrapperNode();
    const screen = this.props.screen;

    return screen.getRectRelativeTo(listNode);
  }

  /**
   * 计算padding的空余量，处于这些量覆盖下的数据项是不会被渲染的
   * @returns {{blankSpaceAbove: number, blankSpaceBelow: number}}
   * @private
   */
  private _computeBlankSpace() {
    const { renderSliceStart, renderSliceEnd } = this.state;

    const frameList = this._getFrameList();

    return {
      blankSpaceAbove:
        frameList.length <= 0
          ? 0
          : frameList[renderSliceStart].rect.getTop() -
            frameList[0].rect.getTop(),
      blankSpaceBelow:
        renderSliceEnd >= frameList.length
          ? 0
          : frameList[frameList.length - 1].rect.getBottom() -
            frameList[renderSliceEnd].rect.getTop()
    };
  }

  /**
   * 1. 注册scroll和resize事件的监听函数
   * 2. 调度第一次投影操作
   */
  componentDidMount() {
    const throttleDuration = 200;

    this._unlistenScroll = this.props.screen.addScrollListener(
      throttle(this._scheduleProjection, throttleDuration, {
        trailing: true,
        leading: false
      })
    );
    // 一旦用户resize屏幕，我们需要重新获取当前帧的高度
    this._unlistenResize = this.props.screen.addResizeListener(
      throttle(
        () => {
          this._updateHeight();
          this._scheduleProjection();
        },
        throttleDuration,
        { trailing: true }
      )
    );

    this._scheduleProjection();
  }

  componentWillReceiveProps(nextProps) {
    const prevList = this.props.list;
    const prevState = this.state;

    const nextList = nextProps.list;

    if (prevList !== nextList) {
      const slice = mapOldFrameIndexIntoNewFilm({
        currentFrameStart: prevState.renderSliceStart,
        currentFrameEnd: prevState.renderSliceEnd,
        newFrameStart: nextProps.newDataSliceStart,
        newFrameEnd: nextProps.newDataSliceEnd
      });

      this.setState({
        renderSliceStart: slice.start,
        renderSliceEnd: slice.end
      });
    }
  }

  componentWillUpdate() {
    this._prevSnapshot = this._getSnapshot();
  }

  componentDidUpdate(prevProps) {
    this._correctProjection(prevProps.list !== this.props.list);
  }

  componentWillUnmount() {
    this._isUnmounted = true;

    // 取消事件侦听
    if (this._unlistenScroll) {
      this._unlistenScroll();
    }
    if (this._unlistenResize) {
      this._unlistenResize();
    }
  }

  render() {
    const { renderSliceStart, renderSliceEnd } = this.state;

    const { blankSpaceAbove, blankSpaceBelow } = this._computeBlankSpace();

    //console.log(`start: ${renderSliceStart}, end: ${renderSliceEnd}`);

    return (
      <List
        ref={this._handleRefUpdate}
        list={this.props.list.slice(renderSliceStart, renderSliceEnd)}
        blankSpaceAbove={blankSpaceAbove}
        blankSpaceBelow={blankSpaceBelow}
        itemRenderer={(data, index) => {
          return this.props.itemRenderer(data, renderSliceStart + index);
        }}
      />
    );
  }
}

/**
 * 计算所有frame的rect，坐标相对于film原点。
 *
 * 未渲染数据项的高度用估计值代替。
 */
/*
export function getFootageRectMap(options: {
  list: DataItem[];
  heightTable: HeightMap;
  defaultHeight: number;
}): FootageRectMap {
  let { list, heightTable, defaultHeight } = options;

  const frameRectMap = {};
  let top = 0;

  list.forEach(item => {
    const id = item.id;

    const height = heightTable[id] ? heightTable[id] : defaultHeight;

    frameRectMap[id] = new Rectangle({
      top,
      height
    });

    top += height;
  });

  return frameRectMap;
}
*/