import { Rectangle } from "./rectangle";
import { findIndex } from "./find-index";

export class ProjectionMoment {
  private _screenRect: Rectangle;
  private _list: any[];
  private _frameRectMap: Rectangle[];
  private _sliceStart: number;
  private _sliceEnd: number;
  private _renderedIdSet;

  constructor({ screenRect, list, frameRectMap, sliceStart, sliceEnd }) {
    this._screenRect = screenRect;
    this._list = list;
    this._frameRectMap = frameRectMap;
    this._sliceStart = sliceStart;
    this._sliceEnd = sliceEnd;
  }

  getViewportRect() {
    return this._screenRect;
  }

  /**
   * 得到数据列表的top和height
   */
  getListRect() {
    const list = this._list;
    if (list.length <= 0) {
      return new Rectangle({
        top: 0,
        height: 0
      });
    }

    const rects = this._frameRectMap;

    const firstItemId = list[0].id;
    const lastItemId = list[list.length - 1].id;

    const top = rects[firstItemId].getTop();
    const height = rects[lastItemId].getBottom() - top;

    return new Rectangle({
      top,
      height
    });
  }

  getAllItems() {
    return this._list.map(item => {
      const id = item.id;
      return {
        id,
        rectangle: this._frameRectMap[id]
      };
    });
  }

  getList() {
    return this._list;
  }

  getItemRect(id) {
    return this._frameRectMap[id];
  }

  findVisibleItems() {
    const viewportRectangle = this._screenRect;
    const rectangles = this._frameRectMap;
    const list = this._list;
    const startIndex = findIndex(list, item => {
      const id = item.id;
      return rectangles[id].doesIntersectWith(viewportRectangle);
    });
    if (startIndex < 0) {
      return [];
    }

    let endIndex = findIndex(
      list,
      item => {
        const id = item.id;
        return !rectangles[id].doesIntersectWith(viewportRectangle);
      },
      startIndex
    );
    if (endIndex < 0) {
      endIndex = list.length;
    }

    return list
      .slice(startIndex, endIndex)
      .filter(item => {
        const id = item.id;
        return this.isRendered(id);
      })
      .map(item => {
        const id = item.id;
        return {
          id,
          rectangle: rectangles[id]
        };
      });
  }

  getRenderedItems() {
    const rectangles = this._frameRectMap;
    return this._list.slice(this._sliceStart, this._sliceEnd).map(item => {
      const id = item.id;
      return {
        id,
        rectangle: rectangles[id]
      };
    });
  }

  isRendered(id) {
    return this._getRenderedIdSet().hasOwnProperty(id);
  }

  /**
   * 获得当前渲染的数据项的ID
   */
  _getRenderedIdSet() {
    if (!this._renderedIdSet) {
      this._renderedIdSet = {};
      for (let t = this._sliceStart; t < this._sliceEnd; t++) {
        this._renderedIdSet[this._list[t].id] = true;
      }
    }

    return this._renderedIdSet;
  }
}
