import throttle from "lodash.throttle";
import React from "react";
import { addResizeListener, addScrollListener } from "./helper/listener";
import { requestAnimationFrame } from "./helper/rAF";
import { createScheduler } from "./helper/schedule";
import { IListItem, IMovie, IRenderedFrameHeight, IScreen } from "./interface";
import { createMovie } from "./movie";
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

    // The list item data
    data: IListItem[];

    assumedHeight: number;

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
    itemRenderer?: (item: IListItem, index: number) => void;
  },
  {
    renderSliceStart: number;
    renderSliceEnd: number;
    fakePaddingTop: number;
    fakePaddingBottom: number;
    fakePaddingLeft: number;
    fakePaddingRight: number;
  }
> {
  public storeMovie = () => {
    return this.movie;
  };

  public restoreMovie = (movie: IMovie) => {
    this.movie = movie;
  };

  public state = {
    fakePaddingBottom: 0,
    fakePaddingLeft: 0,
    fakePaddingRight: 0,
    fakePaddingTop: 0,
    renderSliceEnd: 0, // Not include!
    renderSliceStart: 0
  };

  // Record the rendered item's heights.
  // Very important field!
  private renderedFrameHeights: IRenderedFrameHeight = {};

  private wrapperDivRef = React.createRef<HTMLDivElement>();
  private movieDivRef = React.createRef<HTMLDivElement>();

  // This screen is related to movie. NOT web client system!
  private screen!: IScreen;

  private isMount!: boolean;
  private unlistenScroll!: () => void;
  private unlistenResize!: () => void;
  private movie: IMovie = createMovie(this.props.assumedHeight, []);
  private prevData!: IListItem[];
  private throttleDuration = 200;

  public componentDidMount() {
    this.isMount = true;

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

    this.runProjection();
  }

  public componentDidUpdate() {
    this.correctProjection();
  }

  public componentWillUnmount() {
    this.isMount = true;

    if (this.unlistenScroll) {
      this.unlistenScroll();
    }
    if (this.unlistenResize) {
      this.unlistenResize();
    }
  }

  public render() {
    const { fakePaddingTop, fakePaddingBottom } = this.state;

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
            paddingBottom: fakePaddingBottom,
            paddingTop: fakePaddingTop
          }}
        >
          {this.movie.frameList.slice(this.state.renderSliceStart, this.state.renderSliceEnd).map((item, index) => {
            // The actual index of the rendered frame in the movie frame list.
            const actualIndex = index + this.state.renderSliceStart;

            return (
              <div
                key={item.id}
                ref={(ref: HTMLDivElement) => {
                  if (ref) {
                    // TODO: Make clear on that how getBoundingClientRect() will affect the performance?
                    // TODO: const height = ref.offsetHeight;
                    const height = ref.getBoundingClientRect().height;

                    this.renderedFrameHeights[item.id] = height;
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

  /**
   * Use this scheduler to schedule projection.
   *
   * It's main purpose is to calculate render slice and padding values
   * of the NEXT render step.
   */
  private runProjection = createScheduler(() => {
    const { bufferHeightRatio, data } = this.props;

    if (!this.isMount || 0 === data.length) {
      return;
    }

    // The movie object used by next step.
    this.movie = createMovie(this.props.assumedHeight, this.props.data, this.renderedFrameHeights);

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

    const { renderSliceEnd, renderSliceStart } = project({
      bufferRatio: bufferHeightRatio,
      movie: this.movie,
      screen: this.screen
    });

    const frameList = this.movie.frameList;

    this.setState({
      fakePaddingBottom:
        frameList.length === 0
          ? 0
          : frameList[frameList.length - 1].rect.bottom - frameList[renderSliceEnd - 1].rect.bottom,
      fakePaddingTop: frameList.length === 0 ? 0 : frameList[renderSliceStart].rect.top - frameList[0].rect.top,
      renderSliceEnd,
      renderSliceStart
    });
  }, requestAnimationFrame);

  private correctProjection = () => {
    if (!this.wrapperDivRef.current) {
      return;
    }

    if (this.prevData !== this.props.data) {
      this.prevData = this.props.data;
      this.runProjection();
      return;
    }

    // Caculate the height error.
    const heightError = this.movie.frameList
      .slice(this.state.renderSliceStart, this.state.renderSliceEnd + 1)
      .reduce((accError, frame) => {
        const currentError = this.renderedFrameHeights[frame.id] - frame.rect.height;

        return accError + currentError;
      }, 0);

    if (heightError !== 0) {
      this.runProjection();
    }
  };
}
