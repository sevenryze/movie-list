import { Rectangle } from "./rectangle";
import { Frame } from "../controller";

export class Snapshot {
  private _screenRect: Rectangle;
  private _frameList: Frame[];
  private _sliceStart: number;
  private _sliceEnd: number;
  private _renderedIdSet;
  private _idFrameMapper: { [id: string]: Frame } = {};

  constructor(options: {
    screenRect: Rectangle;
    frameList: Frame[];
    sliceStart: number;
    sliceEnd: number;
  }) {
    let { frameList, sliceEnd, sliceStart, screenRect } = options;

    this._screenRect = screenRect;
    this._frameList = frameList;
    this._sliceStart = sliceStart;
    this._sliceEnd = sliceEnd;

    for (let frame of frameList) {
      this._idFrameMapper[frame.id] = frame;
    }
  }

  getScreenRect() {
    return this._screenRect;
  }

  getFrameList() {
    return this._frameList;
  }

  getFrameRectBy(id) {
    return this._idFrameMapper[id].rect;
  }

  isRendered(id) {
    return this._getRenderedIdSet().hasOwnProperty(id);
  }

  /**
   * 得到整个film的包络矩形
   *
   * @return {Rectangle}
   */
  getListRect() {
    const frameList = this._frameList;
    if (frameList.length <= 0) {
      return new Rectangle({
        top: 0,
        height: 0
      });
    }

    const top = frameList[0].rect.getTop();
    const height = frameList[frameList.length - 1].rect.getBottom() - top;

    return new Rectangle({
      top,
      height
    });
  }

  /**
   * 获得当前渲染的数据项的ID
   */
  _getRenderedIdSet() {
    if (!this._renderedIdSet) {
      this._renderedIdSet = {};
      for (let t = this._sliceStart; t < this._sliceEnd; t++) {
        this._renderedIdSet[this._frameList[t].id] = true;
      }
    }

    return this._renderedIdSet;
  }
}
