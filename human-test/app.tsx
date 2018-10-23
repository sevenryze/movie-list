import React from "react";
import { IMovie, MovieList } from "../lib";
import { Showcase } from "./showcase";

function getData(num: number, from = 0) {
  return new Array(num).fill(1).map((_, index) => ({
    content: {
      height: Math.ceil(Math.random() * 1000) + 50,
      id: from + index
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
  public state = {
    isFetchData: false,
    movie: MovieList.createMovie(400)
  };

  public componentDidMount() {
    this.addAfter();
  }

  public render() {
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
          {(item, index) => <Showcase item={item} index={index} />}
        </MovieList>
      </div>
    );
  }

  private addBefore = () => {
    const newData = getData(10, 200);

    this.setState({
      movie: MovieList.prefixFrames(this.state.movie, newData)
    });
  };

  private addAfter = async () => {
    this.setState({
      isFetchData: true
    });

    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const newData = getData(10, 300);

    this.setState({
      isFetchData: false,
      movie: MovieList.appendFrames(this.state.movie, newData)
    });
  };
}

export default App;
