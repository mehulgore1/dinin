import React from "react";
import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import App from "./App";
import { ErrorBoundary } from "react-error-boundary";

const options = {
  timeout: 5000,
  position: positions.BOTTOM_CENTER
};

const myErrorHandler = (error, componentStack) => {
  console.log(error);
};

const Root = () => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={myErrorHandler}
      onReset={() => {
        // reset the state of your app so the error doesn't happen again
      }}
    >
      <Provider template={AlertTemplate} {...options}>
        <App />
      </Provider>
    </ErrorBoundary>
  );
};

function ErrorFallback({ error, componentStack, resetErrorBoundary }) {
  return (
    <div className="d-flex justify-content-center" role="alert">
      <h3>
        Oops, something went wrong! Try clicking the button below, or scan the
        QR code for your seat.
      </h3>
      <button className="btn btn-dark btn-lg" onClick={resetErrorBoundary}>
        Try again
      </button>
    </div>
  );
}

export default Root;
