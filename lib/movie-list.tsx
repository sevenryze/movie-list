import throttle from "lodash.throttle";
import React from "react";
import { requestAnimationFrame } from "./helper/rAF";
import { createScheduler } from "./helper/schedule";
import { IMovie, IScreen } from "./interface";
import { addResizeListener, addScrollListener } from "./listener";
import { appendFrames, createMovie, prefixFrames, updateFrameHeights } from "./movie";
import { createRectangle } from "./rectangle";
import { createScreenRelativeToMovie, project } from "./screen";

/**
 * If not point out specifically, the coordinates of rectangles all are
 * related to browser's client system, A.K.A relating to left-top point of the tab view.
 *
 * And for simplicy purpose, we use this coordinate system as WORLD system.
 */

export class MovieList extends React.PureComponent<
  {
    // How many buffer size should we use, calculating with - Buffer height / Screen height
    bufferHeightRatio: number;

    // The movie object, used for cache
    movie: IMovie;

    // Indicate whether using the wrapper div as movie screen
    useWrapperDivAsScreen?: {
      /**
       * Assign the class name to the wrapper div
       */
      className: string;
    };

    /**
     * The item renderer. You could also use the children as item renderer.
     */
    itemRenderer?: (item: any, index: number) => void;
  },
  {
    renderStart: number;
    renderEnd: number;
  }
> {
  public static appendFrames = appendFrames;
  public static prefixFrames = prefixFrames;
  public static createMovie = createMovie;

  public state = {
    renderEnd: 0,
    renderStart: 0
  };

  private wrapperDivRef = React.createRef<HTMLDivElement>();
  private movieDivRef = React.createRef<HTMLDivElement>();

  private renderedFrameHeights: Record<number, number> = {};

  // This screen is related to movie. NOT web client system!
  private screen!: IScreen;

  private isUnmounted!: boolean;
  private unlistenScroll!: () => void;
  private unlistenResize!: () => void;
  private currentMovie: IMovie = this.props.movie;
  private prevMovie: IMovie = this.props.movie;
  private throttleDuration = 200;

  public componentDidMount() {
    const target = this.props.useWrapperDivAsScreen ? this.wrapperDivRef.current : window;

    this.unlistenScroll = addScrollListener(
      throttle(this.runProjection, this.throttleDuration, {
        leading: false,
        trailing: true
      }),
      target!
    );
    this.unlistenResize = addResizeListener(
      throttle(
        () => {
          this.forceUpdate();
        },
        this.throttleDuration,
        {
          leading: false,
          trailing: true
        }
      ),
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
    // Clear the temp cache
    this.renderedFrameHeights = {};

    const { fakeSpaceAbove, fakeSpaceBelow } = this.getRenderFakeSpace();

    return (
      <div
        className={this.props.useWrapperDivAsScreen && this.props.useWrapperDivAsScreen.className}
        ref={this.wrapperDivRef}
      >
        <div
          ref={this.movieDivRef}
          style={{
            display: "flex",
            flexDirection: "column",
            paddingBottom: fakeSpaceBelow,
            paddingTop: fakeSpaceAbove
          }}
        >
          {this.props.movie.frameList
            .slice(
              this.state.renderStart,
              // Array.slice(start, end), `end` NOT included
              this.state.renderEnd + 1
            )
            .map((item, index) => {
              // The actual index of the rendered frame in the movie frame list.
              const actualIndex = index + this.state.renderStart;

              return (
                <div
                  key={actualIndex}
                  data-aindex={actualIndex}
                  ref={(ref: HTMLDivElement) => {
                    if (ref) {
                      // TODO: 搞清楚使用getBoundingClientRect()到底会不会影响性能。
                      const height = ref.getBoundingClientRect().height;
                      // const height = ref.offsetHeight;

                      this.renderedFrameHeights[actualIndex] = height;
                    }
                  }}
                >
                  {(this.props as any).itemRenderer
                    ? (this.props as any).itemRenderer(item.content, actualIndex)
                    : (this.props as any).children(item.content, actualIndex)}
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  // Use this scheduler to schedule projection.
  private runProjection = createScheduler(() => {
    const { movie, bufferHeightRatio } = this.props;

    if (this.isUnmounted || 0 === movie.frameList.length) {
      return;
    }

    const wrapperBoundingRect = this.wrapperDivRef.current!.getBoundingClientRect();
    const movieBoundingRect = this.movieDivRef.current!.getBoundingClientRect();
    const isUseDiv = this.props.useWrapperDivAsScreen;

    // Properties `clientWidth/clientHeight` only account for the visible part of the element.
    const screenWorldRect = createRectangle({
      height: isUseDiv ? wrapperBoundingRect.height : window.document.documentElement!.clientHeight,
      left: isUseDiv ? wrapperBoundingRect.left : 0,
      top: isUseDiv ? wrapperBoundingRect.top : 0,
      width: isUseDiv ? wrapperBoundingRect.width : window.document.documentElement!.clientWidth
    });

    const movieWorldRect = createRectangle({
      height: movieBoundingRect.height,
      left: movieBoundingRect.left,
      top: movieBoundingRect.top,
      width: movieBoundingRect.width
    });

    this.screen = createScreenRelativeToMovie(screenWorldRect, movieWorldRect);

    const result = project({
      bufferRatio: bufferHeightRatio,
      movie,
      screen: this.screen
    });

    this.setState({
      renderEnd: result.renderEnd,
      renderStart: result.renderStart
    });
  }, requestAnimationFrame);

  private correctProjection = () => {
    if (!this.wrapperDivRef.current) {
      return;
    }

    let isMovieFrameListChange = false;
    if (this.prevMovie !== this.props.movie) {
      isMovieFrameListChange = true;
    }
    this.prevMovie = this.props.movie;

    const { heightError } = updateFrameHeights(this.props.movie, this.renderedFrameHeights);

    if (heightError !== 0 || isMovieFrameListChange) {
      this.runProjection();
    }
  };

  private getRenderFakeSpace = () => {
    const frameList = this.props.movie.frameList;
    const startIndex = this.state.renderStart;
    const endIndex = this.state.renderEnd;

    return {
      fakeSpaceAbove: frameList.length === 0 ? 0 : frameList[startIndex].rect.top - frameList[0].rect.top,
      fakeSpaceBelow:
        frameList.length === 0 ? 0 : frameList[frameList.length - 1].rect.bottom - frameList[endIndex].rect.bottom
    };
  };
}
