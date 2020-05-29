import React from "react";
import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import App from "./App";

const options = {
  timeout: 3000,
  position: positions.BOTTOM_CENTER
};

const Root = () => {
  return (
    <Provider template={AlertTemplate} {...options}>
      <App />
    </Provider>
  );
};

export default Root;
