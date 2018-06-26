import * as React from "react";

export class List extends React.PureComponent<{
  // 上方留白的大小
  blankSpaceAbove: number;
  // 下方留白的大小
  blankSpaceBelow: number;
  // 要渲染的数据项列表
  list: { id: string; content: object }[];
  // 数据项的渲染函数
  itemRenderer: Function;

  // 获得已渲染帧高度表
  //getRenderedFrameMap: (heightMap: HeightMap) => void;
}> {
  // 保存当前渲染的数据项的底层DOM引用。
  private _renderedFrameRefMap: HeightMap = {};

  // 保存当前list组件的包裹DOM。
  private _wrapperViewRef = React.createRef<HTMLDivElement>();

  /**
   * 获得元素的ClientRect，位置属性相对于浏览器viewport。
   *
   * Tips: 要得到距离document初始点的距离，需要加上滑动的距离。
   *
   * @param node 需要测量的DOM元素
   * @returns {number}
   */
  static getHeightFromClientRect(node): number {
    return node ? node.getBoundingClientRect().height : 0;
  }

  getWrapperNode() {
    return this._wrapperViewRef.current;
  }

  /**
   * 获取已渲染帧的高度表
   */
  getRenderedItemHeightMap(): HeightMap {
    /**
     * 遍历list，因此id都是属于已经渲染的数据项，也就避开了ref=null的情况
     */
    return this.props.list.reduce((heightsMap, item) => {
      const id = item.id;
      const node = this._renderedFrameRefMap[id];

      heightsMap[id] = List.getHeightFromClientRect(node);
      return heightsMap;
    }, {});
  }

  render() {
    const { blankSpaceAbove, blankSpaceBelow } = this.props;

    return (
      <div
        ref={this._wrapperViewRef}
        style={{
          paddingTop: blankSpaceAbove,
          paddingBottom: blankSpaceBelow
        }}
      >
        {this.props.list.map((item, index) => {
          const id = item.id;

          // 使用用户自定义的数据项渲染函数来渲染数据。
          const reactElement = this.props.itemRenderer(item.content, index);

          return React.cloneElement(reactElement, {
            key: id,
            ref: ref => {
              this._renderedFrameRefMap[id] = ref;

              // 如果有用户自定义的ref函数，调用它。
              if ("function" === typeof reactElement.ref) {
                reactElement.ref(ref);
              }
            }
          });
        })}
      </div>
    );
  }
}

export interface HeightMap {
  [id: string]: number;
}
