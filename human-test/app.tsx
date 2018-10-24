import React from "react";
// tslint:disable-next-line:no-implicit-dependencies
import { hot } from "react-hot-loader";
import styled from "styled-components";
import { MovieList } from "../lib";
import { getRandomString } from "./random-id";
import { Showcase } from "./showcase";

function getData(num: number, from = 0) {
  return new Array(num).fill(1).map((_, index) => ({
    height: Math.ceil(Math.random() * 1000) + 50,
    id: getRandomString(),
    name: "test item"
  }));
}

class App extends React.PureComponent<
  {},
  {
    data: any[];
  }
> {
  public state = {
    data: getData(10, 0)
  };

  public render() {
    return (
      <MainWrapper>
        <div onClick={this.addBefore} className="before-button">
          click me to add item before
        </div>
        <div onClick={this.addAfter} className="after-button">
          click me to add item after
        </div>
        <div onClick={this.getMovie} className="get-movie-button">
          click me to get the movie
        </div>

        <div className="head">Site Head</div>

        {/* <MovieList ref={this.movieListInstanceRef} data={this.state.data} assumedHeight={400} bufferHeightRatio={0}>
          {(item: any, index: number) => <Showcase item={item} index={index} />}
        </MovieList> */}

        <MovieList
          ref={this.movieListInstanceRef}
          data={this.state.data}
          assumedHeight={400}
          bufferHeightRatio={0}
          useWrapperDivAsScreen={{
            className: "list"
          }}
        >
          {(item: any, index: number) => <Showcase item={item} index={index} />}
        </MovieList>

        <div className="footer" />
      </MainWrapper>
    );
  }

  private movie!: any;
  private movieListInstanceRef = React.createRef<MovieList>();

  private getMovie = () => {
    this.movie = this.movieListInstanceRef.current!.storeMovie();

    // tslint:disable-next-line:no-console
    console.log(this.movie);
  };

  private addBefore = () => {
    const newData = getData(10, 200);

    this.setState({
      data: newData.concat(this.state.data)
    });
  };

  private addAfter = async () => {
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });

    const newData = getData(10, 300);

    this.setState({
      data: this.state.data.concat(newData)
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
    height: 100rem;
  }

  .footer {
    display: flex;
    align-items: center;
    justify-content: center;

    color: red;
    background-color: #999;
    height: 100rem;
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
    top: 40px;
    left: 10rem;
    width: 100vm;
    height: 50px;
    cursor: pointer;
  }

  .get-movie-button {
    position: fixed;
    top: 80px;
    left: 10rem;
    width: 100vm;
    height: 50px;
    cursor: pointer;
  }
`;
