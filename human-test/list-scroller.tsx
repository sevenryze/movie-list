import React from "react";
import ReactDOM from "react-dom";
import App from "./app2";
import { createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    font-family: sans-serif;
  }

  .App__head {
    height: 200px;
    background-color: #999;
  }

  .list {
    margin: 0 auto;
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

ReactDOM.render(
  <>
    <GlobalStyle />
    <App />
  </>,
  document.getElementById("root") as HTMLElement
);
