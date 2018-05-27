import * as React from "react";
import throttle from "lodash.throttle";
import { List } from "./list";
import { createScheduler } from "./lib/createScheduler";
import { mapOldFrameIndexIntoNewFilm } from "./lib/find-new-slice";
import { ProjectionMoment } from "./lib/projection-moment";
import { Rectangle } from "./lib/rectangle";
import { offsetCorrection } from "./lib/offset-adjust";
import { projection } from "./lib/projection";
import { Screen } from "./lib/screen";

interface DataItem {
  id: string;
}

interface HeightMap {
  [id: string]: number;
}

export class Controller extends React.PureComponent<
  {
    list: DataItem[];
    itemRenderer: Function;
    onPositionUpdate?: Function;
    assumedItemHeight?: number;

    // 用户可视屏幕
    screen: Screen;

    // Buffer height / Screen height
    bufferHeightRatio?: number;

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
  static defaultProps = {
    bufferHeightRatio: 0,
    assumedItemHeight: 400
  };

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
  private _cachedHeightMap: HeightMap = {};

  private _scheduleProjection = createScheduler(() => {
    const { list } = this.props;

    if (this._isUnmounted || 0 === list.length) {
      return;
    }

    const result = projection({
      list: list,
      screenRect: this._getScreenRect(),
      frameRectMap: this._getFrameRectMap()
    });

    this._scheduleNotifyPosition();
    this.setState({
      renderSliceStart: result.sliceStart,
      renderSliceEnd: result.sliceEnd
    });
  }, requestAnimationFrame);
  private _scheduleNotifyPosition = createScheduler(() => {
    if (!this._isUnmounted && this.props.onPositionUpdate) {
      this.props.onPositionUpdate(this._getProjectionMoment());
    }
  }, requestAnimationFrame);

  private _listRef;

  private _prevProjectionMoment;

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
    const { list, screen } = this.props;
    const targetItem = list[index];
    const rects = this._getFrameRectMap();

    screen.scrollTo(rects[targetItem.id].getTop() + screen.getOffsetTop());
  }

  private _handleRefUpdate = ref => {
    this._listRef = ref;
  };

  private _correctProjection = hasListChanged => {
    if (!this._listRef) {
      return;
    }

    // 得到已渲染数据项的高度映射图
    const renderedItemHeightMap = this._listRef.getRenderedItemHeightMap();

    // 计算总体的高度误差
    const heightError = Object.keys(renderedItemHeightMap).reduce(
      (accHeight, key) => {
        const itemHeight = this._cachedHeightMap.hasOwnProperty(key)
          ? this._cachedHeightMap[key]
          : this.props.assumedItemHeight;

        return accHeight + renderedItemHeightMap[key] - itemHeight;
      },
      0
    );

    // 如果高度差值不为零，更新高度表。
    if (heightError !== 0) {
      this._cachedHeightMap = Object.assign(
        this._cachedHeightMap,
        renderedItemHeightMap
      );
    }

    // 矫正scrollBar的位置
    if ((hasListChanged || heightError !== 0) && this._prevProjectionMoment) {
      // 校正anchor的位置
      let offset = offsetCorrection(
        this._prevProjectionMoment,
        this._getProjectionMoment()
      );

      // 滑动到校正过的位置
      this.props.screen.scrollBy(offset);
    }

    // 如果高度差超过一个估计高，则有可能slice的范围出错，需要重新projection
    if (
      hasListChanged ||
      Math.abs(heightError) >= this.props.assumedItemHeight
    ) {
      this._scheduleProjection();
    }

    this._scheduleNotifyPosition();
  };

  private _getFrameRectMap = () => {
    let { list, assumedItemHeight } = this.props;

    const frameRectMap = {};
    let top = 0;

    list.forEach(item => {
      const id = item.id;

      const height = this._cachedHeightMap[id]
        ? this._cachedHeightMap[id]
        : assumedItemHeight;

      frameRectMap[id] = new Rectangle({
        top,
        height
      });

      top += height;
    });

    return frameRectMap;
  };

  private _getProjectionMoment() {
    const { renderSliceStart, renderSliceEnd } = this.state;

    return new ProjectionMoment({
      screenRect: this._getScreenRect(),
      list: this.props.list,
      frameRectMap: this._getFrameRectMap(),
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
    const { list } = this.props;
    const { renderSliceStart, renderSliceEnd } = this.state;
    const rects = this._getFrameRectMap();
    const lastIndex = list.length - 1;

    return {
      blankSpaceAbove:
        list.length <= 0
          ? 0
          : rects[list[renderSliceStart].id].getTop() -
            rects[list[0].id].getTop(),
      blankSpaceBelow:
        renderSliceEnd >= list.length
          ? 0
          : rects[list[lastIndex].id].getBottom() -
            rects[list[renderSliceEnd].id].getTop()
    };
  }

  componentDidMount() {
    // 注册scroll事件的监听函数
    this._unlistenScroll = this.props.screen.addScrollListener(
      throttle(this._scheduleProjection, 100, {
        trailing: true
      })
    );
    // 注册resize事件的监听函数
    this._unlistenResize = this.props.screen.addScrollListener(
      throttle(this._scheduleProjection, 100, {
        trailing: true
      })
    );

    this._correctProjection(true);
  }

  componentWillReceiveProps(nextProps) {
    //console.log(`component will receive props`);

    const prevList = this.props.list;
    const prevState = this.state;

    const nextList = nextProps.list;

    if (prevList !== nextList) {
      /* const slice = findNewSlice(
        prevList,
        nextList,
        prevState.renderSliceStart,
        prevState.renderSliceEnd
      ) || { sliceStart: 0, sliceEnd: 0 };

      this.setState({
        renderSliceStart: slice.sliceStart,
        renderSliceEnd: slice.sliceEnd
      });
*/
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
    this._prevProjectionMoment = this._getProjectionMoment();
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

    console.log(`start: ${renderSliceStart}, end: ${renderSliceEnd}`);

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
