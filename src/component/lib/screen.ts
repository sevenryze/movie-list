import { Rectangle } from "./rectangle";

/**
 * Screen（屏幕）是用户的可视范围。
 *
 * 就像我们看电影一样，在screen内的frame会被显示出来。
 */
export class Screen {
  private _screenRef;
  private _windowRef: Window;
  private readonly _useWindowAsScreen: boolean;
  private _programScrollListeners: Function[] = [];

  private _offsetTop: number;

  // TODO: 设置初始的offset，帮助scrollToIndex找到正确的滑动距离

  /**
   * 接受window对象和screen对象。
   *
   * 默认使用浏览器的viewPort作为screen。
   *
   * @param window 接受当前的浏览器Window对象
   * @param {any} screen 指定特定元素为screen
   */
  constructor(window, screen = window) {
    this._screenRef = screen;
    this._windowRef = window;

    this._useWindowAsScreen = this._screenRef === this._windowRef;
  }

  getOffsetTop() {
    return this._offsetTop;
  }
  setOffsetTop(value) {
    this._offsetTop = Math.ceil(value);
  }

  /*getRectRelativeTo(node: HTMLElement) {
    const nodeTop = node.getBoundingClientRect().top;

    return this.getRect().relativeToPoint({
      top: nodeTop,
      left: 0
    });
  }

  /!**
   * 获得屏幕矩形。相对于浏览器坐标原点。
   *
   * @return {Rectangle} 返回屏幕矩形
   *!/
  getRect() {
    const screenHeight = this._getScreenHeight();

    const screenTop = this._useWindowAsScreen
      ? 0
      : this._screenRef.getBoundingClientRect().top;

    return new Rectangle({
      top: screenTop,
      height: screenHeight
    });
  }*/

  /**
   * 得到相对于指定原点的屏幕矩形。
   *
   * 默认为浏览器视口原点。
   *
   * @param {HTMLElement} node 原点元素
   * @returns {Rectangle} 相对于指定原点的矩形
   */
  getRectRelativeTo(node?: HTMLElement) {
    let originTop = 0;

    // 获得screen的高度
    const screenHeight = this._getScreenHeight();

    // 获得screen的y坐标
    const screenTop = this._useWindowAsScreen
      ? 0
      : this._screenRef.getBoundingClientRect().top;

    if (node) {
      originTop = node.getBoundingClientRect().top;
    }

    return new Rectangle({
      top: screenTop - originTop,
      height: screenHeight
    });
  }

  // get scroll left
  scrollX() {
    if (this._useWindowAsScreen) {
      return -1 * this._windowRef.document.body.getBoundingClientRect().left;
    }

    return this._screenRef.scrollLeft;
  }

  // get scroll top
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

    this._programScrollListeners.forEach(listener => listener(vertically));
  }

  scrollTo(yPos) {
    if (this._useWindowAsScreen) {
      this._windowRef.scrollTo(0, yPos);
    } else {
      this._screenRef.scrollTop = yPos;
    }

    this._programScrollListeners.forEach(listener => listener(yPos));
  }

  addRectChangeListener(listener) {
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

  // listener triggered by programmatic scroll
  addProgrammaticScrollListener(listener) {
    if (this._programScrollListeners.indexOf(listener) < 0)
      this._programScrollListeners.push(listener);
    return () => this.removeProgrammaticScrollListener(listener);
  }

  removeProgrammaticScrollListener(listener) {
    const index = this._programScrollListeners.indexOf(listener);
    if (index > -1) this._programScrollListeners.splice(index, 1);
  }

  /**
   * 获取用户观看屏幕的高度
   *
   * Properties `clientWidth/clientHeight` only account for the visible part of the element.
   *
   * @return {number} 返回屏幕的高度
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
   * @return {() => void} 调用此返回函数可以取消侦听事件
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
