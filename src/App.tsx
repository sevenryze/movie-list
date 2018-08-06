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
    return <Showcase item={item} index={index} />;
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

        <MovieList movie={this.state.movie} bufferHeightRatio={0.5}>
          {(item, index) => {
            return <Showcase item={item} index={index} />;
          }}
        </MovieList>
      </div>
    );
  }
}

class Showcase extends React.Component<{
  item: any;
  index: number;
}> {
  render() {
    return (
      <div
        className="item"
        style={{
          //minHeight: item.height,
          ...(this.props.index % 2 !== 0 ? { backgroundColor: "#ccc" } : {})
        }}
        js-index={this.props.index}
      >
        {this.props.index +
          ` ----------- ` +
          "好".repeat(this.props.item.height + 100)}
      </div>
    );
  }
}

export default App;
