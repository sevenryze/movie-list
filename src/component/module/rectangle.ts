interface Point {
  left: number;
  top: number;
}

export class Rectangle {
  private readonly _top: number;
  private readonly _left: number;
  private readonly _height: number;
  private readonly _width: number;

  constructor(
    options: {
      top?: number;
      left?: number;
      height?: number;
      width?: number;
    } = {}
  ) {
    let { top = 0, left = 0, height = 0, width = 0 } = options;

    this._top = top;
    this._left = left;
    this._height = height;
    this._width = width;
  }

  getTop() {
    return this._top;
  }

  getBottom() {
    return this._top + this._height;
  }

  getLeft() {
    return this._left;
  }

  getRight() {
    return this._left + this._width;
  }

  getHeight() {
    return this._height;
  }

  getWidth() {
    return this._width;
  }

  /**
   * 检查与矩形`rect`是否有干涉
   *
   * @param {Rectangle} rect 待检查矩形
   * @returns {boolean} 检查结果。true: 有干涉；false：无干涉
   */
  doesIntersectWith(rect: Rectangle): boolean {
    const top = this.getTop();
    const bottom = this.getBottom();
    const left = this.getLeft();
    const right = this.getRight();

    const aTop = rect.getTop();
    const aBottom = rect.getBottom();
    const aLeft = rect.getLeft();
    const aRight = rect.getRight();

    return (
      Rectangle.isBetween(top, aTop, aBottom) ||
      Rectangle.isBetween(aTop, top, bottom) ||
      Rectangle.isBetween(left, aLeft, aRight) ||
      Rectangle.isBetween(aLeft, left, right)
    );
  }

  /**
   * 检查`point`是否在矩形范围内
   *
   * @returns {boolean}
   * @param point 待检查点
   */
  contains(point: Point): boolean {
    if (point.left === undefined) {
      return Rectangle.isBetween(point.top, this.getTop(), this.getBottom());
    } else if (point.top === undefined) {
      return Rectangle.isBetween(point.left, this.getLeft(), this.getRight());
    } else {
      return (
        Rectangle.isBetween(point.top, this.getTop(), this.getBottom()) &&
        Rectangle.isBetween(point.left, this.getLeft(), this.getRight())
      );
    }
  }

  /**
   * 位移变换到新位置，移动距离为x和y
   *
   * @param {number} x 横向移动距离
   * @param {number} y 纵向移动距离
   * @returns {Rectangle} 经过变换后的新矩形
   */
  translateBy(x: number, y: number) {
    let left = this.getLeft();
    let top = this.getTop();

    if (x) {
      left += x;
    }

    if (y) {
      top += y;
    }

    return new Rectangle({
      left,
      top,
      width: this.getWidth(),
      height: this.getHeight()
    });
  }

  /**
   * 获得相对于新原点`point`坐标的矩形
   *
   * 新原点`point`的坐标和待计算矩形的坐标必须拥有同样的参考原点。
   *
   * @param point {Point} 新的原点坐标
   * @return {Rectangle} 返回相对于point的新矩形
   */
  relativeToPoint = (point: Point) => {
    return new Rectangle({
      left: this._left - point.left,
      top: this._top - point.top,
      width: this.getWidth(),
      height: this.getHeight()
    });
  };

  /**
   * 检查`value`是否在`begin`和`end`范围内
   *
   * @param value 待检查值
   * @param begin 范围起始边界
   * @param end 范围结束边界
   * @returns {boolean}
   */
  static isBetween(value: number, begin: number, end: number): boolean {
    return value >= begin && value < end;
  }
}
