import React from "react";
import { hot } from "react-hot-loader";
import styled from "styled-components";
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
  private isUseWrapperDivAsScreen = false;

  public state = {
    isFetchData: false,
    movie: MovieList.createMovie(400)
  };

  public componentDidMount() {
    this.addAfter();
  }

  public render() {
    return (
      <MainWrapper>
        <div onClick={this.addBefore} className="before-button">
          click me to add item before
        </div>
        <div onClick={this.addAfter} className="after-button">
          click me to add item after
        </div>

        <div className="head">Site Head</div>

        {!this.isUseWrapperDivAsScreen && (
          <MovieList movie={this.state.movie} bufferHeightRatio={0}>
            {(item: any, index: number) => <Showcase item={item} index={index} />}
          </MovieList>
        )}

        {this.isUseWrapperDivAsScreen && (
          <MovieList
            movie={this.state.movie}
            bufferHeightRatio={0}
            useWrapperDivAsScreen={{
              className: "list"
            }}
          >
            {(item: any, index: number) => <Showcase item={item} index={index} />}
          </MovieList>
        )}

        <div
          style={{
            background: "black",
            height: "100rem"
          }}
        />
      </MainWrapper>
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

export default hot(module)(App);

const MainWrapper = styled.div`
  .head {
    display: flex;
    align-items: center;
    justify-content: center;

    color: red;
    background-color: #999;
    height: 100px;
  }

  .list {
    margin: 5rem auto;
    overflow-x: hidden;
    overflow-y: scroll;
    -webkit-overflow-scrolling: touch;
    height: calc(100vh - 300px);
  }

  .before-button {
    position: fixed;
    top: 0;
    left: 10rem;
    width: 100vm;
    height: 50px;
    cursor: pointer;
  }

  .after-button {
    position: fixed;
    top: 60px;
    left: 10rem;
    width: 100vm;
    height: 50px;
    cursor: pointer;
  }
`;
