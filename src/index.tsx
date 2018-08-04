import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./app";
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

ReactDOM.render(<App />, document.getElementById("root") as HTMLElement);
