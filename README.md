# 目录

# 使用方法

本组件对外暴露两个对象：`Movie`（影片）和 `MovieList`（基于影片技术的 `list`）。

在使用`MovieList`之前，我们需要通过调用`Movie`中的方法，初始化一部影片。

而`MovieList`就像我们平常使用的列表组件一样，只不过额外增加了 virtual window 的功能。

# 用法

## 使用 window 作为全局列表

```JavaScript
import * as React from "react";
import {
  MovieList,
  IMovie,
  createMovie,
  prefixFrames,
  appendFrames
} from "./component";

function getData(num, from = 0) {
  return new Array(num).fill(1).map((_, index) => ({
    content: {
      id: from + index,
      height: Math.ceil(Math.random() * 1000) + 50
    },
    height: Math.ceil(Math.random() * 1000) + 50
  }));
}

class App extends React.Component<
  {},
  {
    movie: IMovie;
    isFetchData: boolean;
  }
> {
  state = {
    movie: createMovie(400),
    isFetchData: false
  };

  addBefore = () => {
    let newData = getData(10, 200);

    this.setState({
      movie: prefixFrames(this.state.movie, newData)
    });
  };

  addAfter = async () => {
    this.setState({
      isFetchData: true
    });

    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    let newData = getData(10, 300);

    this.setState({
      isFetchData: false,
      movie: appendFrames(this.state.movie, newData)
    });
  };

  componentDidMount() {
    this.addAfter();
  }

  renderItem = (item, index) => {
    return (
      <div
        className="item"
        style={{
          //minHeight: item.height,
          ...(index % 2 !== 0 ? { backgroundColor: "#ccc" } : {})
        }}
        js-index={index}
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

        <MovieList
          movie={this.state.movie}
          itemRenderer={this.renderItem}
          bufferHeightRatio={0.5}
        />
      </div>
    );
  }
}

export default App;
```

## 使用某一个 div 作为局部列表

```JavaScript
import * as React from "react";
import {
  MovieList,
  IMovie,
  createMovie,
  prefixFrames,
  appendFrames
} from "./component";

function getData(num, from = 0) {
  return new Array(num).fill(1).map((_, index) => ({
    content: {
      id: from + index,
      height: Math.ceil(Math.random() * 1000) + 50
    },
    height: Math.ceil(Math.random() * 1000) + 50
  }));
}

class App2 extends React.Component<
  {},
  {
    movie: IMovie;
    isFetchData: boolean;
  }
> {
  state = {
    movie: createMovie(400),
    isFetchData: false
  };

  addBefore = () => {
    let newData = getData(10, 200);

    this.setState({
      movie: prefixFrames(this.state.movie, newData)
    });
  };

  addAfter = async () => {
    this.setState({
      isFetchData: true
    });

    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    let newData = getData(10, 300);

    this.setState({
      isFetchData: false,
      movie: appendFrames(this.state.movie, newData)
    });
  };

  componentDidMount() {
    this.addAfter();
  }

  renderItem = (item, index) => {
    return (
      <div
        className="item"
        style={{
          //minHeight: item.height,
          ...(index % 2 !== 0 ? { backgroundColor: "#ccc" } : {})
        }}
        js-index={index}
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

        <MovieList
          movie={this.state.movie}
          itemRenderer={this.renderItem}
          bufferHeightRatio={0}
          useDivAsScreen={{
            className: "list"
          }}
        />
      </div>
    );
  }
}

export default App2;
```

记得将设置合适的 CSS 到 .list CSS 类中:

```css
.list {
  margin: 0 auto;
  overflow-x: hidden;
  overflow-y: scroll;
  height: calc(100vh - 300px); // 设置了作为屏幕的DIV的高度
}
```

# API

This component exposes two public classes.

## `Moive`

## `MoiveList`
