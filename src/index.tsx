import * as React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";
import "./index.css";
import "./App.css";
import registerServiceWorker from "./registerServiceWorker";
import MainApp from "./main";

ReactDOM.render(<MainApp />, document.getElementById("root") as HTMLElement);
registerServiceWorker();
