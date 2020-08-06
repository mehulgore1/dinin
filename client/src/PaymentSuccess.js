import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { match } from "minimatch";

const PaymentSuccess = props => {
  return <h1> Payment Succeeded. Thank You! {props.match.params.id} </h1>;
};

export default PaymentSuccess;
