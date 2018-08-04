import * as React from "react";
import * as ReactDOM from "react-dom";
import App2 from "./app2";
import { injectGlobal } from "styled-components";

injectGlobal`
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

ReactDOM.render(<App2 />, document.getElementById("root") as HTMLElement);
