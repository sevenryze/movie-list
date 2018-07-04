import { Movie } from "./movie";
import { Rectangle } from "./module/rectangle";

export class Projector {
  public rect = new Rectangle();
  public initOffset = 0;
  public currentSlice;

  private readonly _screenRef: HTMLDivElement;
  private readonly _windowRef: Window;
  private readonly _useWindowAsScreen: boolean;
  private _offsetTop: number;

  getOffsetTop() {
    return this._offsetTop;
  }
  setOffsetTop(value) {
    this._offsetTop = Math.ceil(value);
  }

  /**
   * 接受window对象和screen对象。
   *
   * 默认使用浏览器的viewPort作为screen。
   *
   * @param window 当前Window对象
   * @param screen 指定特定div为projector screen；若window为screen，则留空。
   */
  constructor(window, screen?) {
    this._screenRef = screen;
    this._windowRef = window;

    this._useWindowAsScreen = !this._screenRef;
  }

  /**
   * 针对传入的movie和bufferRatio进行投影。
   *
   * @returns 返回当前投影的slice
   * @param options
   */
  project = (options: { movie: Movie; bufferRatio: number }) => {
    const { movie, bufferRatio } = options;
    const frameList = movie.frameList;

    const bufferHeight = this.rect.getHeight() * bufferRatio;

    // 渲染rect范围
    const renderRectTop = this.rect.getTop() - bufferHeight;
    const renderRectBottom = this.rect.getBottom() + bufferHeight;

    let startIndex = frameList.findIndex(
      frame => frame.rect.getBottom() > renderRectTop
    );
    if (startIndex < 0) {
      startIndex = frameList.length - 1;
    }

    let endIndex = frameList.findIndex(
      frame => frame.rect.getTop() >= renderRectBottom
    );
    if (endIndex < 0) {
      endIndex = frameList.length;
    }

    return {
      sliceStart: startIndex,
      sliceEnd: endIndex
    };
  };

  /**
   * 得到相对于指定元素原点的rect。
   *
   * @param {HTMLElement} node 原点元素
   */
  updateRectRelativeTo = (node: HTMLElement) => {
    // 原点坐标
    let originTop = node.getBoundingClientRect().top;

    // 获得screen的高度
    const screenHeight = this._getScreenHeight();

    // 获得screen的y坐标
    const screenTop = this._useWindowAsScreen
      ? 0
      : this._screenRef.getBoundingClientRect().top;

    this.rect = new Rectangle({
      top: screenTop - originTop,
      height: screenHeight
    });
  };

  /**
   * 获得x轴方向的已滑动距离
   *
   * @returns x轴方向的scrolled distance
   */
  scrollX() {
    if (this._useWindowAsScreen) {
      return -1 * this._windowRef.document.body.getBoundingClientRect().left;
    }

    return this._screenRef.scrollLeft;
  }

  /**
   * 获得y轴方向的已滑动距离
   *
   * @returns
   */
  scrollY() {
    if (this._useWindowAsScreen) {
      return -1 * this._windowRef.document.body.getBoundingClientRect().top;
    }

    return this._screenRef.scrollTop;
  }

  scrollBy(vertically) {
    if (this._useWindowAsScreen) {
      this._windowRef.scrollBy(0, vertically);
    } else {
      this._screenRef.scrollTop += vertically;
    }
  }

  scrollTo(yPos) {
    if (this._useWindowAsScreen) {
      this._windowRef.scrollTo(0, yPos);
    } else {
      this._screenRef.scrollTop = yPos;
    }
  }

  addResizeListener(listener) {
    return this._addListener(
      "resize",
      listener,
      this._useWindowAsScreen ? this._windowRef : this._screenRef
    );
  }

  addScrollListener(listener) {
    return this._addListener(
      "scroll",
      listener,
      this._useWindowAsScreen ? this._windowRef : this._screenRef
    );
  }

  /**
   * 获取用户观看屏幕的高度
   *
   * Properties `clientWidth/clientHeight` only account for the visible part of the element.
   *
   * @return 返回屏幕的高度
   */
  private _getScreenHeight(): number {
    let screenHeight;

    if (this._useWindowAsScreen) {
      // clientHeight仅仅包括可视范围的高，不包括已经被scroll到上面或者下面的高
      screenHeight = this._windowRef.document.documentElement.clientHeight;
    } else {
      screenHeight = this._screenRef.clientHeight;
    }

    return Math.ceil(screenHeight);
  }

  /**
   * 注册侦听函数，返回取消侦听器
   *
   * @param event 希望侦听的事件名称，例如："scroll" or "resize"
   * @param listener 事件侦听处理函数
   * @param target 希望侦听的目标对象
   * @return 调用此返回函数可以取消侦听事件
   */
  private _addListener(event: string, listener: Function, target) {
    const eventCallback = () => {
      return listener();
    };

    // 注册侦听函数
    target.addEventListener(event, eventCallback);

    // 调用此函数可取消事件侦听
    return () => {
      target.removeEventListener(event, eventCallback);
    };
  }
}
