import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import * as firebase from "firebase";

const WaiterRequest = props => {
  var database = firebase.database();
  const [request, setRequest] = useState("Get water");

  const handleRequestChange = event => {
    setRequest(event.target.value);
  };

  const handleSendRequest = () => {
    const requestObj = {
      table: props.match.params.table,
      request: request,
      status: ""
    };
    database
      .ref(props.match.params.restaurant)
      .child("requests")
      .push(requestObj);
  };

  return (
    <>
      <label>
        Request
        <select value={request} onChange={handleRequestChange}>
          <option value="Get water"> Get/refill water </option>
          <option value="Waiter Needed"> Call waiter over </option>
        </select>
      </label>
      <button className="btn btn-primary" onClick={handleSendRequest}>
        {" "}
        Send Request{" "}
      </button>
    </>
  );
};

export default WaiterRequest;
