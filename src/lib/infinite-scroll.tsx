// Import node.js libraries

// Import third-party libraries
import * as React from "react";
import styled from "styled-components";

// Import own libraries

/**********************************************************************************************************************/
const MainWrapper = styled.div``;

const LoadingIndicator = styled.div`
  margin: 2rem auto;
  height: 3rem;

  text-align: center;

  font-size: larger;
`;

export class InfiniteScroller extends React.PureComponent<{
  isFetching: boolean;
  loadMore: () => void;
}> {
  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);

    this.handleScroll();
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    if (
      window.innerHeight + window.scrollY >= document.body.offsetHeight - 5 &&
      !this.props.isFetching
    ) {
      this.props.loadMore();
    }
  };

  render() {
    return (
      <MainWrapper>
        {this.props.children}

        <LoadingIndicator>
          {this.props.isFetching ? "正 在 加 载..." : undefined}
        </LoadingIndicator>
      </MainWrapper>
    );
  }
}
