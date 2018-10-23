import throttle from "lodash.throttle";
import React from "react";
import { requestAnimationFrame } from "./helper/rAF";
import { createScheduler } from "./helper/schedule";
import { IMovie, IScreen } from "./interface";
import { addResizeListener, addScrollListener } from "./listener";
import { appendFrames, createMovie, prefixFrames, updateFrameHeights } from "./movie";
import { createScreenRelativeToMovie, project } from "./screen";

export class MovieList extends React.PureComponent<
  {
    // How many buffer size should we use, calculating with - Buffer height / Screen height
    bufferHeightRatio: number;

    // The movie object, used for cache
    movie: IMovie;

    // Indicate whether using a div as movie screen
    useDivAsScreen?: {
      /**
       * 屏幕div的CSS类
       */
      className: string;
    };
  },
  {
    renderSliceStart: number;
    renderSliceEnd: number;
  }
> {
  public static appendFrames = appendFrames;
  public static prefixFrames = prefixFrames;
  public static createMovie = createMovie;

  public state = {
    renderSliceEnd: 0,
    renderSliceStart: 0
  };

  // 放映屏幕的DOM div ref
  private screenDivRef = React.createRef<HTMLDivElement>();
  // 长列表的DOM div ref
  private movieListDivRef = React.createRef<HTMLDivElement>();
  private renderedFrameHeights: Record<number, number> = {};
  private screen!: IScreen;
  private isUnmounted!: boolean;
  private unlistenScroll!: () => void;
  private unlistenResize!: () => void;
  private prevMovie!: IMovie;

  /**
   * 1. 注册scroll和resize事件的监听函数
   * 2. 调度第一次投影操作
   */
  public componentDidMount() {
    const throttleDuration = 200;

    const target = this.props.useDivAsScreen ? this.screenDivRef.current : window;

    this.unlistenScroll = addScrollListener(
      throttle(this.scheduleProjection, throttleDuration, {
        leading: false,
        trailing: true
      }),
      target!
    );

    this.unlistenResize = addResizeListener(
      throttle(this.scheduleProjection, throttleDuration, {
        leading: false,
        trailing: true
      }),
      target!
    );
  }

  public componentDidUpdate() {
    this.correctProjection();
  }

  public componentWillUnmount() {
    this.isUnmounted = true;

    // 取消事件侦听
    if (this.unlistenScroll) {
      this.unlistenScroll();
    }
    if (this.unlistenResize) {
      this.unlistenResize();
    }
  }

  public render() {
    // 清除临时缓存
    this.renderedFrameHeights = {};

    const { fakeSpaceAbove, fakeSpaceBelow } = this.getRenderFakeSpace();

    return (
      <div className={this.props.useDivAsScreen && this.props.useDivAsScreen.className} ref={this.screenDivRef}>
        <div
          ref={this.movieListDivRef}
          style={{
            flexDirection: "column",
            paddingBottom: fakeSpaceBelow,
            paddingTop: fakeSpaceAbove
          }}
        >
          {this.props.movie.frameList
            .slice(this.state.renderSliceStart, this.state.renderSliceEnd)
            .map((item, index) => {
              // 被渲染帧的实际索引
              const actualIndex = index + this.state.renderSliceStart;

              return (
                <div
                  key={actualIndex}
                  ref={(ref: HTMLDivElement) => {
                    if (ref) {
                      // TODO: 搞清楚使用getBoundingClientRect()到底会不会影响性能。
                      const height = ref.getBoundingClientRect().height;
                      // let height = ref.offsetHeight;

                      this.renderedFrameHeights[actualIndex] = height;
                    }
                  }}
                >
                  {// TODO: 这里是一个ts编译器的bug。当同时使用intersection和union时，会无法识别props的类型
                  (this.props as any).itemRenderer
                    ? (this.props as any).itemRenderer(item.content, actualIndex)
                    : (this.props as any).children(item.content, actualIndex)}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // 创建投影计算调度器
  private scheduleProjection = createScheduler(() => {
    const { movie, bufferHeightRatio } = this.props;

    if (this.isUnmounted || 0 === movie.frameList.length) {
      return;
    }

    this.screen = createScreenRelativeToMovie(
      {
        height: this.getScreenHeight(),
        left: 0,
        top: this.props.useDivAsScreen ? this.screenDivRef.current!.getBoundingClientRect().top : 0,
        width: 0
      },
      {
        left: 0,
        top: this.movieListDivRef.current!.getBoundingClientRect().top
      }
    );

    const result = project({
      bufferRatio: bufferHeightRatio,
      movie,
      screen: this.screen
    });

    this.setState({
      renderSliceEnd: result.sliceEnd,
      renderSliceStart: result.sliceStart
    });
  }, requestAnimationFrame);

  /**
   * 矫正当前的投影
   */
  private correctProjection = () => {
    if (!this.screenDivRef.current) {
      return;
    }

    let isMovieFrameListChange = false;
    if (this.prevMovie !== this.props.movie) {
      isMovieFrameListChange = true;
    }
    this.prevMovie = this.props.movie;

    const heightError = updateFrameHeights(this.props.movie, this.renderedFrameHeights);

    if (heightError !== 0 || isMovieFrameListChange) {
      this.scheduleProjection();
    }
  };

  private getRenderFakeSpace = () => {
    const frameList = this.props.movie.frameList;
    const startIndex = this.state.renderSliceStart;
    const endIndex = this.state.renderSliceEnd;

    return {
      fakeSpaceAbove: frameList.length <= 0 ? 0 : frameList[startIndex].rect.top - frameList[0].rect.top,
      fakeSpaceBelow:
        endIndex >= frameList.length ? 0 : frameList[frameList.length - 1].rect.bottom - frameList[endIndex].rect.top
    };
  };

  /**
   * 获取用户观看屏幕的高度
   *
   * Properties `clientWidth/clientHeight` only account for the visible part of the element.
   *
   * @return 返回屏幕的高度
   */
  private getScreenHeight = (): number => {
    // clientHeight仅仅包括可视范围的高，不包括已经被scroll到上面或者下面的高
    return this.props.useDivAsScreen
      ? this.screenDivRef.current!.clientHeight
      : window.document.documentElement!.clientHeight;
  };
}
