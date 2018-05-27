import * as React from "react";
import { Controller } from "./controller";
import { Screen } from "./lib/screen";

export class ProjectionList extends React.PureComponent<{
  // 待渲染数据
  data: any[];
  // 数据元素的渲染方式。
  itemRenderer: Function;

  // 新添加frame data的起始位置
  newDataSliceStart: number;
  newDataSliceEnd: number;

  // 屏幕
  screen: Screen;
  // 估计高度值
  assumedItemHeight?: number;

  // 定义特定位置的距离比例
  nearEndRatio?: number;
  nearStartRatio?: number;

  // 在特定位置触发的事件
  onAtStart?: Function;
  onNearStart?: Function;
  onNearEnd?: Function;
  onAtEnd?: Function;
}> {
  static defaultProps = {
    assumedItemHeight: 400,
    nearEndRatio: 1.75,
    nearStartRatio: 0.25
  };

  render() {
    const {
      itemRenderer,
      assumedItemHeight,
      data,
      screen,
      newDataSliceEnd,
      newDataSliceStart
    } = this.props;

    return (
      <Controller
        list={data}
        itemRenderer={itemRenderer}
        screen={screen}
        assumedItemHeight={assumedItemHeight}
        newDataSliceEnd={newDataSliceEnd}
        newDataSliceStart={newDataSliceStart}
      />
    );
  }
}
