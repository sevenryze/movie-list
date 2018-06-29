import * as React from "react";
import throttle from "lodash.throttle";
import { requestAnimationFrame } from "./lib/rAF";
import { createScheduler } from "./lib/schedule";
import { mapOldFrameIndexIntoNewFilm } from "./lib/find-new-slice";
import { Screen } from "./module/screen";
import { Movie } from "./movie";
import { Projector } from "./projector";

export class Innerlist extends React.PureComponent<
  {
    list: any[];
    itemRenderer: Function;
    assumedItemHeight: number;

    // 用户可视屏幕
    screen: Screen;

    // Buffer height / Screen height
    bufferHeightRatio: number;

    // 新添加frame data的位置
    newDataSliceStart: number;
    newDataSliceEnd: number;
  },
  {
    // 渲染的数据项片段的起始索引
    renderSliceStart: number; // 渲染的数据项片段的结束索引
    renderSliceEnd: number;
    renderFakeSpaceAbove: number;
    renderFakeSpaceBelow: number;
  }
> {
  state = {
    renderSliceStart: 0,
    renderSliceEnd: 0,
    renderFakeSpaceAbove: 0,
    renderFakeSpaceBelow: 0
  };

  private _renderedFrameHeights: { [index: number]: number } = {};
  private _movie = new Movie(this.props.list);
  private _projector = new Projector(window);
  // 创建投影和快照的调度器
  private _scheduleProjection = createScheduler(() => {
    const { list, bufferHeightRatio } = this.props;

    if (this._isUnmounted || 0 === list.length) {
      return;
    }

    this._projector.updateRectRelativeTo(this._listRef);

    const result = this._projector.project({
      movie: this._movie,
      bufferRatio: bufferHeightRatio
    });

    console.log(
      `Projecting result: ${JSON.stringify(result)}, scrollY: ${window.scrollY}`
    );

    this.setState({
      renderSliceStart: result.sliceStart,
      renderSliceEnd: result.sliceEnd,
      renderFakeSpaceAbove: result.fakeSpaceAbove,
      renderFakeSpaceBelow: result.fakeSpaceBelow
    });
  }, requestAnimationFrame);
  private _listRef;
  /**
   * 因为采用了异步更新，如果virtualScroll已经被卸载，那么会导致找不到引用对象等错误。
   * 使用这个标志检查是否被卸载
   */
  private _isUnmounted;
  private _unlistenScroll;
  private _unlistenResize;

  private _handleRefUpdate = ref => {
    this._listRef = ref;
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

    let heightError = this._movie.updateHeights(this._renderedFrameHeights);

    console.log(`heightError: ${heightError}`);
    if (heightError !== 0) this._scheduleProjection();
  };

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
    // 清除临时缓存
    this._renderedFrameHeights = {};

    const {
      renderSliceStart,
      renderSliceEnd,
      renderFakeSpaceAbove: blankSpaceAbove,
      renderFakeSpaceBelow: blankSpaceBelow
    } = this.state;

    return (
      <div
        ref={this._handleRefUpdate}
        style={{
          paddingTop: blankSpaceAbove,
          paddingBottom: blankSpaceBelow
        }}
      >
        {this.props.list
          .slice(renderSliceStart, renderSliceEnd)
          .map((item, index) => {
            // 被渲染帧的实际索引
            const actualIndex = index + renderSliceStart;

            // 调用用户定义的帧渲染函数。
            const reactElement = this.props.itemRenderer(
              item.content,
              actualIndex
            );

            return React.cloneElement(reactElement, {
              key: actualIndex,
              ref: (ref: HTMLDivElement) => {
                if (ref) {
                  let height = ref.getBoundingClientRect().height;

                  this._renderedFrameHeights[actualIndex] = height;

                  // 如果有用户自定义的ref函数，调用它。
                  if ("function" === typeof reactElement.ref) {
                    reactElement.ref(ref);
                  }
                }
              }
            });
          })}
      </div>
    );
  }
}
