import React from "react";
import ReactDOM from "react-dom";
import App from "./app";
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
