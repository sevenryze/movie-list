import * as React from "react";
import { SuperList } from "./component/super-list";
import { Screen } from "./component/module/screen";
import { getRandomString } from "./component/lib/random-id";

function getData(num, from = 0) {
  return new Array(num).fill(1).map((_, index) => ({
    id: getRandomString(),
    content: {
      id: from + index,
      height: Math.ceil(Math.random() * 1000) + 50
    }
  }));
}

/**
 * dom ref的加载是在render()之后，componentDidMount()之前，因此在render()中
 * 使用wrapperNode是无效的，需要在挂载以后在触发一次render().
 *
 * 可以改进一下。
 */
class List extends React.PureComponent<
  {
    items: any[];
    renderItem: Function;
    newStart: number;
    newEnd: number;
  },
  {
    wrapperNode: any;
  }
  > {
  state = {
    wrapperNode: null
  };

  private _viewport;

  receiveRef = ref => {
    this.setState({ wrapperNode: ref });
  };

  getViewport() {
    const { wrapperNode } = this.state;

    if (!this._viewport) {
      this._viewport = new Screen(window);
    }

    // offset of virtualScrollerComponent top to window top.
    this._viewport.setOffsetTop(200);
    return this._viewport;
  }

  render() {
    const { wrapperNode } = this.state;

    const { items, renderItem } = this.props;

    /**
     * 确定wrapperNode的实际dom ref有效才渲染
     */
    return (
      <div className="list" ref={this.receiveRef}>
        {wrapperNode ? (
          <SuperList
            data={items}
            itemRenderer={renderItem}
            screen={this.getViewport()}
            newDataSliceStart={this.props.newStart}
            newDataSliceEnd={this.props.newEnd}
          />
        ) : null}
      </div>
    );
  }
}

class App extends React.Component<
  {},
  {
    data: any[];
    newStart: number;
    newEnd: number;
  }
  > {
  state = {
    data: getData(20),
    newStart: 0,
    newEnd: 0
  };

  addBefore = () => {
    let newData = getData(10, 200);

    let slice = {
      start: 0,
      end: newData.length
    };

    this.setState({
      data: newData.concat(this.state.data),
      newStart: slice.start,
      newEnd: slice.end
    });
  };

  addAfter = () => {
    let newData = getData(10, 300);

    let slice = {
      start: this.state.data.length,
      end: this.state.data.length + newData.length
    };

    this.setState({
      data: this.state.data.concat(newData),
      newStart: slice.start,
      newEnd: slice.end
    });
  };

  renderItem = (item, index) => {
    return (
      <div
        className="item"
        style={{
          //minHeight: item.height,
          ...(index % 2 !== 0 ? { backgroundColor: "#ccc" } : {})
        }}
        js-id={item.id}
      >
        {index + ` ----------- ` + "好".repeat(item.height + 100)}
      </div>
    );
  };

  render() {
    return (
      <div className="App">
        <div onClick={this.addBefore} className="before-button">
          click me to add item before
        </div>
        <div onClick={this.addAfter} className="after-button">
          click me to add item after
        </div>

        <div className="App__head">Site Head</div>
        <List
          items={this.state.data}
          renderItem={this.renderItem}
          newStart={this.state.newStart}
          newEnd={this.state.newEnd}
        />
      </div>
    );
  }
}

export default App;
