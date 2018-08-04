import * as React from "react";
import { Movie, MovieList } from "./component";

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
    movie: Movie;
    isFetchData: boolean;
  }
> {
  state = {
    movie: new Movie({ assumedHeight: 400 }),
    isFetchData: false
  };

  addBefore = () => {
    let newData = getData(10, 200);

    this.setState({
      movie: this.state.movie.prefixFrameList(newData)
    });
  };

  addAfter = async () => {
    this.setState({
      isFetchData: true
    });

    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1500);
    });

    let newData = getData(10, 300);

    this.setState({
      isFetchData: false,
      movie: this.state.movie.appendFrameList(newData)
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
