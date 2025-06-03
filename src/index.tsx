import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import ThemeProvider from "./components/ThemeProvider";
import "@cloudscape-design/global-styles/index.css";
import ErrorBoundary from "./ErrorBoundary";

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
