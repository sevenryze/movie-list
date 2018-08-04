import * as React from "react";
import { Controller, DataItem } from "./controller";
import { Screen } from "./module/screen";
import { Condition, Trigger } from "./module/trigger";

export class SuperList extends React.PureComponent<{
  // 待渲染数据
  data: DataItem[];
  // 数据元素的渲染方式。
  itemRenderer: Function;

  // 新添加frame data的起始位置
  newDataSliceStart: number;
  newDataSliceEnd: number;

  // 屏幕
  screen: Screen;
  // 估计高度值
  assumedItemHeight?: number;
  bufferHeightRatio?: number;

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
    assumedItemHeight: 500,
    // nearEnd / screen height
    nearEndRatio: 0.25,
    nearStartRatio: 0.25,
    bufferHeightRatio: 1
  };

  private _trigger;
  private _controller;

  _handleRefUpdate = ref => {
    this._controller = ref;
  };

  /**
   *
   * 如果snapshot更新了，就调用注册的位置监听函数
   *
   * @param position
   * @private
   */
  _handleSnapshotUpdate = position => {
    if (this._trigger) {
      this._trigger.handleSnapshotUpdate(position);
    }
  };

  /**
   * 创建特定位置调用函数功能
   *
   * @param nearStartProximityRatio
   * @param nearEndProximityRatio
   * @private
   */
  private _createTrigger(nearStartProximityRatio, nearEndProximityRatio) {
    this._trigger = new Trigger([
      {
        condition: Condition.nearTop(5),
        callback: info => {
          //console.log(`At top: ${JSON.stringify(info)}`);

          return this.props.onAtStart && this.props.onAtStart(info);
        }
      },
      {
        condition: Condition.nearTopRatio(nearStartProximityRatio),
        callback: info => {
          //console.log(`Near top: ${JSON.stringify(info)}`);

          return this.props.onNearStart && this.props.onNearStart(info);
        }
      },
      {
        condition: Condition.nearBottomRatio(nearEndProximityRatio),
        callback: info => {
          //console.log(`Near bottom: ${JSON.stringify(info)}`);

          return this.props.onNearEnd && this.props.onNearEnd(info);
        }
      },
      {
        condition: Condition.nearBottom(5),
        callback: info => {
          //console.log(`At bottom: ${JSON.stringify(info)}`);

          return this.props.onAtEnd && this.props.onAtEnd(info);
        }
      }
    ]);
  }

  // only can scroll to known height item
  scrollToIndex(index) {
    if (this._controller) {
      this._controller.scrollToIndex(index);
    }
  }

  componentDidMount() {
    this._createTrigger(this.props.nearStartRatio, this.props.nearEndRatio);
  }

  componentWillReceiveProps(nextProps) {
    let preProps = this.props;

    if (
      preProps.nearStartRatio !== nextProps.nearStartRatio ||
      preProps.nearEndRatio !== nextProps.nearEndRatio
    ) {
      this._createTrigger(nextProps.nearStartRatio, nextProps.nearEndRation);
    }
  }

  render() {
    const {
      itemRenderer,
      assumedItemHeight,
      data,
      screen,
      newDataSliceEnd,
      newDataSliceStart,
      bufferHeightRatio
    } = this.props;

    return (
      <Controller
        ref={this._handleRefUpdate}
        list={data}
        itemRenderer={itemRenderer}
        screen={screen}
        assumedItemHeight={assumedItemHeight}
        newDataSliceEnd={newDataSliceEnd}
        newDataSliceStart={newDataSliceStart}
        bufferHeightRatio={bufferHeightRatio}
        onSnapshotUpdate={this._handleSnapshotUpdate}
      />
    );
  }
}
