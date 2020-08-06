import React from "react";
import { positions, Provider } from "react-alert";
import AlertTemplate from "react-alert-template-basic";
import App from "./App";
import { ErrorBoundary } from "react-error-boundary";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  "pk_test_51H9McFKtxt3kvNhb3JFchFPW2D3DSus5ZqWQyWRSi7pxFPKLgh10xui8vi62tE6VSzKcwKhzkPo4CD8EYxrvU9SO00L2aKTYsE"
);

const options = {
  timeout: 5000,
  position: positions.BOTTOM_CENTER,
  containerStyle: {
    zIndex: 10
  }
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
      <Elements stripe={stripePromise}>
        <Provider template={AlertTemplate} {...options}>
          <App />
        </Provider>
      </Elements>
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
