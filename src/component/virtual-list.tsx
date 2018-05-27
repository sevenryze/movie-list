import * as React from "react";
import { Controller } from "./controller";
import { Screen } from "./lib/screen";

export class VirtualList extends React.PureComponent<{
  // 待渲染数据
  data: any[];
  // 数据元素的渲染方式。
  itemRenderer: Function;
  // 屏幕
  screen: Screen;
  // 估计高度值
  assumedItemHeight?: number;

  // 定义特定位置的距离比例
  nearEndProximityRatio?: number;
  nearStartProximityRatio?: number;

  // 在特定位置触发的事件
  onAtStart?: Function;
  onNearStart?: Function;
  onNearEnd?: Function;
  onAtEnd?: Function;
}> {
  static defaultProps = {
    assumedItemHeight: 400,
    nearEndProximityRatio: 1.75,
    nearStartProximityRatio: 0.25
  };

  render() {
    const { itemRenderer, assumedItemHeight, data, screen } = this.props;

    return (
      <Controller
        list={data}
        itemRenderer={itemRenderer}
        screen={screen}
        assumedItemHeight={assumedItemHeight}
      />
    );
  }
}
