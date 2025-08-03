import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "App";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import theme from "assets/theme";
import store from "../src/redux/store";

// Soft UI Context Provider
import { ArgonControllerProvider } from "context";

// react-perfect-scrollbar component
import PerfectScrollbar from "react-perfect-scrollbar";

// react-perfect-scrollbar styles
import "react-perfect-scrollbar/dist/css/styles.css";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <ThemeProvider theme={theme}>
    <Provider store={store}>
      <BrowserRouter basename="/">
        <ArgonControllerProvider>
          <PerfectScrollbar>
            <App />
          </PerfectScrollbar>
        </ArgonControllerProvider>
      </BrowserRouter>
    </Provider>
  </ThemeProvider>
);
