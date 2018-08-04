export class Coordinate {
  public top = 0;
  public height = 0;
  get bottom() {
    return this.top + this.height;
  }

  constructor(
    options: { top: number; height: number } = {
      top: 0,
      height: 0
    }
  ) {
    this.top = options.top;
    this.height = options.height;
  }

  /**
   * Check if the target `Coordinate` is intersecting with.
   *
   * @param coordinate The target coordinate
   * @returns whether intersecting
   */
  doesIntersectWith(coordinate: Coordinate): boolean {
    const top = this.top;
    const bottom = this.bottom;

    const targetTop = coordinate.top;
    const targetBottom = coordinate.bottom;

    return (
      Coordinate.isBetween(top, targetTop, targetBottom) ||
      Coordinate.isBetween(targetTop, top, bottom)
    );
  }

  /**
   * 位移变换到新位置
   *
   * @param offset Translate distance
   * @returns The new translated `Coordinate`
   */
  translateBy(offset: number) {
    let top = this.top;

    if (offset) {
      top += offset;
    }

    return new Coordinate({
      top,
      height: this.height
    });
  }

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
